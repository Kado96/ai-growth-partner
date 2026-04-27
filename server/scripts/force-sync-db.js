const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const Content = require('../models/Content');

const CONFIG_PATH = path.join(__dirname, '../config.json');

async function sync() {
  try {
    console.log('[SYNC] Connecting to database...');
    await sequelize.sync();

    console.log('[SYNC] Reading config.json...');
    const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    console.log('[SYNC] Purging and Updating Database...');
    
    // Cleanup old 'services' section if any (to avoid pollution)
    await Content.destroy({ where: { section: 'services' } });
    await Content.destroy({ where: { section: 'news' } });

    // For each section in config.json
    for (const [sectionKey, sectionData] of Object.entries(configData)) {
      if (sectionKey === 'news') {
        // Special case for news array
        console.log(`[SYNC] Updating section: ${sectionKey} (Array)`);
        const items = Array.isArray(sectionData) ? sectionData : [];
        for (let i = 0; i < items.length; i++) {
          await Content.create({
            section: 'news',
            name: `news_${i}`,
            title: items[i].title || '',
            description: items[i].text || '',
            metadata: items[i]
          });
        }
      } else {
        // General sections (including 'services' as a whole object)
        console.log(`[SYNC] Updating section: ${sectionKey} (Object/General)`);
        const existing = await Content.findOne({ where: { section: 'general', name: sectionKey }});
        
        if (existing) {
          await existing.update({ 
            title: sectionData.title || sectionKey,
            description: sectionData.description || '',
            metadata: sectionData 
          });
        } else {
          await Content.create({
            section: 'general',
            name: sectionKey,
            title: sectionData.title || sectionKey,
            description: sectionData.description || '',
            metadata: sectionData
          });
        }
      }
    }

    console.log('[SYNC] SUCCESS: Database is now perfectly aligned with config.json');
    process.exit(0);
  } catch (error) {
    console.error('[SYNC] FAILED:', error);
    process.exit(1);
  }
}

sync();
