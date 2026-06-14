const GalleryImage = require('../models/GalleryImage');
const { cloudinary } = require('../config/cloudinary');
const { parseBoolean, parseNumber } = require('../utils/helpers');

// @desc    Get all active gallery images
// @route   GET /api/gallery
// @access  Public
const getGalleryImages = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const images = await GalleryImage.find(filter).sort({
      isFeatured: -1,
      displayOrder: 1,
      uploadedAt: -1,
    });

    res.status(200).json({
      success: true,
      message: 'Gallery images retrieved successfully',
      count: images.length,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload gallery image
// @route   POST /api/gallery
// @access  Private
const uploadGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    const image = await GalleryImage.create({
      imageUrl: req.file.path,
      cloudinaryPublicId: req.file.filename,
      caption: req.body.caption || '',
      category: req.body.category || 'material-closeup',
      isFeatured: parseBoolean(req.body.isFeatured),
      displayOrder: parseNumber(req.body.displayOrder, 0),
    });

    res.status(201).json({
      success: true,
      message: 'Gallery image uploaded successfully',
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gallery image metadata
// @route   PATCH /api/gallery/:id
// @access  Private
const updateGalleryImage = async (req, res, next) => {
  try {
    const allowedFields = ['caption', 'category', 'isFeatured', 'isActive', 'displayOrder'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'isFeatured' || field === 'isActive') {
          updates[field] = parseBoolean(req.body[field]);
        } else if (field === 'displayOrder') {
          updates[field] = parseNumber(req.body[field], 0);
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const image = await GalleryImage.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery image updated successfully',
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteGalleryImage = async (req, res, next) => {
  try {
    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found',
      });
    }

    if (image.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(image.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion failed:', cloudinaryError.message);
      }
    }

    await image.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gallery image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
};
