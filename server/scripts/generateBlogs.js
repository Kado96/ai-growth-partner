const sequelize = require('../config/database');
const Content = require('../models/Content');
const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { sendToN8N } = require("../services/n8nService");

async function generate() {
    try {
        console.log("[INIT] Synchronisation de la base de données...");
        await sequelize.sync();
        
        const CONFIG_FILE = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        const services = config.services?.items || [];
        
        if (!process.env.GEMINI_API_KEY) {
            console.error("[ERROR] GEMINI_API_KEY manquante dans .env.production");
            return;
        }

        console.log(`[PROCESS] ${services.length} services trouvés.`);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const service of services) {
            const existing = await Blog.findOne({ where: { serviceId: service.id } });
            if (existing) {
                console.log(`[SKIP] Blog déjà existant pour: ${service.title}`);
                continue;
            }

            console.log(`[GENERATE] Rédaction du blog pour: ${service.title}...`);
            
            let success = false;
            let retryCount = 0;
            const maxRetries = 10;

            while (!success && retryCount < maxRetries) {
                try {
                    const prompt = `
                        Tu es un expert en Marketing Digital et Copywriting pour l'agence "Kora Agency".
                        Rédige un article de blog expert, captivant et persuasif pour le service suivant :
                        
                        TITRE DU SERVICE : ${service.title}
                        DESCRIPTION : ${service.description}
                        CATEGORIE : ${service.category}
                        
                        STRUCTURE DE L'ARTICLE :
                        1. Un titre accrocheur (SEO optimisé).
                        2. Une introduction percutante qui identifie un problème client (parle de la réalité au Burundi/Afrique de l'Est si pertinent).
                        3. Trois sections détaillées expliquant la solution, les bénéfices et pourquoi choisir Kora Agency.
                        4. Une conclusion avec un appel à l'action vers un devis.
                        5. 5 mots-clés (tags) pertinents sans le symbole #.
                        
                        FORMAT DE SORTIE (JSON uniquement) :
                        {
                          "title": "Titre de l'article",
                          "content": "Contenu complet en format Markdown (utilise des titres ##, gras, listes).",
                          "tags": ["Tag1", "Tag2", ...],
                          "readingTime": 5
                        }
                        
                        Rédige en français burundais professionnel.
                    `;

                    const result = await model.generateContent(prompt);
                    const responseText = result.response.text();
                    
                    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                    const blogData = JSON.parse(jsonStr);

                    await Blog.create({
                        serviceId: service.id,
                        title: blogData.title,
                        content: blogData.content,
                        tags: blogData.tags,
                        readingTime: blogData.readingTime
                    });

                    console.log(`[SUCCESS] Blog créé pour: ${service.title}`);
                    
                    // Notification n8n
                    await sendToN8N("blog-created", {
                        serviceId: service.id,
                        title: blogData.title,
                        contentExcerpt: blogData.content.substring(0, 500) + "...",
                        tags: blogData.tags,
                        imagePath: service.imagePath
                    });

                    success = true;
                } catch (err) {
                    if (err.status === 429) {
                        retryCount++;
                        console.log(`[LIMIT] Quota atteint. Attente de 65s... (Essai ${retryCount}/${maxRetries})`);
                        await sleep(65000); // 65s delay on quota (Gemini limit)
                    } else if (err.name === 'TypeError' || !err.status) {
                        retryCount++;
                        console.log(`[NETWORK] Erreur de connexion (Internet coupé ?). Attente de 2 min... (Essai ${retryCount}/${maxRetries})`);
                        console.error("Détail:", err.message);
                        await sleep(120000); // Wait 2 min for internet to return
                    } else {
                        throw err;
                    }
                }
            }

            // Pause de sécurité entre chaque succès pour éviter le spam
            await sleep(5000); 
        }

        console.log("[DONE] Tous les blogs ont été générés.");
        process.exit(0);
    } catch (err) {
        console.error("[CRITICAL]", err);
        process.exit(1);
    }
}

generate();
