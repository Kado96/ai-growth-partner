const { scanMediaFolder } = require('./mediaCollector');
const sequelize = require('../config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

async function run() {
    try {
        console.log("[INIT] Synchronisation du média...");
        await sequelize.sync();
        const result = await scanMediaFolder();
        console.log("[DONE] Résultat:", result);
        process.exit(0);
    } catch (err) {
        console.error("[CRITICAL]", err);
        process.exit(1);
    }
}

run();
