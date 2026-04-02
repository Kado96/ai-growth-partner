require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAI() {
    console.log("--- 🧠 TEST DE L'IA ALEXA (GEMINI) ---");
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'votre_cle_gemini_ici') {
        console.error("❌ ERREUR : GEMINI_API_KEY non configurée dans .env");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log("📡 Connexion à l'IA en cours...");
        const result = await model.generateContent("Bonjour Alexa, confirme-moi que tu es opérationnelle pour Kora Agency.");
        const response = result.response.text();
        
        console.log("✅ RÉPONSE DE L'IA :");
        console.log("--------------------------------------------------");
        console.log(response);
        console.log("--------------------------------------------------");
        console.log("🚀 Alexa est prête pour la production !");
    } catch (error) {
        console.error("❌ ÉCHEC DU TEST IA :");
        console.error(error.message);
        if (error.message.includes("API key not valid")) {
            console.log("💡 CONSEIL : Votre clé API semble invalide. Vérifiez qu'il n'y a pas d'espace en trop dans le fichier .env.");
        }
    }
}

testAI();
