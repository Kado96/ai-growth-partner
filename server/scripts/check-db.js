const sequelize = require('../config/database');
const Content = require('../models/Content');

async function check() {
  try {
    const services = await Content.findOne({ where: { section: 'general', name: 'services' } });
    console.log('--- SERVICES CONFIG (FROM DB) ---');
    console.log(JSON.stringify(services.metadata, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
