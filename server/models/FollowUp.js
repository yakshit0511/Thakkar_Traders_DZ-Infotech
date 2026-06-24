const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [150, 'Client name cannot exceed 150 characters'],
    },
    clientPhone: {
      type: String,
      required: [true, 'Client phone is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    clientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    clientCity: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    clientType: {
      type: String,
      required: [true, 'Client type is required'],
      enum: {
        values: [
          'architect',
          'interior-designer',
          'contractor',
          'builder',
          'furniture-manufacturer',
          'homeowner',
          'other',
        ],
        message: 'Invalid client type',
      },
      default: 'other',
    },
    projectName: {
      type: String,
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    materialsInterested: {
      type: [String],
      default: [],
    },
    estimatedValue: {
      type: Number,
      default: 0,
    },
    followUpDate: {
      type: Date,
      required: [true, 'Follow-up date is required'],
    },
    followUpTime: {
      type: String,
      default: '10:00 AM',
    },
    followUpType: {
      type: String,
      required: [true, 'Follow-up type is required'],
      enum: {
        values: [
          'call',
          'whatsapp',
          'site-visit',
          'email',
          'meeting',
          'quotation-send',
          'sample-send',
          'other',
        ],
        message: 'Invalid follow-up type',
      },
      default: 'call',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['high', 'medium', 'low'],
        message: 'Priority must be high, medium, or low',
      },
      default: 'medium',
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'completed', 'rescheduled', 'cancelled'],
        message: 'Invalid status',
      },
      default: 'pending',
    },
    outcome: {
      type: String,
      maxlength: [1000, 'Outcome cannot exceed 1000 characters'],
    },
    nextFollowUpDate: {
      type: Date,
    },
    linkedInquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inquiry',
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FollowUp', followUpSchema);
