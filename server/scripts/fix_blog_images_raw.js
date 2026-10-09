/**
 * fix_blog_images_raw.js
 * Insère la 1ère image au début des blogs sans photo — via SQL brut
 */
const path = require('path');
const { Sequelize } = require('sequelize');

const DB_PATH = path.join(__dirname, '../database.sqlite3');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: DB_PATH, logging: false });

// Mapping slug → image à injecter si le contenu n'en a pas
const FIXES = [
  // marketplace
  { slug: 'marketplace',   image: '/media/marketplace.png' },
  { slug: 'marketplace-2', image: '/media/marketplace.png' },
  // solutions-gestion
  { slug: 'solutions-gestion',   image: '/media/solutions-gestion.png' },
  { slug: 'solutions-gestion-2', image: '/media/solutions-gestion.png' },
  // collecte-donnees
  { slug: 'collecte-donnees-et-suivi-evaluation',   image: '/media/collecte-donnees.png' },
  { slug: 'collecte-donnees-et-suivi-evaluation-2', image: '/media/collecte-donnees.png' },
  // communication-digitale (blogs secondaires)
  { slug: 'communication-digitale-2', image: '/media/8d32bb64-76a4-47ad-bb3d-1fa58c28b218.png' },
  { slug: 'communication-digitale-3', image: '/media/8d32bb64-76a4-47ad-bb3d-1fa58c28b218.png' },
  // ia-en-kirundi (blog secondaire)
  { slug: 'ia-en-kirundi-2', image: '/media/ia-en-kirundi.png' },
];

function hasImage(content) {
  return /!\[IMAGE-[A-Z]+:.*?\]/i.test(content) || /!\[.*?\]\(.*?\)/.test(content);
}

(async () => {
  await sequelize.authenticate();
  console.log('✅ SQLite connecté\n');

  // Lister tous les blogs
  const [blogs] = await sequelize.query('SELECT id, slug, content FROM Blogs');
  console.log(`📋 ${blogs.length} blogs trouvés en base\n`);

  for (const fix of FIXES) {
    const blog = blogs.find(b => b.slug === fix.slug);
    if (!blog) {
      console.log(`⚠️  Blog introuvable: ${fix.slug}`);
      continue;
    }

    if (hasImage(blog.content || '')) {
      console.log(`✓ ${fix.slug} — déjà une image, skip`);
      continue;
    }

    const newContent = `![IMAGE-CENTER:${fix.image}]\n\n${blog.content || ''}`;
    await sequelize.query(
      'UPDATE Blogs SET content = ?, updatedAt = ? WHERE slug = ?',
      { replacements: [newContent, new Date().toISOString(), fix.slug] }
    );
    console.log(`✅ ${fix.slug} — image insérée: ${fix.image}`);
  }

  await sequelize.close();
  console.log('\n🎉 Correction terminée !');
})();
