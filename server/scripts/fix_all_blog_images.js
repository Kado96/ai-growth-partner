/**
 * fix_all_blog_images.js
 * Inserer une image au debut du contenu de chaque blog par service
 */
const path = require('path');
const { Sequelize } = require('sequelize');

const DB_PATH = path.join(__dirname, '../database.sqlite3');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: DB_PATH, logging: false });

const SERVICE_IMAGES = {
  'communication-digitale': '/media/communication-digitale.png',
  'developpement-web': '/media/developpement-web.png',
  'developpement-applications-android': '/media/developpement-mobile.png',
  'apps-android': '/media/developpement-mobile.png',
  'ia-en-kirundi': '/media/ia-en-kirundi.png',
  'ia-kirundi': '/media/ia-en-kirundi.png',
  'marketplace': '/media/marketplace.png',
  'collecte-donnees-et-suivi-evaluation': '/media/collecte-donnees.png',
  'collecte-enquetes-se': '/media/collecte-donnees.png',
  'solutions-gestion': '/media/solutions-gestion.png',
  'quicksales': '/media/solutions-gestion.png'
};

(async () => {
  await sequelize.authenticate();
  console.log('✅ SQLite connecté\n');

  const [blogs] = await sequelize.query('SELECT id, slug, serviceId, content FROM Blogs');

  for (const blog of blogs) {
    const targetImg = SERVICE_IMAGES[blog.serviceId] || SERVICE_IMAGES[blog.slug];
    if (!targetImg) {
      console.log(`⚠️ Pas d'image trouvee pour serviceId: ${blog.serviceId} / slug: ${blog.slug}`);
      continue;
    }

    // Remplacer ou prepend la premiere photo pour garantir que c'est celle du service
    let content = blog.content || '';
    
    // Nettoyer toute balise d'image existante au tout debut si présente
    content = content.replace(/^!\[IMAGE-[A-Z]+:.*?\]\s*/i, '');
    content = content.replace(/^!\[.*?\]\(.*?\)\s*/, '');

    const newContent = `![IMAGE-CENTER:${targetImg}]\n\n${content}`;

    await sequelize.query(
      'UPDATE Blogs SET content = ?, updatedAt = ? WHERE id = ?',
      { replacements: [newContent, new Date().toISOString(), blog.id] }
    );
    console.log(`✅ Blog #${blog.id} (${blog.slug}) -> image mis à jour: ${targetImg}`);
  }

  await sequelize.close();
  console.log('\n🎉 Mise à jour de toutes les images de blogs terminée !');
})();
