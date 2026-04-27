const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');

const scanMediaFolder = async () => {
    const mediaDir = path.join(__dirname, '..', 'media');
    
    if (!fs.existsSync(mediaDir)) {
        console.log("[SCAN] Dossier media inexistant.");
        return { success: false, message: "Media directory not found" };
    }

    try {
        const files = fs.readdirSync(mediaDir);
        let createdCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            // Ignorer gitkeep et dossiers (si existants)
            if (file === '.gitkeep' || fs.statSync(path.join(mediaDir, file)).isDirectory()) continue;

            const relativePath = `/media/${file}`;
            const existing = await Media.findOne({ where: { path: relativePath } });

            if (!existing) {
                const stats = fs.statSync(path.join(mediaDir, file));
                const mimeType = getMimeType(file);
                
                await Media.create({
                    name: file,
                    path: relativePath,
                    mimeType: mimeType,
                    size: stats.size,
                    environment: process.env.NODE_ENV === 'production' ? 'production' : 'local'
                });
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`[SCAN] Terminé. Créés: ${createdCount}, Ignorés: ${skippedCount}`);
        return { success: true, createdCount, skippedCount };
    } catch (err) {
        console.error("[SCAN] Erreur critique:", err);
        return { success: false, error: err.message };
    }
};

const getMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webp': 'image/webp'
    };
    return map[ext] || 'application/octet-stream';
};

module.exports = { scanMediaFolder };
