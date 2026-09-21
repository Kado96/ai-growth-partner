const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.production') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://uxdbxphznheqmagzjfem.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error("❌ ERREUR: VITE_SUPABASE_ANON_KEY / SUPABASE_KEY manquant dans l'environnement !");
  console.log("Veuillez vous assurer que SUPABASE_URL et SUPABASE_KEY ou VITE_SUPABASE_ANON_KEY sont définis.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const mediaDir = path.join(__dirname, '../media');

async function migrateMediaToSupabase() {
  console.log(`🚀 Démarrage de la migration vers le bucket 'media' sur Supabase: ${supabaseUrl}...`);
  
  if (!fs.existsSync(mediaDir)) {
    console.error("❌ Dossier server/media introuvable.");
    return;
  }

  const files = fs.readdirSync(mediaDir).filter(f => f !== '.gitkeep');
  console.log(`📁 ${files.length} fichiers trouvés dans server/media.`);

  for (const file of files) {
    const filePath = path.join(mediaDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.svg') mimeType = 'image/svg+xml';

    console.log(`⬆️  Upload de ${file}...`);
    
    const { data, error } = await supabase.storage
      .from('media')
      .upload(file, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error(`❌ Échec upload de ${file}:`, error.message);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(file);
      console.log(`✅ ${file} uploade avec succès -> ${publicUrlData.publicUrl}`);
    }
  }

  console.log("\n🎉 Migration vers Supabase Storage terminée !");
}

migrateMediaToSupabase();
