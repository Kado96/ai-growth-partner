const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production with Postgres (Supabase)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
  console.log('[DB] Connexion PostgreSQL (Supabase) configurée.');
} else {
  // Fallback SQLite (Local ou Prod sans DATABASE_URL)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite3'),
    logging: false
  });
  console.log('[DB] Connexion SQLite locale configurée.');
}

module.exports = sequelize;
