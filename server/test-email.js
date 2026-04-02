require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function test() {
    console.log("--- 📧 TEST DE CONNEXION GMAIL ---");
    console.log("Utilisateur :", process.env.EMAIL_USER);
    console.log("Mot de passe (Taille) :", (process.env.EMAIL_PASS || "").length, "caractères");

    try {
        await transporter.verify();
        console.log("✅ CONNEXION RÉUSSIE : Le serveur Gmail accepte vos identifiants.");
        
        const info = await transporter.sendMail({
            from: `"Test Kora" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "✔ Test de Configuration Kora Agency",
            text: "Ceci est un test pour confirmer que votre agence peut envoyer des emails. Tout fonctionne !",
            html: "<b>Ceci est un test pour confirmer que votre agence peut envoyer des emails. Tout fonctionne !</b>"
        });
        
        console.log("✅ EMAIL DE TEST ENVOYÉ : Vérifiez votre boîte de réception !");
        console.log("ID Message :", info.messageId);
    } catch (error) {
        console.error("❌ ÉCHEC DU TEST :");
        console.error(error.message);
        if (error.message.includes("Invalid login")) {
            console.log("\n💡 CONSEIL : Vérifiez que 'EMAIL_PASS' est bien un MOT DE PASSE D'APPLICATION Google (16 caractères) et non votre mot de passe habituel.");
        }
    }
}

test();
