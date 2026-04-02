const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { uploadMedia, deleteMedia } = require('../services/mediaService');
const Media = require('../models/Media');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * GET /api/media
 */
router.get('/', async (req, res) => {
  try {
    const medias = await Media.findAll({ order: [['createdAt', 'DESC']] });
    res.json(medias);
  } catch (error) {
    console.error('Fetch Media Error:', error);
    res.status(500).json({ error: 'Error fetching medias' });
  }
});

/**
 * POST /api/media/upload
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const generatedUuid = uuidv4();
    const publicUrlOrLocalPath = await uploadMedia(req.file, generatedUuid);

    // Save metadata in database
    const newMedia = await Media.create({
      id: generatedUuid,
      name: req.body.name || req.file.originalname,
      path: publicUrlOrLocalPath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'local'
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      media: newMedia
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

/**
 * DELETE /api/media/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    await deleteMedia(media.path);
    await media.destroy();

    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

module.exports = router;
