
const sequelize = require('./config/database');
const Blog = require('./models/Blog');

async function seed() {
  try {
    await sequelize.sync();
    const testBlog = await Blog.create({
      slug: 'test-ia-growth',
      serviceId: 'digital-marketing',
      title: 'L\'IA au service de votre croissance digitale 🚀',
      content: '# Pourquoi l\'IA change tout en 2024\n\nL\'intelligence artificielle n\'est plus un gadget, c\'est un levier de croissance massif pour les agences digitales.\n\n![Marketing Image](https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800)\n\nChez Kora Agency, nous utilisons Gemini pour booster vos résultats.',
      tags: ['IA', 'Marketing', 'Automation'],
      readingTime: 4
    });
    console.log('Article de test créé avec succès ! ID:', testBlog.id);
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la création de l\'article:', err);
    process.exit(1);
  }
}

seed();
