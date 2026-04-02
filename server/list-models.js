require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    console.log("--- 📡 DIAGNOSTIC DES MODÈLES GEMINI ---");
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // On teste d'abord gemini-1.5-flash (Standard)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test connection");
        console.log("✅ MODÈLE 'gemini-1.5-flash' : OK");
        console.log("Réponse :", result.response.text());
    } catch (e) {
        console.log("❌ ÉCHEC 'gemini-1.5-flash' :", e.message);
        console.log("Tentative avec 'gemini-pro'...");
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Test connection");
            console.log("✅ MODÈLE 'gemini-pro' : OK");
            console.log("Réponse :", result.response.text());
        } catch (e2) {
            console.log("❌ ÉCHEC 'gemini-pro' :", e2.message);
        }
    }
}

listModels();
