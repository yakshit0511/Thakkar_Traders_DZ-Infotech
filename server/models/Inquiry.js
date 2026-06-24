const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    projectType: {
      type: String,
      trim: true,
      maxlength: [200, 'Project type cannot exceed 200 characters'],
    },
    materialRequired: {
      type: String,
      trim: true,
      maxlength: [500, 'Material required cannot exceed 500 characters'],
    },
    message: {
      type: String,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    selectedImageUrl: {
      type: String,
      trim: true,
    },
    selectedImageCaption: {
      type: String,
      trim: true,
      maxlength: [300, 'Selected image caption cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'read', 'replied'],
        message: 'Status must be new, read, or replied',
      },
      default: 'new',
    },
    source: {
      type: String,
      enum: {
        values: ['web', 'whatsapp'],
        message: 'Source must be web or whatsapp',
      },
      default: 'web',
    },
    ipAddress: {
      type: String,
    },
    followUpCreated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
