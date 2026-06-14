const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be a valid four-digit year'],
      max: [2100, 'Year must be a valid four-digit year'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['residential', 'commercial', 'hospitality', 'retail', 'institutional'],
        message: 'Invalid project category',
      },
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    coverImageUrl: {
      type: String,
    },
    cloudinaryPublicId: {
      type: String,
    },
    materialsUsed: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
