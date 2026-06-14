const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    heroHeadline: {
      type: String,
      default: 'Building Spaces With Premium Wood',
    },
    heroSubtext: {
      type: String,
      default:
        "Authorized distributors of India's leading plywood, laminate, veneer, MDF and interior material brands",
    },
    aboutParagraph1: {
      type: String,
      default:
        'For over fifteen years, Thakkar Traders has supplied premium plywood, laminates, veneers, MDF, HDHMR, doors and decorative materials to homeowners, architects, interior designers, contractors and furniture manufacturers across the region',
    },
    aboutParagraph2: {
      type: String,
      default:
        'We carry only authorized inventory from India\'s most trusted brands and pair it with expert consultation, fast site delivery and honest pricing so the materials you specify always land on site exactly as intended',
    },
    showroomAddress: {
      type: String,
      default: 'Plot 12, Industrial Hub, Surat, Gujarat 395004, India',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    whatsappNumber: {
      type: String,
      default: '919876543210',
    },
    email: {
      type: String,
      default: 'inquiry@thakkartraders.com',
    },
    workingHours: {
      type: String,
      default: 'Mon — Sat, 09:30 — 19:00 IST',
    },
    instagramUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    facebookUrl: {
      type: String,
      default: '',
    },
    totalSheetsDelivered: {
      type: Number,
      default: 10000,
    },
    totalProjectsServed: {
      type: Number,
      default: 500,
    },
    yearsLegacy: {
      type: Number,
      default: 15,
    },
    totalBrands: {
      type: Number,
      default: 20,
    },
    metaTitle: {
      type: String,
      default: 'Thakkar Traders — Premium Plywood, Laminates and Interior Materials, Surat',
    },
    metaDescription: {
      type: String,
      default:
        'Thakkar Traders is an authorized distributor of premium plywood, laminates, veneers, MDF and hardware in Surat, Gujarat. Serving architects, builders and interior designers since 2009',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
