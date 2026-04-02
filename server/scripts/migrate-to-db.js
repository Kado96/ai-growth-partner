const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const Content = require('../models/Content');
const Media = require('../models/Media');

const CONFIG_PATH = path.join(__dirname, '../config.json');

async function migrate() {
  try {
    console.log('Connecting to database...');
    // Sync DB (creates tables if they don't exist)
    await sequelize.sync({ force: false });

    console.log('Reading config.json...');
    const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    // Migrate content
    console.log('Migrating Content...');
    for (const [sectionKey, sectionData] of Object.entries(configData)) {
      if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
        // Find existing to avoid duplicates if re-run
        const existing = await Content.findOne({ where: { section: 'general', name: sectionKey }});
        if (!existing) {
          await Content.create({
            section: 'general',
            name: sectionKey,
            title: sectionData.title || sectionKey,
            description: sectionData.description || '',
            metadata: sectionData
          });
        }
      } else if (Array.isArray(sectionData)) {
        // e.g. services array
        for (let i = 0; i < sectionData.length; i++) {
          const item = sectionData[i];
          const itemName = item.id || item.title || `${sectionKey}_${i}`;
          
          const existing = await Content.findOne({ where: { section: sectionKey, name: itemName }});
          if (!existing) {
            await Content.create({
              section: sectionKey,
              name: itemName,
              title: item.title || '',
              description: item.description || '',
              metadata: item
            });
          }
        }
      }
    }

    console.log('Migration Successfully Completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
