const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// -- Database & Media config --
const sequelize = require('./config/database');
const mediaRoutes = require('./routes/mediaRoutes');

// Synchroniser la DB au démarrage (Ne pas utiliser force:true en prod)
sequelize.sync({ alter: false }).then(() => {
    console.log("[INIT] Base de données Sequelize synchronisée.");
}).catch(err => {
    console.error("[CRITICAL] Erreur de synchronisation DB:", err);
});

const app = express();
const PORT = process.env.PORT || 5001;

// Configuration CORS hautement flexible pour la production
app.use(cors());
app.use(express.json());

// Logger de diagnostic
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

let supabase = null;
try {
    supabase = require('./supabaseClient');
    console.log("[INIT] Supabase client checked.");
} catch (e) {
    console.error("[CRITICAL] Failed to load Supabase client:", e.message);
}

const CONFIG_FILE = path.join(__dirname, 'config.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

const DEFAULT_CONFIG = {
    branding: { name: "Kora Agency", description: "votre partenaire de croissance digitale.", motto: "L'excellence par l'automatisation." },
    services: { items: [] },
    about: { methodology: [] }
};

const Content = require('./models/Content');

const getConfig = async () => {
    // Priority 1: SQLite (or Postgres) DB via Sequelize
    try {
        const contents = await Content.findAll();
        if (contents.length > 0) {
            const config = { news: [] };
            for (const item of contents) {
                if (item.section === 'general') {
                    config[item.name] = item.metadata;
                } else if (item.section === 'news') {
                    config.news.push(item.metadata);
                }
            }
            return config;
        }
    } catch (e) {
        console.error("[CONFIG] Erreur BDD:", e.message);
    }

    // Priority 2: Local JSON Fallback
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const localData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            return localData;
        }
    } catch (e) { console.error("[CONFIG] Erreur lecture config.json:", e.message); }

    return DEFAULT_CONFIG;
};

const saveConfig = async (updatedConfig) => {
    try {
        for (const [key, value] of Object.entries(updatedConfig)) {
            if (Array.isArray(value)) {
                // e.g. news
                await Content.destroy({ where: { section: key }});
                for (let i = 0; i < value.length; i++) {
                    await Content.create({ section: key, name: `${key}_${i}`, metadata: value[i] });
                }
            } else {
                // e.g. branding, hero, services, about, footer
                const existing = await Content.findOne({ where: { section: 'general', name: key }});
                if (existing) {
                    await existing.update({ metadata: value });
                } else {
                    await Content.create({ section: 'general', name: key, metadata: value });
                }
            }
        }
        // Backup local JSON
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Error saving DB config", e);
        return false;
    }
};

const getTransactions = async () => {
    if (supabase) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
        if (!error) return data;
    }
    // Fallback JSON
    try {
        if (fs.existsSync(TRANSACTIONS_FILE)) {
            return JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
        }
    } catch (e) { console.error("Error reading local transactions", e); }
    return [];
};

const upsertTransaction = async (txn) => {
    if (supabase) {
        const { error } = await supabase
            .from('transactions')
            .upsert(txn);
        if (!error) return true;
    }
    // Fallback JSON
    try {
        let transactions = [];
        if (fs.existsSync(TRANSACTIONS_FILE)) {
            transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
        }
        const idx = transactions.findIndex(t => t.id === txn.id);
        if (idx >= 0) transactions[idx] = { ...transactions[idx], ...txn };
        else transactions.unshift(txn);
        fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Error saving local transaction", e);
        return false;
    }
};

// Logger simple
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.status(200).send('Proxy Backend Kora Agency : OK');
});

// --- Media Routes & Static Server ---
app.use('/api/media', mediaRoutes);

// Servir les médias locaux
const mediaPath = path.join(__dirname, 'media');
if (fs.existsSync(mediaPath)) {
    app.use('/media', express.static(mediaPath));
}

// --- Administration Routes ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'donald';
    const adminPass = process.env.ADMIN_PASS || 'donald';
    if (username === adminUser && password === adminPass) {
        res.json({ success: true, token: 'admin_token_secure_xyz789' });
    } else {
        res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
});

const requireAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'Bearer admin_token_secure_xyz789') next();
    else res.status(401).json({ success: false, message: 'Non autorisé' });
};

// --- Config Routes ---
app.get('/api/config', async (req, res) => {
    const config = await getConfig();
    if (!config) return res.status(404).json({ message: 'No config found' });
    res.json(config);
});

app.post('/api/config', requireAdmin, async (req, res) => {
    if (await saveConfig(req.body)) {
        res.json({ success: true, message: 'Configuration enregistrée' });
    } else {
        res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
    }
});

// --- Transactions Routes ---
app.get('/api/transactions', requireAdmin, async (req, res) => {
    const transactions = await getTransactions();
    res.json(transactions);
});

app.post('/api/callback', async (req, res) => {
    const { status, amount, currency, transaction_ref, payment_method, client_token, phone, payer_phone, phone_number } = req.body;
    console.log(`[CALLBACK] Transaction ${client_token} : ${status}`);

    const txnUpdate = {
        id: client_token,
        status: status === 'success' ? 'success' : 'failed',
        transaction_ref,
        payment_method, 
        phone: phone || payer_phone || phone_number,
        last_callback: new Date().toISOString()
    };

    await upsertTransaction(txnUpdate);

    // Email logic remains similar, but using the new getConfig
    if (status === 'success') {
        const transactions = await getTransactions();
        const fullTxn = transactions.find(t => t.id === client_token);
        if (fullTxn && fullTxn.email) {
            sendPaymentEmail(fullTxn.email, client_token, 'success');
        }
    }
    res.status(200).send('OK'); 
});

app.post('/api/transactions', async (req, res) => {
    await upsertTransaction(req.body);
    res.json({ success: true });
});

app.get('/api/check-status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    const transactions = await getTransactions();
    const localTxn = transactions.find(t => t.id === transactionId);

    if (localTxn) {
        const statusMap = {
            'success': 'SUCCESS',
            'completed': 'SUCCESS',
            'failed': 'FAILED',
            'pending': 'PENDING'
        };
        return res.json({ 
            status: statusMap[localTxn.status] || localTxn.status.toUpperCase(), 
            transaction: localTxn 
        });
    }

    res.json({ status: 'PENDING', message: 'Transaction not found yet' });
});

// --- System mailer ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPaymentEmail = async (email, transactionId, status) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("Email credentials not configured.");
        return { success: false, message: "Email credentials missing" };
    }

    const isSuccess = status === 'success' || status === 'completed' || status === 'SUCCESS';
    const config = await getConfig() || { downloadUrl: "https://drive.google.com/file/d/1jk5kbmm74K6nf9OYcs03aJ0Zd1-GCY74/view?usp=drive_link" };
    const downloadUrl = config.downloadUrl;

    const mailOptions = {
        from: `"Kora Agency Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: isSuccess
            ? `✅ Succès : Votre commande Kora Agency est prête ! (${transactionId})`
            : `⚠️ Problème : État de votre paiement Kora Agency (${transactionId})`,
        html: isSuccess ? `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
                <h2 style="color: #00a884; text-align: center;">Félicitations !</h2>
                <p>Bonjour,</p>
                <p>Nous avons le plaisir de vous informer que votre paiement pour <b>votre service Kora Agency</b> a été validé avec succès.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 5px solid #00a884; margin: 20px 0;">
                    <p style="margin: 0;"><b>ID Transaction :</b> ${transactionId}</p>
                    <p style="margin: 5px 0 0 0;"><b>Produit :</b> Service Premium Digital Growth</p>
                </div>
                <p>Vous pouvez télécharger votre logiciel en cliquant sur le bouton ci-dessous :</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${downloadUrl}" style="background-color: #0d6efd; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">ACCÉDER AU SERVICE</a>
                </div>
                <p style="font-size: 12px; color: #666;">Si le bouton ne fonctionne pas, copiez ce lien : ${downloadUrl}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 11px; color: #999; text-align: center;">Merci d'avoir choisi Kora Agency - Votre partenaire de croissance digitale.</p>
            </div>
        ` : `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f44336; border-radius: 10px; padding: 20px;">
                <h2 style="color: #f44336; text-align: center;">Attention : Paiement non complété</h2>
                <p>Bonjour,</p>
                <p>Nous avons bien reçu votre signalement pour la transaction <b>${transactionId}</b>, mais le paiement n'est pas encore confirmé.</p>
                <p><b>Statut actuel :</b> ${status}</p>
                <div style="background-color: #fffde7; padding: 15px; border-radius: 5px; border-left: 5px solid #fbc02d; margin: 20px 0;">
                    <p style="margin: 0;"><b>Conseils :</b></p>
                    <ul style="margin: 10px 0 0 0;">
                        <li>Vérifiez que votre solde Lumicash/Ecocash est suffisant.</li>
                        <li>Assurez-vous d'avoir validé la transaction sur votre téléphone.</li>
                        <li>Réessayez de cliquer sur "Acheter Maintenant" sur le site.</li>
                    </ul>
                </div>
                <p>Si vous avez été débité, n'ayez crainte. Notre support vérifie manuellement les transactions toutes les heures.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 11px; color: #999; text-align: center;">Support Technique - Kora Agency</p>
            </div>
        ` 
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};

app.post('/api/notify-payment', async (req, res) => {
    const { email, transactionId, status } = req.body;
    const result = await sendPaymentEmail(email, transactionId, status);
    if (result.success) {
        res.json({ success: true, message: 'Email envoyé avec succès' });
    } else {
        res.status(500).json(result);
    }
});

// --- Email Notifier (For Quotes & Contacts) ---
const sendAdminNotification = async (type, data) => {
    let subject = "";
    let html = "";

    if (type === 'quote') {
        subject = `[NOUVEAU DEVIS] ${data.service} - ${data.name}`;
        html = `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2F2F2F;">Demande de Devis - ${data.service}</h2>
                <hr/>
                <p><strong>Client :</strong> ${data.name}</p>
                <p><strong>WhatsApp :</strong> <a href="https://wa.me/${data.whatsapp.replace(/\D/g, '')}">${data.whatsapp}</a></p>
                <hr/>
                <h3>Réponses au Questionnaire :</h3>
                <ul>
                    ${Object.entries(data.answers || {}).map(([q, a]) => `<li><strong>${q} :</strong> ${a}</li>`).join('')}
                </ul>
                <hr/>
                <p style="font-size: 12px; color: #666;">Envoyé par le système Kora Agency</p>
            </div>
        `;
    } else {
        subject = `[CONTACT] Nouveau message de ${data.name}`;
        html = `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2F2F2F;">Nouveau Message de Contact</h2>
                <hr/>
                <p><strong>Nom :</strong> ${data.name}</p>
                <p><strong>Email :</strong> ${data.email}</p>
                <p><strong>WhatsApp :</strong> ${data.whatsapp || 'Non fourni'}</p>
                <hr/>
                <h3>Message :</h3>
                <p>${data.message}</p>
                <hr/>
                <p style="font-size: 12px; color: #666;">Envoyé via le formulaire de contact Kora Agency</p>
            </div>
        `;
    }

    try {
        await transporter.sendMail({
            from: `"Kora Notifications" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, 
            subject: subject,
            html: html,
        });
        console.log(`[MAIL] Notification envoyée pour : ${type}`);
        return true;
    } catch (error) {
        console.error("[MAIL] Erreur envoi notifications :", error);
        return false;
    }
};

app.post('/api/quote', async (req, res) => {
    try {
        const success = await sendAdminNotification('quote', req.body);
        if (success) {
            res.json({ success: true, message: "Devis transmis par email avec succès." });
        } else {
            res.status(500).json({ success: false, message: "Erreur lors de l'envoi de l'email." });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/contact-message', async (req, res) => {
    try {
        const success = await sendAdminNotification('contact', req.body);
        if (success) {
            res.json({ success: true, message: "Message transmis avec succès." });
        } else {
            res.status(500).json({ success: false, message: "Erreur lors de l'envoi de l'email." });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/chat-summary', async (req, res) => {
    try {
        const { transcript, name } = req.body;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2F2F2F;">Transcription Conversation Alexa</h2>
                <hr/>
                <p><strong>Session de :</strong> ${name || 'Visiteur Anonyme'}</p>
                <hr/>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                    ${transcript.map(m => `
                        <p style="margin-bottom: 10px;">
                            <strong style="color: ${m.from === 'alexa' ? '#6366f1' : '#22c55e'};">
                                ${m.from === 'alexa' ? 'Alexa' : 'Client'} :
                            </strong> 
                            ${m.text}
                        </p>
                    `).join('')}
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 20px;">Envoyé automatiquement par Alexa — Kora Agency</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Alexa Kora" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `[ALEXA] Nouveau Résumé de Conversation`,
            html: html,
        });

        res.json({ success: true, message: "Résumé de chat envoyé." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: "OK", serverTime: new Date().toISOString() });
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const config = await getConfig(); 
        const msg = message.toLowerCase().trim();
        
        // --- MODE IA RÉELLE (GEMINI) ---
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'votre_cle_gemini_ici') {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // Construction du Contexte Système (Nourri par config.json via Sequelize)
                const systemPrompt = `
                    Tu es Alexa, l'assistante IA experte de l'agence digitale "Kora Agency".
                    Ton but est d'informer les clients, de répondre à leurs questions et de les convaincre de travailler avec nous.
                    
                    VOICI LES DONNÉES OFFICIELLES DE L'AGENCE (Ta source de vérité absolue, extraites de la base de données) :
                    ${JSON.stringify({ 
                        identite: config.branding, 
                        accroche_page_accueil: config.hero, 
                        nos_services_et_prix: config.services, 
                        notre_methodologie: config.about,
                        actualites_en_cours: config.news
                    }, null, 2)}
                    
                    DIRECTIVES :
                    1. Sois professionnelle, enthousiaste et persuasive.
                    2. Si on te demande un prix, cite le montant exact en FBU indiqué dans la section nos_services_et_prix. N'invente jamais de prix.
                    3. Si la question est trop complexe ou hors sujet, redirige vers WhatsApp (+25779928864).
                    4. Réponds toujours en français, de manière concise et avec quelques emojis.
                    5. Ne mentionne jamais que tu es un modèle d'IA de Google. Tu es Alexa, l'employée IA de Kora Agency.
                    6. N'invente pas de services qui ne sont pas dans la liste ci-dessus.
                `;

                const result = await model.generateContent([systemPrompt, `Question du client : ${message}`]);
                const response = result.response.text();
                return res.json({ response });
            } catch (aiErr) {
                console.error("[GEMINI_ERROR]", aiErr.message);
                // On continue vers le mode fallback si l'IA échoue
            }
        }

        // --- MODE SECOURS (ALGORITHME EXPERT BASÉ SUR CONFIG) ---
        let response = "";
        const services = config.services?.items || [];
        const vision = config.branding?.description || "expertise digitale";
        const fallback = `Pour une discussion approfondie, contactez notre responsable sur WhatsApp (+25779928864).`;

        if (msg === "bonjour" || msg === "hello" || msg === "salut") {
            response = `Bonjour ! Je suis Alexa de **Kora Agency**. 😊 Nous sommes ${vision}. Comment puis-je vous aider aujourd'hui ?`;
        } 
        else if (msg.includes("prix") || msg.includes("tarif") || msg.includes("combien") || msg.includes("coûte")) {
            const match = services.find(s => msg.includes(s.title.toLowerCase()));
            if (match) {
                response = `Le service **${match.title}** est à ${match.price.toLocaleString()} FBU. C'est un excellent choix ! Souhaitez-vous un devis ?`;
            } else {
                response = `Nos tarifs commencent à 50.000 FBU pour l'optimisation et vont jusqu'à 2.000.000 FBU pour une automatisation complète. Quel domaine vous intéresse ?`;
            }
        } 
        else if (msg.includes("faites") || msg.includes("service") || msg.includes("proposez") || msg.includes("quoi")) {
            const list = services.map(s => s.title).join(", ");
            response = `Chez Kora Agency, nous excellons dans : **${list}**. Nous transformons votre business grâce à l'automatisation.`;
        }
        else {
            response = `C'est une excellente question sur le digital. ${fallback}`;
        }

        res.json({ response });
    } catch (err) {
        console.error("[CHAT_ERROR]", err);
        res.status(500).json({ error: "Erreur interne de l'intelligence Alexa." });
    }
});

// --- SERVING STATIC FILES (PROD) ---
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(clientDistPath)) {
    console.log(`[INIT] Serving static files from: ${clientDistPath}`);
    app.use(express.static(clientDistPath));
    
    // Catch-all route to serve the Single Page Application (SPA)
    app.get('*', (req, res) => {
        if (!req.url.startsWith('/api')) {
            res.sendFile(path.join(clientDistPath, 'index.html'));
        }
    });
} else {
    console.log(`[WARN] Fichiers statiques non trouvés à ${clientDistPath}. Exécutez 'npm run build' dans le dossier client.`);
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Kora Agency running on http://localhost:${PORT}`);
});
