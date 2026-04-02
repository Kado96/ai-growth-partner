const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';
let supabase = null;

if (environment === 'production' || process.env.DATABASE_URL) {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
}

/**
 * Handle Media Upload dynamically
 * @param {Object} file - Ex: req.file from multer
 * @param {String} generatedUuid - UUID for the file
 */
const uploadMedia = async (file, generatedUuid) => {
  const fileExt = path.extname(file.originalname);
  const fileName = `${generatedUuid}${fileExt}`;

  if (environment === 'production' || process.env.DATABASE_URL) {
    if (!supabase) throw new Error('Supabase Client not initialized pour Production.');
    // Mettre sur Supabase
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw error;
    
    // Obtenir l'URL Publique
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } else {
    // Mode local
    const destPath = path.join(__dirname, '../media', fileName);
    fs.writeFileSync(destPath, file.buffer);
    
    // On retourne le filepath de l'API /media/:filename
    return `/media/${fileName}`;
  }
};

/**
 * Delete Media dynamically
 */
const deleteMedia = async (filePath) => {
  // If filepath is an absolute URL, we assume it's supabase
  if (filePath.startsWith('http')) {
    if (!supabase) return;
    const fileName = filePath.split('/').pop();
    await supabase.storage.from('media').remove([fileName]);
  } else {
    // Local
    const fileName = filePath.split('/').pop();
    const destPath = path.join(__dirname, '../media', fileName);
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
  }
};

module.exports = {
  uploadMedia,
  deleteMedia
};
