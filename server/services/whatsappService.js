const axios = require('axios');
require('dotenv').config();

/**
 * Service de notification WhatsApp Direct (API Meta Cloud officielle)
 */
const sendWhatsApp = async (message) => {
    try {
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const recipientPhone = "25779928864"; // Votre numéro par défaut

        if (!accessToken || !phoneId || phoneId.includes('#')) {
            console.log("[WhatsApp_SKIP] Configuration Meta manquante (Token ou Phone ID).");
            console.log(`[WhatsApp_LOG] Message simulé : ${message}`);
            return false;
        }

        console.log(`[WhatsApp_SEND] Envoi via Meta Cloud API...`);

        const data = {
            messaging_product: "whatsapp",
            to: recipientPhone,
            type: "text",
            text: {
                body: message
            }
        };

        const config = {
            method: 'post',
            url: `https://graph.facebook.com/v18.0/${phoneId}/messages`,
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios(config);
        
        if (response.data && response.data.messages) {
            console.log(`[WhatsApp_SUCCESS] Message envoyé avec succès (ID: ${response.data.messages[0].id})`);
            return true;
        } else {
            console.error("[WhatsApp_ERROR] Réponse inattendue de Meta :", response.data);
            return false;
        }
    } catch (err) {
        console.error("[WhatsApp_CRITICAL_ERROR] Échec de l'envoi Meta :", err.response ? err.response.data : err.message);
        return false;
    }
};

module.exports = { sendWhatsApp };
