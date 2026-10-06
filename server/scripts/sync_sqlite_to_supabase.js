/**
 * sync_sqlite_to_supabase.js
 * Synchronise les données de SQLite vers Supabase PostgreSQL.
 * Gère la conversion des types (Integer -> Boolean, etc.)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[SYNC] ❌ DATABASE_URL manquante dans .env.production');
  process.exit(1);
}

// Connexions
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

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log(' 🚀 SYNC SÉCURISÉE SQLite → Supabase (PostgreSQL)');
  console.log('════════════════════════════════════════════════════════');

  await localDB.authenticate();
  console.log('[SYNC] ✅ SQLite Locale connectée.');
  await prodDB.authenticate();
  console.log('[SYNC] ✅ Supabase PostgreSQL connectée.');

  // Récupérer toutes les tables SQLite réelles
  const [tables] = await localDB.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tableNames = tables.map(t => t.name);

  console.log(`[SYNC] Tables SQLite trouvées : ${tableNames.join(', ')}\n`);

  for (const table of tableNames) {
    console.log(`[SYNC] 🔄 Traitement de la table : ${table}`);

    // Récupérer la structure des colonnes de la table en prod (Postgres)
    const [prodColsInfo] = await prodDB.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = :table
    `, { replacements: { table } });

    if (!prodColsInfo || prodColsInfo.length === 0) {
      console.log(`[SYNC]  ⚠️  Table '${table}' absente en prod (Supabase). Ignorée.`);
      continue;
    }

    const colTypes = {};
    prodColsInfo.forEach(c => {
      colTypes[c.column_name] = c.data_type;
    });

    // Récupérer les lignes SQLite
    const [rows] = await localDB.query(`SELECT * FROM "${table}"`);
    if (!rows || rows.length === 0) {
      console.log(`[SYNC]  ℹ️  Table '${table}' est vide en local.`);
      continue;
    }

    let inserted = 0, updated = 0, errors = 0;

    for (const row of rows) {
      // Normalisation des types pour PostgreSQL
      const cleanRow = {};
      for (const [col, val] of Object.entries(row)) {
        if (!colTypes[col]) continue; // ignorer colonnes qui n'existent pas en prod

        const targetType = colTypes[col];

        if (targetType === 'boolean') {
          cleanRow[col] = val === 1 || val === '1' || val === true || val === 'true';
        } else if (val === null || val === undefined) {
          cleanRow[col] = null;
        } else if (targetType.includes('json')) {
          try {
            cleanRow[col] = typeof val === 'string' ? JSON.parse(val) : val;
          } catch (e) {
            cleanRow[col] = val;
          }
        } else {
          cleanRow[col] = val;
        }
      }

      try {
        // Vérifier si la ligne existe déjà en prod par id
        const [existing] = await prodDB.query(`SELECT id FROM "${table}" WHERE id = :id`, {
          replacements: { id: cleanRow.id }
        });

        if (existing && existing.length > 0) {
          // UPDATE
          const setClauses = Object.keys(cleanRow)
            .filter(k => k !== 'id')
            .map(k => `"${k}" = :${k}`)
            .join(', ');

          if (setClauses) {
            await prodDB.query(`UPDATE "${table}" SET ${setClauses} WHERE id = :id`, {
              replacements: cleanRow
            });
            updated++;
          }
        } else {
          // INSERT
          const cols = Object.keys(cleanRow).map(k => `"${k}"`).join(', ');
          const vals = Object.keys(cleanRow).map(k => `:${k}`).join(', ');

          await prodDB.query(`INSERT INTO "${table}" (${cols}) VALUES (${vals})`, {
            replacements: cleanRow
          });
          inserted++;
        }
      } catch (err) {
        console.error(`[SYNC]  ❌ Erreur id=${cleanRow.id} dans ${table}: ${err.message}`);
        errors++;
      }
    }

    console.log(`[SYNC]  ✅ ${table} : ${inserted} insérés, ${updated} mis à jour, ${errors} erreurs.`);
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log(' 🎉 SYNCHRONISATION SQLITE → SUPABASE REUSSIE !');
  console.log('════════════════════════════════════════════════════════\n');

  await localDB.close();
  await prodDB.close();
}

main().catch(err => {
  console.error('[SYNC] ❌ Erreur globale :', err);
  process.exit(1);
});
