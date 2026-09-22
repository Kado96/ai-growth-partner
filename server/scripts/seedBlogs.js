/**
 * 📝 SCRIPT DE CRÉATION ET SEED DES ARTICLES DE BLOG (NOTAMMENT IA KIRUNDI)
 */

const sequelize = require('../config/database');
const Blog = require('../models/Blog');

const articles = [
  {
    slug: 'ia-kirundi',
    serviceId: 'ia-kirundi',
    title: 'L\'Intelligence Artificielle en Kirundi : Révolutionner la Communication et la Technologie au Burundi',
    readingTime: 6,
    tags: ['IA', 'Kirundi', 'Innovation', 'NLP', 'Burundi', 'Automation'],
    author: 'Kora Agency Tech Lead',
    content: `![IA Kirundi Kora Agency](https://sxtnrfzhwgjmzxzztoij.supabase.co/storage/v1/object/public/media/hero-ai.jpg)

# L'Intelligence Artificielle en Kirundi : Révolutionner la Communication et la Technologie au Burundi

À l'ère de la transformation numérique mondiale, l'accès à la technologie dans la langue maternelle est un levier majeur d'inclusion socio-économique. Chez **Kora Agency**, nous développons des modèles et des intégrations d'**Intelligence Artificielle générative bilingue (Kirundi / Français)** conçus spécifiquement pour le marché burundais et la sous-région.

---

## 🚀 Pourquoi l'IA en Kirundi est une opportunité unique ?

### 1. Inclusion Digitale et Accessibilité
La majorité de la population et des clients au Burundi s'expriment plus naturellement en Kirundi. Offrir un agent conversationnel (Chatbot WhatsApp, Web, SMS) capable de comprendre les nuances, proverbes et termes du quotidien en Kirundi permet d'engager 100% de votre audience sans barrière linguistique.

### 2. Service Client & Support 24/7
Imaginez un assistant virtuel capable d'accueillir vos clients en Kirundi sur votre site web ou WhatsApp, d'expliquer vos services, de calculer un devis ou d'enregistrer une commande à toute heure du jour ou de la nuit.

### 3. Automatisation des Enquêtes & Collecte de Données
Pour les ONG et institutions d'enquêtes (S&E / KoboToolbox), l'IA en Kirundi permet la traduction automatique des questionnaires, la retranscription d'interviews vocales et l'analyse de sentiment en langue nationale.

---

## 🛠️ Les Solutions IA Kirundi par Kora Agency

- **Chatbot WhatsApp & Web Bilingue** : Réponse instantanée aux questions fréquentes en Kirundi et en Français.
- **API NLP Kirundi** : Modèle d'analyse textuelle adapté au Kirundi moderne.
- **Synthèse & Reconnaissance Vocale** : Conversion de la voix Kirundi en texte pour le dépouillement d'enquêtes terrain.

---

## 📈 Comment intégrer l'IA Kirundi dans votre entreprise ?

Contactez dès aujourd'hui **Kora Agency** sur WhatsApp au **+257 79 92 88 64** ou via notre formulaire de devis en ligne pour une démonstration sur mesure.`
  },
  {
    slug: 'communication-digitale',
    serviceId: 'communication-digitale',
    title: 'Comment Dominer les Réseaux Sociaux au Burundi en 2026',
    readingTime: 5,
    tags: ['Marketing', 'Social Media', 'Facebook', 'TikTok', 'Burundi'],
    author: 'Kora Agency Social Media Manager',
    content: `![Social Media Kora Agency](https://sxtnrfzhwgjmzxzztoij.supabase.co/storage/v1/object/public/media/social-posts.jpg)

# Comment Dominer les Réseaux Sociaux au Burundi en 2026

Le paysage digital burundais évolue rapidement avec une forte pénétration de TikTok, Facebook et Instagram. Pour capter l'attention des prospects, les entreprises doivent adopter une stratégie de contenu vidéo locale et engageante.

## 💡 3 Piliers pour réussir :
1. **Contenu Vidéo court (Reels/TikTok)** avec storytelling local.
2. **Réponse rapide via WhatsApp Business** et Chatbot IA.
3. **Publicités ciblées géolocalisées** à Bujumbura et dans les provinces.

Faites confiance à **Kora Agency** pour gérer votre communication digitale de A à Z !`
  },
  {
    slug: 'developpement-web',
    serviceId: 'developpement-web',
    title: 'Créer un Site Web Haute Performance : Le Guide Ultime',
    readingTime: 5,
    tags: ['Web', 'SEO', 'React', 'FastAPI'],
    author: 'Kora Agency Web Architect',
    content: `![Développement Web Kora Agency](https://sxtnrfzhwgjmzxzztoij.supabase.co/storage/v1/object/public/media/service-automation.png)

# Créer un Site Web Haute Performance : Le Guide Ultime

Un site web moderne ne doit pas être une simple vitrine statique : il doit être un générateur de prospects actif 24h/24.

Chez **Kora Agency**, nous développons des applications Web ultra-rapides, sécurisées et optimisées pour le référencement Google (SEO) avec intégration de paiement mobile (AfriPay, Lumicash, Ecocash).`
  }
];

async function seedBlogs() {
  try {
    await sequelize.sync();
    for (const data of articles) {
      const existing = await Blog.findOne({ where: { slug: data.slug } });
      if (!existing) {
        await Blog.create(data);
        console.log(`✅ Article créé : /blog/${data.slug}`);
      } else {
        await existing.update(data);
        console.log(`🔄 Article mis à jour : /blog/${data.slug}`);
      }
    }
    console.log('🎉 Seed des articles de blog terminé !');
  } catch (err) {
    console.error('❌ Erreur seed blogs :', err.message);
  }
}

if (require.main === module) {
  seedBlogs().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedBlogs };
