require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testFinal() {
    console.log("--- 🕵️ DIAGNOSTIC MODÈLE GLOBAL ---");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const m of models) {
        try {
            console.log(`Tentative avec '${m}'...`);
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Test");
            console.log(`✅ SUCCÈS avec '${m}' !`);
            console.log("Réponse :", result.response.text());
            return;
        } catch (e) {
            console.log(`❌ Échec '${m}' :`, e.message);
        }
    }
    console.error("⛔ TOUS LES MODÈLES ONT ÉCHOUÉ. Vérifiez si l'API Gemini est activée sur votre compte Google AI Studio.");
}

testFinal();
