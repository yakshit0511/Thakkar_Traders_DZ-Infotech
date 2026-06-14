const express = require('express');
const {
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} = require('../controllers/galleryController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getGalleryImages);
router.post('/', protect, upload.single('image'), uploadGalleryImage);
router.patch('/:id', protect, updateGalleryImage);
router.delete('/:id', protect, deleteGalleryImage);

module.exports = router;
