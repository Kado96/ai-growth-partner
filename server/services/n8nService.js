const axios = require('axios');
const Setting = require('../models/Setting');

/**
 * Service pour envoyer des données à n8n (Social Media Automation)
 */
const sendToN8N = async (topic, data) => {
    try {
        // Tentative de récupération depuis la DB
        let webhookUrl = process.env.N8N_WEBHOOK_URL;
        
        try {
            const setting = await Setting.findByPk('n8n_webhook_url');
            if (setting && setting.value) webhookUrl = setting.value;
        } catch (dbErr) {
            console.log("[n8n] Impossible de lire la DB, repli sur ENV.");
        }
        
        if (!webhookUrl) {
            console.log(`[n8n_SKIP] Pas d'URL Webhook configurée pour le sujet: ${topic}`);
            return false;
        }

        console.log(`[n8n_SEND] Envoi à n8n pour le sujet: ${topic}...`);
        
        const payload = {
            topic,
            timestamp: new Date().toISOString(),
            data: {
                ...data,
                source: "Kora Agency Core",
                siteUrl: process.env.FRONTEND_URL || "https://koragency.netlify.app"
            }
        };

        const response = await axios.post(webhookUrl, payload, {
            timeout: 10000 // 10s max
        });

        console.log(`[n8n_SUCCESS] Réponse reçue de n8n.`);
        return true;
    } catch (err) {
        console.error(`[n8n_ERROR] Échec de l'envoi à n8n:`, err.message);
        return false;
    }
};

module.exports = { sendToN8N };
