const sequelize = require('../config/database');
const Content = require('../models/Content');

async function dump() {
    try {
        await sequelize.authenticate();
        const contents = await Content.findAll();
        console.log(JSON.stringify(contents, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

dump();
