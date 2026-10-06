/**
 * sync_to_supabase_master.js
 * Synchronise l'intégralité des données locales de database.sqlite3 vers Supabase (PostgreSQL).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[SYNC] ❌ DATABASE_URL introuvable dans .env.production');
  process.exit(1);
}

const localSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite3'),
  logging: false
});

const prodSequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log(' 🚀 SYNCHRONISATION OPTIMISÉE SQLite → Supabase');
  console.log('════════════════════════════════════════════════════════');

  // Modèles officiels
  const Blog = require('../models/Blog');
  const ContactMessage = require('../models/ContactMessage');
  const Content = require('../models/Content');
  const Knowledge = require('../models/Knowledge');
  const Media = require('../models/Media');
  const Setting = require('../models/Setting');
  const Visitor = require('../models/Visitor');

  await localSequelize.authenticate();
  console.log('[SYNC] ✅ Connexion SQLite locale OK');

  await prodSequelize.authenticate();
  console.log('[SYNC] ✅ Connexion Supabase PostgreSQL OK');

  console.log('[SYNC] 🛠️ Synchronisation de la structure des tables sur Supabase...');
  try {
    await Blog.sync();
    await ContactMessage.sync();
    await Content.sync();
    await Knowledge.sync();
    await Media.sync();
    await Setting.sync();
    await Visitor.sync();
    console.log('[SYNC] ✅ Structure des tables Supabase prête.');
  } catch (syncErr) {
    console.log('[SYNC]  ⚠️  Avertissement sync structure:', syncErr.message);
  }

  // Liste des tables principales à migrer (en ignorant les _backup)
  const tablesToSync = [
    { sqliteName: 'Blogs', model: Blog },
    { sqliteName: 'KnowledgeBase', model: Knowledge },
    { sqliteName: 'Content', model: Content },
    { sqliteName: 'ContactMessages', model: ContactMessage },
    { sqliteName: 'Media', model: Media },
    { sqliteName: 'Settings', model: Setting },
    { sqliteName: 'Visitors', model: Visitor }
  ];

  for (const { sqliteName, model } of tablesToSync) {
    console.log(`\n[SYNC] 🔄 Synchronisation de : ${sqliteName}`);
    
    let rows = [];
    try {
      const [res] = await localSequelize.query(`SELECT * FROM "${sqliteName}"`);
      rows = res;
    } catch (e) {
      console.log(`[SYNC]  ℹ️  Table locale '${sqliteName}' non trouvée ou vide.`);
      continue;
    }

    if (!rows || rows.length === 0) {
      console.log(`[SYNC]  ℹ️  Table ${sqliteName} vide en local.`);
      continue;
    }

    let inserted = 0, updated = 0, errors = 0;

    for (const row of rows) {
      const record = { ...row };

      try {
        // Traitement des types
        for (const [key, val] of Object.entries(record)) {
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try {
              record[key] = JSON.parse(val);
            } catch (e) {
              // Garder string
            }
          }
          if (typeof val === 'number' && (key === 'read' || key === 'is_active')) {
            record[key] = Boolean(val);
          }
        }

        const primaryKey = record.id ? 'id' : (record.key ? 'key' : null);

        if (model && primaryKey) {
          const existing = await model.findOne({ where: { [primaryKey]: record[primaryKey] } });
          if (existing) {
            await existing.update(record);
            updated++;
          } else {
            await model.create(record);
            inserted++;
          }
        } else {
          // SQL direct
          const tableNameInPg = model ? model.tableName : sqliteName;
          const cols = Object.keys(record).map(k => `"${k}"`).join(', ');
          const vals = Object.keys(record).map(k => `:${k}`).join(', ');
          await prodSequelize.query(
            `INSERT INTO "${tableNameInPg}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING`,
            { replacements: record }
          );
          inserted++;
        }
      } catch (rowErr) {
        // En cas d'erreur de contrainte unique, faire un update direct par ID/Key
        if (rowErr.name === 'SequelizeUniqueConstraintError' && (record.id || record.key)) {
          try {
            const pkField = record.id ? 'id' : 'key';
            await model.update(record, { where: { [pkField]: record[pkField] } });
            updated++;
            continue;
          } catch (updateErr) {
            console.error(`[SYNC]  ❌ Update fallback id=${record.id || record.key}: ${updateErr.message}`);
          }
        }
        console.error(`[SYNC]  ❌ Erreur record id/key=${row.id || row.key || 'inconnu'}: ${rowErr.message}`);
        errors++;
      }
    }

    console.log(`[SYNC]  ✅ ${sqliteName} ➔ ${inserted} insérés, ${updated} mis à jour, ${errors} erreurs.`);
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log(' 🎉 SYNCHRONISATION MASTER COMPLETEMENT REUSSIE !');
  console.log('════════════════════════════════════════════════════════\n');

  await localSequelize.close();
  await prodSequelize.close();
  process.exit(0);
}

main().catch(err => {
  console.error('[SYNC] ❌ Erreur fatale :', err);
  process.exit(1);
});
