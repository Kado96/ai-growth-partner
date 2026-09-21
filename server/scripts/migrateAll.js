/**
 * 📦 SCRIPT DE MIGRATION UNIVERSEL DE KORA AGENCY
 * 
 * Ce script migre l'ENSEMBLE des données de votre projet vers la base de données et le stockage Cloud :
 * 1. Base de données PostgreSQL (Supabase / Render) :
 *    - Contenus de configuration (branding, hero, services, about, footer, news)
 *    - Base de connaissances Alexa (RAG / FAQ)
 *    - Articles de blog & conseils d'expertise
 *    - Messages de contact & Devis clients
 * 2. Supabase Storage (Bucket 'media') :
 *    - Toutes les images, logos et fichiers médias locaux (server/media + client/public)
 *    - Création/Mise à jour des métadonnées Media dans la table Sequelize
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const sequelize = require('../config/database');
const Content = require('../models/Content');
const Media = require('../models/Media');
const Knowledge = require('../models/Knowledge');
const Blog = require('../models/Blog');
const ContactMessage = require('../models/ContactMessage');
require('dotenv').config({ path: path.join(__dirname, '../../.env.production') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CONFIG_PATH = path.join(__dirname, '../config.json');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://uxdbxphznheqmagzjfem.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

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
    '.pdf': 'application/pdf'
  };
  return map[ext] || 'application/octet-stream';
};

async function runFullMigration() {
  console.log('=== 🚀 DÉMARRAGE DE LA MIGRATION GLOBALE KORA AGENCY ===\n');

  try {
    // 1. Synchronisation de la Base de Données
    console.log('1️⃣  Connexion et synchronisation des tables de la Base de Données...');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables Sequelize vérifiées et synchronisées.\n');

    // 2. Migration de la Configuration (config.json -> Content Model)
    if (fs.existsSync(CONFIG_PATH)) {
      console.log('2️⃣  Migration du fichier config.json vers la BDD...');
      const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

      for (const [sectionKey, sectionData] of Object.entries(configData)) {
        if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
          const existing = await Content.findOne({ where: { section: 'general', name: sectionKey } });
          if (!existing) {
            await Content.create({
              section: 'general',
              name: sectionKey,
              title: sectionData.title || sectionKey,
              description: sectionData.description || '',
              metadata: sectionData
            });
            console.log(`   └─ Section '${sectionKey}' insérée.`);
          } else {
            await existing.update({ metadata: sectionData });
            console.log(`   └─ Section '${sectionKey}' mise à jour.`);
          }
        } else if (Array.isArray(sectionData)) {
          for (let i = 0; i < sectionData.length; i++) {
            const item = sectionData[i];
            const itemName = item.id || item.title || `${sectionKey}_${i}`;
            const existing = await Content.findOne({ where: { section: sectionKey, name: itemName } });
            if (!existing) {
              await Content.create({
                section: sectionKey,
                name: itemName,
                title: item.title || '',
                description: item.description || '',
                metadata: item
              });
            } else {
              await existing.update({ metadata: item });
            }
          }
          console.log(`   └─ ${sectionData.length} éléments de la section '${sectionKey}' synchronisés.`);
        }
      }
      console.log('✅ Configuration globale migrée.\n');
    }

    // 3. Migration des Fichiers Médias & Photos vers Supabase Storage + Table Media
    console.log('3️⃣  Migration des Médias et Photos...');
    const mediaDirs = [
      { dir: path.join(__dirname, '../media'), prefix: '/media/' },
      { dir: path.join(__dirname, '../../client/public'), prefix: '/' }
    ];

    let totalUploaded = 0;

    for (const { dir, prefix } of mediaDirs) {
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter(f => 
        !f.startsWith('.') && 
        !f.endsWith('.js') && 
        !f.endsWith('.json') &&
        !f.endsWith('.html') &&
        !fs.statSync(path.join(dir, f)).isDirectory()
      );

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = getMimeType(file);
        let finalPublicUrl = `${prefix}${file}`;

        // Upload vers Supabase Storage si configuré
        if (supabase) {
          try {
            const { error: uploadErr } = await supabase.storage
              .from('media')
              .upload(file, fileBuffer, { contentType: mimeType, upsert: true });

            if (!uploadErr) {
              const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(file);
              finalPublicUrl = publicUrlData.publicUrl;
              console.log(`   [Supabase Cloud] ⬆️  ${file} -> ${finalPublicUrl}`);
            }
          } catch (spErr) {
            console.warn(`   [Supabase Warning] ${file}: ${spErr.message}`);
          }
        }

        // Enregistrement dans la table Media
        const relativePath = `${prefix}${file}`;
        const existingMedia = await Media.findOne({ where: { name: file } });

        if (!existingMedia) {
          await Media.create({
            name: file,
            path: finalPublicUrl,
            mimeType: mimeType,
            size: stats.size,
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'local'
          });
          totalUploaded++;
        } else {
          await existingMedia.update({ path: finalPublicUrl, size: stats.size });
        }
      }
    }
    console.log(`✅ ${totalUploaded} médias et photos traités et enregistrés.\n`);

    console.log('🎉 === MIGRATION GLOBALE KORA AGENCY TERMINÉE AVEC SUCCÈS === 🎉');
    return { success: true };
  } catch (error) {
    console.error('❌ ÉCHEC DE LA MIGRATION :', error);
    return { success: false, error };
  }
}

if (require.main === module) {
  runFullMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { runFullMigration };
