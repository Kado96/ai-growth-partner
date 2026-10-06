/**
 * sync_sequelize_models.js
 * Synchronise toutes les données locales de database.sqlite3 vers Supabase (PostgreSQL).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[SYNC] ❌ DATABASE_URL manquante dans .env.production');
  process.exit(1);
}

const sqliteDB = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite3'),
  logging: false
});

const postgresDB = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log(' 🚀 SYNC SEQUELIZE DYNAMIQUE SQLite → Supabase (PostgreSQL)');
  console.log('════════════════════════════════════════════════════════');

  await sqliteDB.authenticate();
  console.log('[SYNC] ✅ SQLite locale authentifiée.');

  await postgresDB.authenticate();
  console.log('[SYNC] ✅ Supabase PostgreSQL authentifiée.');

  // Tables SQLite
  const [tables] = await sqliteDB.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const sqliteTables = tables.map(t => t.name);

  // Tables PostgreSQL (Public schema)
  const [pgTablesResult] = await postgresDB.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
  );
  const pgTables = pgTablesResult.map(t => t.table_name);

  console.log(`[SYNC] Tables SQLite disponibles : ${sqliteTables.join(', ')}`);
  console.log(`[SYNC] Tables Supabase disponibles : ${pgTables.join(', ')}\n`);

  for (const sqTable of sqliteTables) {
    // Trouver la table cible dans Postgres (insensible à la casse / pluriel)
    let targetPgTable = pgTables.find(t => t.toLowerCase() === sqTable.toLowerCase());
    if (!targetPgTable) {
      targetPgTable = pgTables.find(t => t.toLowerCase() === (sqTable + 's').toLowerCase() || (t + 's').toLowerCase() === sqTable.toLowerCase());
    }

    if (!targetPgTable) {
      console.log(`[SYNC] ⚠️  Pas de table correspondante sur Supabase pour '${sqTable}' (ignorée).`);
      continue;
    }

    console.log(`[SYNC] 🔄 Synchronisation : SQLite '${sqTable}' ➔ Supabase '${targetPgTable}'`);

    // Récupérer la structure des colonnes Supabase
    const [pgColsInfo] = await postgresDB.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = :tableName
    `, { replacements: { tableName: targetPgTable } });

    const pgColsMap = {};
    pgColsInfo.forEach(c => {
      pgColsMap[c.column_name] = c.data_type;
    });

    // Récupérer les données SQLite
    const [rows] = await sqliteDB.query(`SELECT * FROM "${sqTable}"`);
    if (!rows || rows.length === 0) {
      console.log(`[SYNC]  ℹ️  Table '${sqTable}' vide.`);
      continue;
    }

    let inserted = 0, updated = 0, errors = 0;

    for (const row of rows) {
      const cleanRecord = {};

      for (const [col, val] of Object.entries(row)) {
        // Trouver la colonne Postgres correspondante
        const pgColName = Object.keys(pgColsMap).find(c => c.toLowerCase() === col.toLowerCase());
        if (!pgColName) continue;

        const dataType = pgColsMap[pgColName];

        if (val === null || val === undefined) {
          cleanRecord[pgColName] = null;
        } else if (dataType === 'boolean') {
          cleanRecord[pgColName] = val === 1 || val === '1' || val === true || val === 'true';
        } else if (dataType.includes('json')) {
          if (typeof val === 'string') {
            try {
              cleanRecord[pgColName] = JSON.parse(val);
            } catch (e) {
              cleanRecord[pgColName] = val;
            }
          } else {
            cleanRecord[pgColName] = val;
          }
        } else {
          cleanRecord[pgColName] = val;
        }
      }

      if (!cleanRecord.id && !cleanRecord.key) {
        continue;
      }

      const primaryKeyCol = cleanRecord.id !== undefined ? 'id' : 'key';

      try {
        const [existing] = await postgresDB.query(
          `SELECT "${primaryKeyCol}" FROM "${targetPgTable}" WHERE "${primaryKeyCol}" = :pkVal`,
          { replacements: { pkVal: cleanRecord[primaryKeyCol] } }
        );

        if (existing && existing.length > 0) {
          // UPDATE
          const setClauses = Object.keys(cleanRecord)
            .filter(k => k !== primaryKeyCol)
            .map(k => `"${k}" = :${k}`)
            .join(', ');

          if (setClauses) {
            await postgresDB.query(
              `UPDATE "${targetPgTable}" SET ${setClauses} WHERE "${primaryKeyCol}" = :${primaryKeyCol}`,
              { replacements: cleanRecord }
            );
            updated++;
          }
        } else {
          // INSERT
          const cols = Object.keys(cleanRecord).map(k => `"${k}"`).join(', ');
          const vals = Object.keys(cleanRecord).map(k => `:${k}`).join(', ');

          await postgresDB.query(
            `INSERT INTO "${targetPgTable}" (${cols}) VALUES (${vals})`,
            { replacements: cleanRecord }
          );
          inserted++;
        }
      } catch (rowErr) {
        console.error(`[SYNC]  ❌ Erreur id/key=${cleanRecord[primaryKeyCol]} : ${rowErr.message}`);
        errors++;
      }
    }

    console.log(`[SYNC]  ✅ ${sqTable} ➔ ${targetPgTable} : ${inserted} insérés, ${updated} mis à jour, ${errors} erreurs.`);
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log(' 🎉 SYNCHRONISATION SQLITE → SUPABASE TERMINÉE AVEC SUCCÈS !');
  console.log('════════════════════════════════════════════════════════\n');

  await sqliteDB.close();
  await postgresDB.close();
}

main().catch(err => {
  console.error('[SYNC] ❌ Erreur fatale :', err);
  process.exit(1);
});
