/**
 * AlexaBrain — moteur conversationnel hybride (avec ou sans LLM)
 *
 * Inspiré de :
 * - KukasokoBrainService (BM25 + détection d'intention)
 * - Okapi BM25 / wink-bm25-text-search (recherche documentaire)
 * - Pipelines RAG (intent → retrieve → répondre)
 *
 * Pipeline :
 * 1. Détecter l'intention
 * 2. Retriever BM25 sur Knowledge + Services + Blogs
 * 3. Composer une réponse hors-ligne
 * 4. Optionnel : reformuler avec Gemini si dispo
 */

const Knowledge = require('../models/Knowledge');
const Blog = require('../models/Blog');

const BM25_K1 = 1.5;
const BM25_B = 0.75;
const CACHE_TTL_MS = 2 * 60 * 1000;
const CONTACT_WA = '+257 79 92 88 64';

const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'en', 'et', 'ou', 'mais',
  'donc', 'or', 'ni', 'car', 'ce', 'cet', 'cette', 'ces', 'mon', 'ma', 'mes',
  'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs',
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se',
  'y', 'par', 'sur', 'sous', 'dans', 'avec', 'pour', 'que', 'qui', 'quoi',
  'dont', 'est', 'sont', 'a', 'au', 'aux', 'pas', 'ne', 'si', 'plus',
  'tres', 'bien', 'aussi', 'the', 'and', 'for', 'with', 'from', 'this', 'that',
]);

const INTENTS = {
  GREETING: 'GREETING',
  THANKS: 'THANKS',
  PRAISE: 'PRAISE',
  JOKE: 'JOKE',
  IDENTITY: 'IDENTITY',
  LANGUAGE: 'LANGUAGE',
  SERVICES: 'SERVICES',
  PRICE: 'PRICE',
  CONTACT: 'CONTACT',
  HOW_TO: 'HOW_TO',
  DETAILED: 'DETAILED',
  UNKNOWN: 'UNKNOWN',
};

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text = '') {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function bm25Score(queryTokens, docTokens, avgDocLen, docCount, df) {
  const docLen = docTokens.length || 1;
  const freq = new Map();
  for (const t of docTokens) freq.set(t, (freq.get(t) || 0) + 1);

  let score = 0;
  for (const qt of queryTokens) {
    const tf = freq.get(qt) || 0;
    if (!tf) continue;
    const n = df.get(qt) || 0;
    const idf = Math.log((docCount - n + 0.5) / (n + 0.5) + 1);
    const numerator = tf * (BM25_K1 + 1);
    const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLen / avgDocLen));
    score += idf * (numerator / denominator);
  }
  return score;
}

class AlexaBrain {
  constructor() {
    this.docs = [];
    this.tokenizedDocs = [];
    this.df = new Map();
    this.avgDocLen = 1;
    this.lastLoad = 0;
    this.loading = null;
  }

  invalidate() {
    this.lastLoad = 0;
    this.docs = [];
  }

  async ensureIndex(config) {
    const now = Date.now();
    if (this.docs.length && now - this.lastLoad < CACHE_TTL_MS) return;
    if (this.loading) return this.loading;
    this.loading = this._rebuild(config).finally(() => {
      this.loading = null;
    });
    return this.loading;
  }

  async _rebuild(config) {
    const docs = [];
    const services = config?.services?.items || [];

    for (const s of services) {
      docs.push({
        type: 'service',
        id: s.id,
        title: s.title,
        body: [s.title, s.description, s.category, ...(s.questions || [])].filter(Boolean).join(' '),
        meta: {
          price: s.price || 0,
          category: s.category,
          description: s.description,
        },
      });
    }

    try {
      const knowledge = await Knowledge.findAll();
      for (const k of knowledge) {
        docs.push({
          type: 'knowledge',
          id: k.id,
          title: k.title,
          body: [k.title, k.content, k.category].filter(Boolean).join(' '),
          meta: { category: k.category || 'général', content: k.content },
        });
      }
    } catch (e) {
      console.warn('[AlexaBrain] Knowledge:', e.message);
    }

    try {
      const blogs = await Blog.findAll({ limit: 40 });
      for (const b of blogs) {
        docs.push({
          type: 'blog',
          id: b.id,
          title: b.title,
          body: [b.title, b.content?.slice(0, 800), ...(b.tags || [])].filter(Boolean).join(' '),
          meta: {
            slug: b.slug,
            serviceId: b.serviceId,
            excerpt: (b.content || '').slice(0, 220),
          },
        });
      }
    } catch (e) {
      console.warn('[AlexaBrain] Blog:', e.message);
    }

    docs.push(
      {
        type: 'faq',
        id: 'faq-contact',
        title: 'Contact Kora Agency',
        body: 'contact whatsapp telephone email devis rendez vous joindre equipe kora agency',
        meta: {
          content: `Vous pouvez nous joindre sur WhatsApp au **${CONTACT_WA}**, ou via le formulaire de devis sur le site.`,
        },
      },
      {
        type: 'faq',
        id: 'faq-devis',
        title: 'Demander un devis',
        body: 'devis gratuit estimation tarif proposition commerciale demande devis',
        meta: {
          content:
            "Avec plaisir. Vous pouvez demander un devis depuis le bouton **Devis** du site, ou m'indiquer votre besoin pour que je vous oriente.",
        },
      }
    );

    this.docs = docs;
    this._buildBm25();
    this.lastLoad = Date.now();
    console.log(`[AlexaBrain] Index BM25 prêt — ${docs.length} documents`);
  }

  _buildBm25() {
    this.tokenizedDocs = this.docs.map((d) => tokenize(`${d.title} ${d.body}`));
    this.df = new Map();
    let totalLen = 0;
    for (const doc of this.tokenizedDocs) {
      totalLen += doc.length;
      const seen = new Set();
      for (const t of doc) {
        if (seen.has(t)) continue;
        seen.add(t);
        this.df.set(t, (this.df.get(t) || 0) + 1);
      }
    }
    this.avgDocLen = this.tokenizedDocs.length ? totalLen / this.tokenizedDocs.length : 1;
  }

  detectIntent(input) {
    const n = normalize(input);
    if (/\b(bonjour|bonsoir|salut|hello|hi|hey|good morning|good evening|mwiriwe|amakuru)\b/.test(n)) {
      return INTENTS.GREETING;
    }
    if (/\b(merci|thanks|thank you|murakoze)\b/.test(n)) return INTENTS.THANKS;
    if (/\b(bravo|felicit|excellent|super|genial|formidable|impressive|great job)\b/.test(n)) {
      return INTENTS.PRAISE;
    }
    if (/\b(blague|joke|rire|dr[oô]le|humour)\b/.test(n)) return INTENTS.JOKE;
    if (/\b(tu es humaine|tu es un robot|es[- ]tu une ia|who are you|qui es[- ]tu|tu es intelligente|are you (ai|human|a bot))\b/.test(n)) {
      return INTENTS.IDENTITY;
    }
    if (/\b(anglais|english|kirundi|langue|language|speak|parle)\b/.test(n)) {
      return INTENTS.LANGUAGE;
    }
    if (/\b(whatsapp|contact|telephone|appeler|joindre|email|mail)\b/.test(n)) {
      return INTENTS.CONTACT;
    }
    if (/\b(prix|tarif|cout|combien|budget|price|cost|devis)\b/.test(n)) {
      return INTENTS.PRICE;
    }
    if (/\b(detail|detaille|explique|explication|comment|how to|pourquoi|etapes)\b/.test(n)) {
      return INTENTS.HOW_TO;
    }
    if (/\b(service|offre|solution|site web|android|marketplace|enquete|suivi|evaluation|quicksales|kirundi|communication|reseaux)\b/.test(n)) {
      return INTENTS.SERVICES;
    }
    if (tokenize(input).length >= 2) return INTENTS.DETAILED;
    return INTENTS.UNKNOWN;
  }

  search(query, { types = null, topK = 6 } = {}) {
    const queryTokens = tokenize(query);
    if (!queryTokens.length) return [];

    const scored = [];
    for (let i = 0; i < this.docs.length; i++) {
      const doc = this.docs[i];
      if (types && !types.includes(doc.type)) continue;
      const score = bm25Score(
        queryTokens,
        this.tokenizedDocs[i],
        this.avgDocLen,
        this.docs.length,
        this.df
      );
      const titleTokens = new Set(tokenize(doc.title));
      let boost = 0;
      for (const qt of queryTokens) if (titleTokens.has(qt)) boost += 1.2;
      const finalScore = score + boost;
      if (finalScore > 0) scored.push({ doc, score: finalScore });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => ({ ...s.doc, score: Number(s.score.toFixed(3)) }));
  }

  _knowledgeBySubject(partialTitle) {
    const n = normalize(partialTitle);
    return this.docs.find(
      (d) => d.type === 'knowledge' && normalize(d.title).includes(n)
    );
  }

  _topServices(query, limit = 3) {
    return this.search(query, { types: ['service'], topK: limit });
  }

  _formatPrice(price) {
    if (!price || Number(price) <= 0) return 'sur devis';
    return `à partir de **${Number(price).toLocaleString('fr-FR')} FBU**`;
  }

  composeOffline(message, intent, hits, history = []) {
    const suggestions = [];
    let answer = '';
    const services = hits.filter((h) => h.type === 'service');
    const knowledge = hits.filter((h) => h.type === 'knowledge');
    const blogs = hits.filter((h) => h.type === 'blog');

    switch (intent) {
      case INTENTS.GREETING:
        answer =
          "Bienvenue chez **Kora Agency**. Je suis **Alexa**, votre concierge digital. C'est un honneur de vous accueillir. Comment puis-je vous être utile aujourd'hui ?";
        suggestions.push('Présentez-moi vos services', 'Je souhaite un site web', 'Demander un devis');
        break;

      case INTENTS.THANKS:
        answer =
          "Je vous en prie. C'est un plaisir de vous accompagner. Souhaitez-vous que je vous oriente vers un autre sujet ?";
        suggestions.push('Nos services', 'Contact WhatsApp');
        break;

      case INTENTS.PRAISE: {
        const k = this._knowledgeBySubject('felicit') || this._knowledgeBySubject('Savoir 43');
        answer =
          (k?.meta?.content ||
            'Merci beaucoup pour votre confiance. Cela nous touche sincèrement. Puis-je faire autre chose pour vous ?').replace(
            /^Réponse type\s*:\s*/i,
            ''
          );
        suggestions.push('Nos services', 'Demander un devis');
        break;
      }

      case INTENTS.JOKE: {
        const jokes = [
          'Pourquoi les développeurs préfèrent le dark mode ? Parce que la lumière attire les bugs.',
          'Un site web entre dans un bar… le serveur dit : « 404, table introuvable ».',
          "Chez nous, même les bugs ont droit à un accueil 5 étoiles… avant d'être corrigés.",
        ];
        answer = `${jokes[Math.floor(Math.random() * jokes.length)]}\n\nSinon, puis-je vous aider sur un besoin concret pour Kora Agency ?`;
        suggestions.push('Nos services', 'Site web', 'Enquêtes');
        break;
      }

      case INTENTS.IDENTITY: {
        const human = this._knowledgeBySubject('humaine') || this._knowledgeBySubject('Savoir 46');
        const smart = this._knowledgeBySubject('intelligente') || this._knowledgeBySubject('Savoir 45');
        if (/\bhumaine|human|robot|bot\b/.test(normalize(message))) {
          answer =
            human?.meta?.content ||
            "Non. Je suis une assistante virtuelle basée sur l'intelligence artificielle, conçue pour assister les utilisateurs de Kora Agency.";
        } else {
          answer =
            smart?.meta?.content ||
            "Je suis une assistante virtuelle basée sur l'intelligence artificielle. Mon objectif est de vous aider rapidement et correctement.";
        }
        answer = answer.replace(/^Réponse type\s*:\s*/i, '');
        suggestions.push('Que pouvez-vous faire ?', 'Nos services');
        break;
      }

      case INTENTS.LANGUAGE: {
        const n = normalize(message);
        if (/\benglish|anglais\b/.test(n)) {
          answer = 'I can assist you in English. How may I help you today with Kora Agency services?';
        } else if (/\bkirundi\b/.test(n)) {
          answer =
            'Nshobora kukubwira mu Kirundi igihe bisanzwe. Ni gute nagufasha kuri Kora Agency uyu munsi?';
        } else {
          answer =
            "Je communique principalement en **français**. Je peux aussi répondre en **anglais**, et en **kirundi** lorsque c'est possible. Dans quelle langue préférez-vous poursuivre ?";
        }
        break;
      }

      case INTENTS.CONTACT: {
        const faq = this.docs.find((d) => d.id === 'faq-contact');
        answer = faq?.meta?.content || `Vous pouvez nous joindre sur WhatsApp au **${CONTACT_WA}**.`;
        suggestions.push('Demander un devis', 'Nos services');
        break;
      }

      case INTENTS.PRICE: {
        const priced = this._topServices(message, 3);
        if (priced.length >= 1) {
          const best = priced[0];
          const second = priced[1];
          if (!second || (best.score || 0) >= (second.score || 0) * 1.15) {
            answer = `Pour **${best.title}**, nos interventions sont établies **${this._formatPrice(best.meta.price)}**, selon votre périmètre. Je ne publie aucun tarif inventé. Souhaitez-vous un devis personnalisé ?`;
            suggestions.push('Demander un devis', 'Détails du service', 'Contact WhatsApp');
            break;
          }
        }
        // fall through to services logic
      }

      case INTENTS.SERVICES:
      case INTENTS.HOW_TO:
      case INTENTS.DETAILED:
      default: {
        if (services.length === 1) {
          const s = services[0];
          answer = `Permettez-moi de vous orienter vers **${s.title}** : ${s.meta.description || 'un accompagnement sur mesure'}. Tarif : ${this._formatPrice(s.meta.price)}. Souhaitez-vous un devis ou plus de détails ?`;
          suggestions.push('Demander un devis', 'Autres services', 'Contact WhatsApp');
        } else if (services.length >= 2) {
          const a = services[0];
          const b = services[1];
          answer = `Deux pistes me semblent pertinentes : **${a.title}**, ou **${b.title}**. Qu'est-ce qui compte le plus pour vous — digitaliser, communiquer, ou mesurer des résultats ?`;
          suggestions.push(a.title, b.title, 'Demander un devis');
        } else if (knowledge.length > 0) {
          const top = knowledge[0];
          answer = `${String(top.meta.content || '').replace(/^Réponse type\s*:\s*/i, '')}\n\nPuis-je préciser un point, ou vous orienter vers un service Kora Agency ?`;
          suggestions.push('Nos services', 'Contact WhatsApp');
        } else if (blogs.length > 0) {
          const b = blogs[0];
          answer = `Voici un article utile : **${b.title}**. Vous pouvez le lire sur /blog/${b.meta.serviceId || b.meta.slug}. Souhaitez-vous que je vous présente aussi un service adapté ?`;
          suggestions.push('Nos services', 'Demander un devis');
        } else {
          const unknown =
            this._knowledgeBySubject('information inconnue') ||
            this._knowledgeBySubject('Savoir 42');
          answer =
            (unknown?.meta?.content ||
              "Je ne dispose pas de cette information dans ma base. Je peux transmettre votre demande à l'équipe.") +
            `\n\nContact : WhatsApp **${CONTACT_WA}**.`;
          suggestions.push('Présentez-moi vos services', 'Contact WhatsApp', 'Demander un devis');
        }

        if (
          history.length > 0 &&
          /\b(comment|explique|suite|detail)\b/.test(normalize(message)) &&
          services[0]
        ) {
          const s = services[0];
          answer = `Avec plaisir. Pour **${s.title}**, nous commençons par comprendre vos objectifs, puis nous concevons la solution. ${s.meta.description || ''} Ensuite, nous validons ensemble le devis. Souhaitez-vous démarrer par un bref échange ?`;
        }
        break;
      }
    }

    return {
      answer: answer.trim(),
      suggestions: suggestions.slice(0, 4),
      intent,
      hits: hits.slice(0, 5).map((h) => ({
        type: h.type,
        id: h.id,
        title: h.title,
        score: h.score,
      })),
      contextForLlm: this._buildLlmContext(hits, intent),
    };
  }

  _buildLlmContext(hits, intent) {
    const lines = [`Intention détectée : ${intent}`];
    for (const h of hits.slice(0, 6)) {
      if (h.type === 'service') {
        lines.push(
          `Service: ${h.title} (id=${h.id}) — ${h.meta.description || ''} — prix=${h.meta.price || 0}`
        );
      } else if (h.type === 'knowledge') {
        lines.push(`Savoir: ${h.title} — ${h.meta.content}`);
      } else if (h.type === 'blog') {
        lines.push(`Article: ${h.title} (/blog/${h.meta.serviceId || h.meta.slug})`);
      } else {
        lines.push(`FAQ: ${h.title} — ${h.meta.content || ''}`);
      }
    }
    const rules = this.docs.filter(
      (d) =>
        d.type === 'knowledge' &&
        ['alexa-rules', 'alexa-conversation', 'alexa-langues'].includes(d.meta.category)
    );
    if (rules.length) {
      lines.push('Règles Alexa (obligatoires) :');
      for (const r of rules.slice(0, 12)) {
        lines.push(`- ${r.title}: ${r.meta.content}`);
      }
    }
    return lines.join('\n');
  }

  async answer(message, config, history = []) {
    await this.ensureIndex(config);
    const intent = this.detectIntent(message);

    let hits = [];
    if ([INTENTS.SERVICES, INTENTS.PRICE, INTENTS.HOW_TO].includes(intent)) {
      hits = [
        ...this._topServices(message, 4),
        ...this.search(message, { types: ['knowledge', 'blog', 'faq'], topK: 4 }),
      ];
    } else if (intent === INTENTS.DETAILED || intent === INTENTS.UNKNOWN) {
      hits = this.search(message, { topK: 8 });
    } else if (intent === INTENTS.CONTACT) {
      hits = this.search(message, { types: ['faq', 'knowledge'], topK: 3 });
    } else {
      hits = this.search(message, { types: ['knowledge', 'service'], topK: 5 });
    }

    const seen = new Set();
    hits = hits.filter((h) => {
      const key = `${h.type}:${h.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return this.composeOffline(message, intent, hits, history);
  }
}

module.exports = {
  AlexaBrain,
  alexaBrain: new AlexaBrain(),
  INTENTS,
  normalize,
  tokenize,
};
