/**
 * upload_media_to_supabase.js
 * Crée le bucket Supabase Storage 'media' (s'il n'existe pas)
 * et y téléverse toutes les images de server/media/.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[MEDIA_UPLOAD] ❌ SUPABASE_URL ou SUPABASE_KEY manquant dans .env.production');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return map[ext] || 'application/octet-stream';
};

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log(' 🚀 TELEVERSEMENT DES MEDIAS LOCAUX ➔ SUPABASE STORAGE');
  console.log('════════════════════════════════════════════════════════');

  const BUCKET_NAME = 'media';

  // 1. Vérifier ou Créer le bucket public 'media'
  try {
    const { data: buckets, error: getBucketErr } = await supabase.storage.listBuckets();
    if (getBucketErr) throw getBucketErr;

    const exists = buckets.some(b => b.name === BUCKET_NAME);
    if (!exists) {
      console.log(`[STORAGE] 🛠️ Création du bucket public '${BUCKET_NAME}'...`);
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*', 'application/*']
      });
      if (createErr) console.log(`[STORAGE]  ℹ️  Notice bucket: ${createErr.message}`);
      else console.log(`[STORAGE] ✅ Bucket public '${BUCKET_NAME}' créé !`);
    } else {
      console.log(`[STORAGE] ✅ Bucket '${BUCKET_NAME}' trouvé.`);
    }
  } catch (err) {
    console.log(`[STORAGE] ⚠️ Notice verification bucket : ${err.message}`);
  }

  // 2. Parcourir server/media/
  const mediaDir = path.join(__dirname, '..', 'media');
  if (!fs.existsSync(mediaDir)) {
    console.error('[STORAGE] ❌ Dossier server/media inexistant');
    process.exit(1);
  }

  const files = fs.readdirSync(mediaDir);
  console.log(`[STORAGE] ${files.length} fichiers trouvés dans server/media/\n`);

  let uploaded = 0, errors = 0, skipped = 0;

  for (const file of files) {
    if (file === '.gitkeep' || fs.statSync(path.join(mediaDir, file)).isDirectory()) {
      skipped++;
      continue;
    }

    const filePath = path.join(mediaDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(file);

    try {
      console.log(`[STORAGE] 📤 Téléversement : ${file} (${mimeType})...`);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(file, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (error) {
        console.error(`[STORAGE] ❌ Erreur ${file}:`, error.message);
        errors++;
      } else {
        const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file);
        console.log(`[STORAGE] ✅ Enregistré : ${publicData.publicUrl}`);
        uploaded++;
      }
    } catch (e) {
      console.error(`[STORAGE] ❌ Erreur fatale ${file}:`, e.message);
      errors++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log(` 🎉 TELEVERSEMENT TERMINÉ : ${uploaded} envoyés, ${errors} erreurs, ${skipped} ignorés.`);
  console.log('════════════════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch(err => {
  console.error('[STORAGE] ❌ Erreur globale :', err);
  process.exit(1);
});
