const sequelize = require('../config/database');
const Blog = require('../models/Blog');

const blogs = [
  {
    serviceId: 'visuels',
    title: 'Le Design Graphique : Premier Pilier de Confiance à Makamba',
    content: `À Makamba, l'image de marque est votre première poignée de main avec le client. Chez **Kora Agency**, nous créons des visuels qui ne se contentent pas d'être beaux ; ils sont stratégiques.

## Pourquoi un visuel pro change tout ?
Un client qui voit une affiche pixelisée ou mal cadrée associera cette négligence à vos produits. Nous utilisons la psychologie des couleurs et des compositions modernes pour garantir que votre entreprise soit perçue comme la référence à Makamba.

![IMAGE:/media/visuels.jpg]

### Nos spécialités :
- Affiches promotionnelles pour événements locaux.
- Posts réseaux sociaux haute définition.
- Identité visuelle complète (Logos, Chartes).`,
    tags: ['Design', 'Image de Marque', 'Makamba'],
    readingTime: 5,
    author: 'Expert Design Kora'
  },
  {
    serviceId: 'publications',
    title: 'Stratégies de Visibilité Sociale : Spécial Makamba & Bururi',
    content: `Pour réussir sa transformation digitale à **Makamba**, il ne suffit plus d'être présent sur les réseaux sociaux ; il faut dominer le récit local. Chez **Kora Agency**, nous analysons les comportements des consommateurs pour créer des campagnes qui résonnent.

![IMAGE:/media/social-posts.jpg]

## 1. L'Impact du Storytelling Local
À Makamba, la confiance se bâtit sur la proximité. Nos publications mettent en avant l'authenticité de vos produits, qu'il s'agisse d'artisanat, de services hôteliers ou de commerce.`,
    tags: ['Makamba', 'Social Media', 'Burundi'],
    readingTime: 6,
    author: 'Expert Makamba'
  },
  {
    serviceId: 'calendrier',
    title: 'Planifier pour Réussir : Votre Calendrier de Publication 7j',
    content: `Le secret des plus grandes marques ? La régularité. À Makamba, une présence quotidienne sur Facebook et WhatsApp renforce votre autorité.

## Une Stratégie sans Failles
Nous concevons votre calendrier éditorial sur 7 jours pour que vous n'ayez plus jamais à vous demander "Quoi poster aujourd'hui ?". 

![IMAGE:/media/content-plan.jpg]

### Ce que nous planifions :
- Jours de promotions.
- Contenus éducatifs sur vos produits.
- Moments d'échange avec votre communauté de Makamba.`,
    tags: ['Organisation', 'Stratégie', 'Contenu'],
    readingTime: 4,
    author: 'Stratege Kora'
  },
  {
    serviceId: 'whatsapp',
    title: 'WhatsApp Business : Automatisez votre Accueil à Makamba',
    content: `Vos clients à Makamba utilisent WhatsApp plus que n'importe quelle autre application. Êtes-vous prêt à leur répondre 24h/24 ?

## L'IA au service de votre Relation Client
Nos scripts de réponses automatiques permettent de qualifier vos prospects même pendant que vous dormez. Un client servi instantanément est un client conquis.

![IMAGE:/media/whatsapp-bot.jpg]

### Vos avantages :
- Gain de temps massif.
- Zéro client oublié.
- Image professionnelle et réactive.`,
    tags: ['Automation', 'WhatsApp', 'Makamba'],
    readingTime: 5,
    author: 'Expert Automation Kora'
  },
  {
    serviceId: 'google',
    title: 'Google Maps : Le Levier de Croissance pour Makamba',
    content: `Saviez-vous que la majorité des voyageurs arrivant à **Makamba** utilisent Google Maps pour trouver un hôtel ou un restaurant ? Si vous n'êtes pas dans le "Top 3 Local", vous n'existez pas.

![IMAGE:/media/google-maps.jpg]

## Dominer la Recherche Locale
L'optimisation pour Makamba demande une précision géographique. Kora Agency transforme votre fiche Google Business en un véritable aimant à clients.`,
    tags: ['SEO Local', 'Makamba', 'Google'],
    readingTime: 5,
    author: 'Consultant SEO Kora'
  },
  {
    serviceId: 'airbnb',
    title: 'Boostez vos Réservations Airbnb à Makamba et Nyanza-Lac',
    content: `Le secteur du tourisme à **Makamba** et autour du lac est en pleine mutation. Pour attirer les voyageurs, votre annonce Airbnb doit être impeccable.

![IMAGE:/media/airbnb-expert.jpg]

## L'Excellence Hospitalière Digitale
Nous révisons vos descriptions pour capturer la magie de vos hébergements. De la vue sur les collines au confort moderne, chaque détail compte pour vos futurs hôtes.`,
    tags: ['Airbnb', 'Hospitalité', 'Makamba'],
    readingTime: 6,
    author: 'Expert Travel Kora'
  },
  {
    serviceId: 'tiktok',
    title: 'TikTok & Reels : Devenez Viral à Makamba',
    content: `La vidéo est le format roi. À Makamba, TikTok explose. Kora Agency vous donne les clés pour créer des contenus qui font le buzz.

## Capturer l'Attention en 3 Secondes
Nous rédigeons vos scripts et préparons vos idées de vidéos pour que votre marque devienne la tendance numéro 1 dans la région.

![IMAGE:/media/tiktok-viral.jpg]`,
    tags: ['TikTok', 'Vidéos', 'Viralité'],
    readingTime: 4,
    author: 'Créateur Kora'
  },
  {
    serviceId: 'bundle',
    title: 'Le Pack Agence : Votre Transformation Digitale Complète',
    content: `Le pack ultime pour les entrepreneurs ambitieux de Makamba. Site vitrine, marketing complet et suivi IA pendant 6 mois.

## Pourquoi choisir le Bundle ?
C'est la solution tout-en-un. Vous ne gérez plus 10 prestataires, mais une seule agence partenaire qui s'occupe de tout votre écosystème digital.

![IMAGE:/media/agency-pack.jpg]`,
    tags: ['Pack Pro', 'Succès', 'Makamba'],
    readingTime: 8,
    author: 'Direction Kora Agency'
  },
  {
      serviceId: 'ia_assistant',
      title: 'Kora AI Assistant : 30 Jours d\'Autopilote Marketing',
      content: `L\'avenir du marketing est ici. Notre technologie IA publie pour vous pendant 1 mois complet.

## Comment ça marche ?
Notre IA analyse votre secteur à Makamba et génère des posts pertinents qui se publient seuls. Vous gardez le contrôle, l'IA fait le travail.

![IMAGE:/media/ai-assistant.jpg]`,
      tags: ['IA', 'Futur', 'Automatisation'],
      readingTime: 6,
      author: 'Ingénieur IA Kora'
  }
];

async function run() {
  try {
    await sequelize.sync();
    for (const b of blogs) {
      await Blog.destroy({ where: { serviceId: b.serviceId } });
      await Blog.create(b);
    }
    console.log('--- TOUS LES BLOGS PREMIUM COMPLÉTÉS ---');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
