/**
 * 🖼️ SCRIPT DE MIGRATION DES MÉDIAS VERS SUPABASE STORAGE
 * 
 * Transfère TOUTES les images/fichiers locaux vers le bucket 'media' de Supabase :
 *   - server/media/          (images des services)
 *   - client/public/         (logo, images publiques)
 *   - client/public/media/   (sous-dossier media)
 * 
 * Usage : node server/scripts/migrateMedia.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Chargement des variables d'environnement (local en priorité)
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env.production') });

// -------------------------------------------------------
// CONFIGURATION SUPABASE (projet sxtnrfzhwgjmzxzztoij)
// -------------------------------------------------------
// Projet Supabase : sxtnrfzhwgjmzxzztoij (bucket "media" visible dans le dashboard)
const SUPABASE_URL = process.env.SUPABASE_MEDIA_URL || process.env.SUPABASE_URL || 'https://sxtnrfzhwgjmzxzztoij.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_MEDIA_SECRET_KEY || process.env.SUPABASE_KEY || '';
const BUCKET_NAME = 'media';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// -------------------------------------------------------
// TYPES DE FICHIERS ACCEPTÉS
// -------------------------------------------------------
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
  };
  return map[ext] || null; // null = on ignore
};

// -------------------------------------------------------
// COLLECTE DES FICHIERS MÉDIAS
// -------------------------------------------------------
const collectFiles = (dirPath) => {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter(f => {
      const fullPath = path.join(dirPath, f);
      if (fs.statSync(fullPath).isDirectory()) return false;
      if (f.startsWith('.')) return false;
      return getMimeType(f) !== null;
    })
    .map(f => ({ name: f, fullPath: path.join(dirPath, f) }));
};

// -------------------------------------------------------
// UPLOAD UN FICHIER VERS SUPABASE STORAGE
// -------------------------------------------------------
const uploadFile = async (filePath, fileName) => {
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = getMimeType(fileName);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true, // Écrase si déjà existant
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
};

// -------------------------------------------------------
// MIGRATION PRINCIPALE
// -------------------------------------------------------
const migrateMedia = async () => {
  console.log('\n🖼️  === MIGRATION MÉDIAS VERS SUPABASE STORAGE ===\n');
  console.log(`📡 Supabase : ${SUPABASE_URL}`);
  console.log(`🪣 Bucket   : ${BUCKET_NAME}\n`);

  // Test de connexion
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error('❌ Impossible de se connecter à Supabase :', bucketsErr.message);
    process.exit(1);
  }
  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.error(`❌ Le bucket "${BUCKET_NAME}" n'existe pas dans ce projet Supabase.`);
    console.error('   Créez-le sur https://supabase.com/dashboard > Storage > New Bucket');
    process.exit(1);
  }
  console.log(`✅ Connexion Supabase OK. Bucket "${BUCKET_NAME}" trouvé.\n`);

  // Dossiers à scanner
  const sourceDirs = [
    path.join(__dirname, '../media'),
    path.join(__dirname, '../../client/public'),
    path.join(__dirname, '../../client/public/media'),
  ];

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const dir of sourceDirs) {
    const files = collectFiles(dir);
    if (files.length === 0) {
      console.log(`📂 ${dir} — (vide ou introuvable, on passe)`);
      continue;
    }

    console.log(`📂 Dossier : ${dir}`);
    console.log(`   → ${files.length} fichier(s) trouvé(s)\n`);

    for (const { name, fullPath } of files) {
      try {
        const publicUrl = await uploadFile(fullPath, name);
        console.log(`   ✅ ${name}`);
        console.log(`      🔗 ${publicUrl}`);
        totalSuccess++;
      } catch (err) {
        console.error(`   ❌ ${name} → ERREUR : ${err.message}`);
        totalFailed++;
      }
    }
    console.log('');
  }

  console.log('─────────────────────────────────────────');
  console.log(`🎉 Migration terminée !`);
  console.log(`   ✅ ${totalSuccess} fichier(s) uploadé(s) avec succès`);
  if (totalFailed > 0) {
    console.log(`   ❌ ${totalFailed} fichier(s) en échec`);
  }
  console.log(`\n📌 Vérifiez sur Supabase : ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/storage/files/buckets/${BUCKET_NAME}`);
  console.log('─────────────────────────────────────────\n');
};

migrateMedia().catch(err => {
  console.error('❌ ERREUR FATALE :', err);
  process.exit(1);
});
