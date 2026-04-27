const axios = require('axios');
const path = require('path');
// Le fichier .env.production est dans le dossier 'server/'
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

async function check() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ Erreur: GEMINI_API_KEY non trouvée dans .env.production");
        console.log("Chemin tenté:", path.join(__dirname, '.env.production'));
        return;
    }
    console.log("Checking API Key:", key.substring(0, 10) + "...");
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await axios.get(url);
        console.log("✅ Modèles disponibles :");
        response.data.models.forEach(m => console.log(` - ${m.name}`));
    } catch (e) {
        console.error("❌ Erreur Directe API:", e.response ? e.response.data : e.message);
    }
}

check();
