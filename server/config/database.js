const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';

let sequelize;

if (environment === 'production' || process.env.DATABASE_URL) {
  // Production (Supabase Postgres)
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
} else {
  // Local (SQLite)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite3'),
    logging: false
  });
}

module.exports = sequelize;
