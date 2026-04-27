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
const { scanMediaFolder } = require('./scripts/mediaCollector');
const { sendToN8N } = require('./services/n8nService');

// Synchroniser la DB au démarrage (Ne pas utiliser force:true en prod)
sequelize.sync({ alter: false }).then(() => {
    console.log("[INIT] Base de données Sequelize synchronisée.");
}).catch(err => {
    console.error("[CRITICAL] Erreur de synchronisation DB:", err);
});

const app = express();
const PORT = process.env.PORT || 5001;

// Configuration CORS pour autoriser Netlify + Dev local
const allowedOrigins = [
    'https://koragency.netlify.app',
    'http://localhost:8080',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`[CORS] Origine bloquée: ${origin}`);
            callback(null, true); // Permissif pour le moment
        }
    },
    credentials: true
}));
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
const Blog = require('./models/Blog');
const Setting = require('./models/Setting');
const Knowledge = require('./models/Knowledge');
const Media = require('./models/Media');

const getConfig = async () => {
    let config = { ...DEFAULT_CONFIG, news: [] };
    
    // Priority 1: SQLite (or Postgres) DB via Sequelize
    try {
        const contents = await Content.findAll();
        if (contents.length > 0) {
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
            return { ...config, ...localData };
        }
    } catch (e) { console.error("[CONFIG] Erreur lecture config.json:", e.message); }

    return config;
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
            to: "kandekedonald@gmail.com", 
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
            to: "kandekedonald@gmail.com",
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

// --- MOTEUR RAG LOCAL POUR ALEXA ---
const getLocalContext = async (query) => {
    try {
        const queryLower = query.toLowerCase();
        let context = "";

        // 1. Recherche dans les Blogs (Titre + Contenu)
        const blogs = await Blog.findAll();
        const matchingBlogs = blogs.filter(b => 
            b.title.toLowerCase().includes(queryLower) || 
            b.content.toLowerCase().includes(queryLower) ||
            (b.tags && b.tags.some(t => t.toLowerCase().includes(queryLower)))
        ).slice(0, 3);

        if (matchingBlogs.length > 0) {
            context += "\n--- ARTICLES D'EXPERTISE TROUVÉS ---\n";
            matchingBlogs.forEach(b => {
                context += `Service: ${b.serviceId} | Titre: ${b.title}\n`;
                context += `Contenu (Extrait): ${b.content.substring(0, 1000)}...\n`;
                context += `Lien: /blog/${b.serviceId}\n\n`;
            });
        }

        // 2. Recherche dans les Médias
        const medias = await Media.findAll();
        const matchingMedias = medias.filter(m => 
            m.name.toLowerCase().includes(queryLower)
        ).slice(0, 3);

        if (matchingMedias.length > 0) {
            context += "\n--- VISUELS RÉELS DISPONIBLES ---\n";
            matchingMedias.forEach(m => {
                context += `Nom: ${m.name} | Path: ${m.path}\n`;
            });
        }

        // 3. Recherche dans la Base de Connaissance Manuelle
        const manualKnowledge = await Knowledge.findAll();
        const matchingManual = manualKnowledge.filter(k => 
            k.title.toLowerCase().includes(queryLower) || 
            k.content.toLowerCase().includes(queryLower)
        ).slice(0, 3);

        if (matchingManual.length > 0) {
            context += "\n--- SAVOIR SPÉCIFIQUE (CERVEAU ALEXA) ---\n";
            matchingManual.forEach(k => {
                context += `Sujet: ${k.title}\n`;
                context += `Détails: ${k.content}\n\n`;
            });
        }

        return context;
    } catch (err) {
        console.error("[RAG_ERROR]", err);
        return "";
    }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const config = await getConfig(); 
        const msg = message.toLowerCase().trim();

        // 🔍 ÉTAPE 1 : RÉCUPÉRATION DU CONTEXTE LOCAL (RAG)
        const localContext = await getLocalContext(message);
        
        // --- MODE IA RÉELLE (GEMINI) ---
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'votre_cle_gemini_ici') {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const systemPrompt = `
                    Tu es Alexa, l'assistante IA experte de l'agence digitale "Kora Agency".
                    Ton but est d'informer les clients, de répondre à leurs questions et de les convaincre de travailler avec nous.
                    
                    DONNÉES GLOBALES DE L'AGENCE :
                    ${JSON.stringify({ 
                        identite: config.branding, 
                        accroche: config.hero, 
                        services: config.services, 
                        news: config.news
                    }, null, 2)}
                    
                    DONNÉES D'EXPERTISE LOCALES (RAG) :
                    ${localContext || "Aucun article de blog spécifique trouvé."}

                    DIRECTIVES DE COMPORTEMENT :
                    1. IDENTITÉ : Tu es Alexa, l'assistante IA de Kora Agency. Tu es amicale, proactive et tu as une personnalité chaleureuse (comme ChatGPT mais experte marketing).
                    2. BAVARDAGE (SMALL TALK) : Si l'utilisateur te salue, te demande comment tu vas ou qui tu es, RÉPONDS avec enthousiasme et humour avant d'orienter vers le business. Ne sois pas un robot froid.
                    3. PRIORITÉ LOCALE : Utilise nos Services, Blogs et Savoirs pour donner des conseils concrets.
                    4. DÉMONSTRATION : Si tu cites un service, propose un lien (/blog/id) ou un visuel ([IMAGE:PATH]).
                    5. WHATSAPP : Utilise-le uniquement pour la prise de rendez-vous finale.
                    6. Ton : Professionnel, "bavard" (donne des détails), persuasif. Toujours en français.
                `;

                const result = await model.generateContent([systemPrompt, `Question du client : ${message}`]);
                const response = result.response.text();
                return res.json({ response });
            } catch (aiErr) {
                console.error("[GEMINI_ERROR]", aiErr.message);
            }
        }

        // --- MODE EXPERT DIRECT (ALEXA HORS-LIGNE) ---
        const greetings = ["bonjour", "salut", "hello", "coucou", "qui es-tu", "tu es qui", "ca va", "ça va", "parle avec moi"];
        const isGreeting = greetings.some(g => msg.includes(g));

        let response = "";
        if (isGreeting) {
            response = `Bonjour ! Je suis **Alexa**, votre consultante en stratégie digitale chez Kora Agency. Je suis à votre entière disposition pour optimiser votre présence en ligne.\n\nQue souhaitez-vous explorer aujourd'hui ? Nos solutions de Social Media, votre visibilité sur Google, ou nos automatisations ?`;
        } else {
            response = `En tant qu'experte digitale, voici les analyses et recommandations que je peux extraire pour votre demande :\n\n`;
            if (localContext.includes("--- ARTICLES D'EXPERTISE TROUVÉS ---") || localContext.includes("--- SAVOIR SPÉCIFIQUE ---")) {
                response += `${localContext}`;
            } else {
                const services = config.services?.items || [];
                const list = services.map(s => s.title).join(", ");
                response += `Mes bases de données indiquent que nous maîtrisons parfaitement les domaines suivants : **${list}**.\n\nLequel de ces services souhaitez-vous voir dynamiser votre chiffre d'affaires aujourd'hui ?`;
            }
        }

        res.json({ response });
    } catch (err) {
        console.error("[CHAT_ERROR]", err);
        res.status(500).json({ error: "Erreur d'intelligence." });
    }
});

// --- ROUTES BASE DE CONNAISSANCE (ADMIN) ---
app.get('/api/knowledge', requireAdmin, async (req, res) => {
    try {
        const items = await Knowledge.findAll({ order: [['createdAt', 'DESC']] });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/knowledge', requireAdmin, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: "Champs manquants." });
        const item = await Knowledge.create({ title, content });
        res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/knowledge/:id', requireAdmin, async (req, res) => {
    try {
        await Knowledge.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- BLOG & MEDIA AUTOMATION ---
app.post('/api/media/scan', requireAdmin, async (req, res) => {
    const result = await scanMediaFolder();
    res.json(result);
});

app.post('/api/blogs/generate-all', requireAdmin, async (req, res) => {
    try {
        const config = await getConfig();
        const services = config.services?.items || [];
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let generatedCount = 0;

        for (const service of services) {
            const existing = await Blog.findOne({ where: { serviceId: service.id } });
            if (existing) continue;

            const prompt = `
                Tu es un expert en Marketing Digital et Copywriting pour l'agence "Kora Agency".
                Rédige un article de blog expert, captivant et persuasif pour le service suivant :
                
                TITRE DU SERVICE : ${service.title}
                DESCRIPTION : ${service.description}
                CATEGORIE : ${service.category}
                
                STRUCTURE DE L'ARTICLE :
                1. Un titre accrocheur (SEO optimisé).
                2. Une introduction percutante qui identifie un problème client.
                3. Trois sections détaillées expliquant la solution, les bénéfices et pourquoi choisir Kora Agency.
                4. Une conclusion avec un appel à l'action vers un devis.
                5. 5 mots-clés (tags) pertinents.
                
                FORMAT DE SORTIE (JSON uniquement) :
                {
                  "title": "Titre de l'article",
                  "content": "Contenu complet en format Markdown (utilise des titres ##, gras, listes).",
                  "tags": ["Tag1", "Tag2", ...],
                  "readingTime": 5
                }
                
                Rédige en français burundais professionnel (Burundi).
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Nettoyage JSON si Gemini ajoute des backticks
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const blogData = JSON.parse(jsonStr);

            await Blog.create({
                serviceId: service.id,
                title: blogData.title,
                content: blogData.content,
                tags: blogData.tags,
                readingTime: blogData.readingTime
            });

            generatedCount++;
        }

        res.json({ success: true, generatedCount });
    } catch (err) {
        console.error("[BLOG_GEN_ERROR]", err);
        res.status(500).json({ error: err.message });
    }
});

// --- BLOGS EXPERTISE (ADMIN & PUBLIC) ---
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.findAll({ order: [['createdAt', 'DESC']] });
        res.json(blogs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/blogs/:idOrSlug', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        // Recherche prioritaire par slug, puis par serviceId
        let blog = await Blog.findOne({ where: { slug: idOrSlug } });
        if (!blog) {
            blog = await Blog.findOne({ where: { serviceId: idOrSlug } });
        }
        
        if (!blog) return res.status(404).json({ message: "Blog non trouvé." });
        res.json(blog);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/blogs', requireAdmin, async (req, res) => {
    try {
        const { id, slug, serviceId, title, content, tags, readingTime } = req.body;
        if (!title || !content || (!slug && !serviceId)) {
            return res.status(400).json({ error: "Champs manquants (title, content et slug ou serviceId requis)." });
        }
        
        const finalSlug = slug || serviceId; // Fallback sur serviceId si pas de slug fourni
        
        const [blog, created] = await Blog.upsert({
            id: id || undefined,
            slug: finalSlug,
            serviceId: serviceId || null,
            title,
            content,
            tags,
            readingTime
        });
        
        res.json({ success: true, blog, created });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/blogs/:id', requireAdmin, async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog non trouvé." });
        await blog.destroy();
        res.json({ success: true, message: "Blog supprimé." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- n8n INTEGRATION ---
app.get('/api/social/settings/n8n', requireAdmin, async (req, res) => {
    try {
        const setting = await Setting.findByPk('n8n_webhook_url');
        res.json({ webhookUrl: setting ? setting.value : "" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/social/settings/n8n', requireAdmin, async (req, res) => {
    try {
        const { webhookUrl } = req.body;
        if (!webhookUrl) return res.status(400).json({ error: "URL manquante." });
        
        await Setting.upsert({ key: 'n8n_webhook_url', value: webhookUrl });
        process.env.N8N_WEBHOOK_URL = webhookUrl;
        
        res.json({ success: true, message: "Webhook n8n sauvegardé.", url: webhookUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/social/test-n8n', requireAdmin, async (req, res) => {
    try {
        const success = await sendToN8N("test-ping", { message: "Test de connexion Kora Agency OK." });
        if (success) res.json({ success: true, message: "Test envoyé avec succès à n8n." });
        else res.status(500).json({ success: false, message: "Échec de l'envoi à n8n. Vérifiez l'URL." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SERVING STATIC FILES (PROD) ---
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(clientDistPath)) {
    console.log(`[INIT] Serving static files from: ${clientDistPath}`);
    app.use(express.static(clientDistPath));
    
    // MOTEUR D'INJECTION SEO DYNAMIQUE
    app.get('*', async (req, res) => {
        if (req.url.startsWith('/api')) return;

        try {
            let html = fs.readFileSync(path.join(clientDistPath, 'index.html'), 'utf8');
            const config = await getConfig();
            const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

            let title = config.branding?.name || "Kora Agency";
            let description = config.branding?.description || "Expertise IA & Marketing.";
            let image = `${baseUrl}/og-default.jpg`;
            let url = `${baseUrl}${req.url}`;

            // Si c'est un blog, on récupère les vraies données
            if (req.url.startsWith('/blog/')) {
                const slug = req.url.split('/').pop();
                let blog = await Blog.findOne({ where: { slug: slug } });
                if (!blog) blog = await Blog.findOne({ where: { serviceId: slug } });

                if (blog) {
                    title = `${blog.title} | Kora Agency`;
                    description = blog.content.substring(0, 160).replace(/[#*`]/g, '') + "...";
                    
                    const service = config.services?.items.find(s => s.id === blog.serviceId);
                    if (service) {
                        if (service.youtubeId) {
                            image = `https://img.youtube.com/vi/${service.youtubeId}/maxresdefault.jpg`;
                        } else if (service.imagePath) {
                            image = service.imagePath.startsWith('http') ? service.imagePath : `${baseUrl}${service.imagePath}`;
                        }
                    }
                }
            }

            // Injection des balises
            html = html.replace(/__TITLE__/g, title)
                       .replace(/__DESCRIPTION__/g, description)
                       .replace(/__IMAGE__/g, image)
                       .replace(/__URL__/g, url);

            res.send(html);
        } catch (err) {
            console.error("[SEO_INJECTION_ERROR]", err);
            res.sendFile(path.join(clientDistPath, 'index.html'));
        }
    });
} else {
    console.log(`[WARN] Fichiers statiques non trouvés à ${clientDistPath}. Exécutez 'npm run build' dans le dossier client.`);
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Kora Agency running on http://localhost:${PORT}`);
});
