/**
 * sync_to_supabase.js
 * Synchronise les données locales (SQLite) vers Supabase (PostgreSQL).
 * Usage : node server/scripts/sync_to_supabase.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { Sequelize } = require('sequelize');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !DATABASE_URL) {
  console.error('[SYNC] ❌ Variables manquantes dans .env.production (SUPABASE_URL, SUPABASE_KEY, DATABASE_URL)');
  process.exit(1);
}

// -- Connexions --
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const localDB = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite3'),
  logging: false
});

const prodDB = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

async function syncTable(tableName) {
  console.log(`\n[SYNC] 🔄 Synchronisation de la table : ${tableName}`);
  try {
    const [rows] = await localDB.query(`SELECT * FROM "${tableName}"`);
    if (!rows || rows.length === 0) {
      console.log(`[SYNC]  ℹ️  Table vide : ${tableName}`);
      return;
    }

    // Vérifier que la table existe en production
    const [tables] = await prodDB.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=:name`,
      { replacements: { name: tableName } }
    );

    if (tables.length === 0) {
      console.log(`[SYNC]  ⚠️  Table absente en production : ${tableName} (ignorée)`);
      return;
    }

    let inserted = 0, updated = 0, errors = 0;

    for (const row of rows) {
      try {
        // Check if row exists (by id)
        const [existing] = await prodDB.query(
          `SELECT id FROM "${tableName}" WHERE id = :id`,
          { replacements: { id: row.id } }
        );

        if (existing.length > 0) {
          // UPDATE
          const setClauses = Object.keys(row)
            .filter(k => k !== 'id')
            .map(k => `"${k}" = :${k}`)
            .join(', ');

          if (setClauses) {
            await prodDB.query(
              `UPDATE "${tableName}" SET ${setClauses} WHERE id = :id`,
              { replacements: row }
            );
            updated++;
          }
        } else {
          // INSERT
          const cols = Object.keys(row).map(k => `"${k}"`).join(', ');
          const vals = Object.keys(row).map(k => `:${k}`).join(', ');
          await prodDB.query(
            `INSERT INTO "${tableName}" (${cols}) VALUES (${vals})`,
            { replacements: row }
          );
          inserted++;
        }
      } catch (rowErr) {
        console.error(`[SYNC]  ❌ Erreur ligne id=${row.id}: ${rowErr.message}`);
        errors++;
      }
    }

    console.log(`[SYNC]  ✅ ${tableName}: ${inserted} insérés, ${updated} mis à jour, ${errors} erreurs.`);
  } catch (err) {
    console.error(`[SYNC]  ❌ Erreur table ${tableName}:`, err.message);
  }
}

async function main() {
  console.log('════════════════════════════════════════');
  console.log(' 🚀 SYNC SQLite → Supabase (PostgreSQL)');
  console.log('════════════════════════════════════════');

  try {
    await localDB.authenticate();
    console.log('[SYNC] ✅ Connexion SQLite locale OK');

    await prodDB.authenticate();
    console.log('[SYNC] ✅ Connexion PostgreSQL Supabase OK');
  } catch (err) {
    console.error('[SYNC] ❌ Erreur de connexion:', err.message);
    process.exit(1);
  }

  // Tables à synchroniser (dans l'ordre des dépendances)
  const tables = ['Settings', 'Medias', 'Blogs', 'ContactMessages', 'Contents', 'Knowledges', 'Visitors'];

  for (const table of tables) {
    await syncTable(table);
  }

  console.log('\n════════════════════════════════════════');
  console.log(' ✅ SYNCHRONISATION TERMINÉE');
  console.log('════════════════════════════════════════\n');

  await localDB.close();
  await prodDB.close();
}

main().catch(err => {
  console.error('[SYNC] Erreur fatale:', err);
  process.exit(1);
});
