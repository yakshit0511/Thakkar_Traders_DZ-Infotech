const Product = require('../models/Product');

const defaultProducts = [
  {
    name: 'Exotic Veneers',
    category: 'veneers',
    description: 'Natural and reconstituted veneers for bespoke furniture and feature walls',
    brands: ['Greenlam', 'Merino', 'Century'],
    keyHighlights: [
      'Available in teak, walnut, oak and wenge',
      'Reconstituted and natural options',
      'Suitable for furniture and wall cladding',
    ],
    displayOrder: 0,
    featuredImageUrl: '/images/wood_closeup.png',
  },
  {
    name: 'Marine Plywood',
    category: 'plywood',
    description: 'BWP and BWR grade engineering for moisture-prone and structural use',
    brands: ['Century Ply', 'Greenply', 'Kitply', 'Archidply'],
    keyHighlights: [
      'IS:710 certified BWP grade',
      'Boiling waterproof and borer resistant',
      'Available in 6mm to 25mm thickness',
    ],
    displayOrder: 1,
    featuredImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Designer Laminates',
    category: 'laminates',
    description: 'Acrylic, charcoal, matte and high-gloss surfaces from global brands',
    brands: ['Merino', 'Greenlam', 'Action Tesa', 'Virgo'],
    keyHighlights: [
      '1000 plus colour and texture options',
      'Anti-fingerprint and scratch resistant',
      '1mm and 0.8mm thickness available',
    ],
    displayOrder: 2,
    featuredImageUrl: '/images/wardrobe.png',
  },
  {
    name: 'MDF and HDHMR Boards',
    category: 'mdf-hdhmr',
    description: 'High density moisture resistant boards for modular furniture and interiors',
    brands: ['Durian', 'Greenply', 'Austin'],
    keyHighlights: [
      'HDHMR moisture resistance',
      'Smooth surface for direct laminate application',
      'Available in 3mm to 25mm',
    ],
    displayOrder: 3,
    featuredImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Flush and Designer Doors',
    category: 'flush-doors',
    description: 'Factory-finished and skin doors for residential and commercial projects',
    brands: ['Kitply', 'Century Ply', 'Durian'],
    keyHighlights: [
      'Fire rated options available',
      'Pre-laminated and veneer finish options',
      'Standard and custom sizes',
    ],
    displayOrder: 4,
    featuredImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Hardware and Adhesives',
    category: 'hardware',
    description: 'Hinges, channels, handles and adhesives from trusted hardware brands',
    brands: ['Hettich', 'Hafele', 'Fevicol', 'Pidilite'],
    keyHighlights: [
      'European quality hinges and channels',
      'Full range of furniture adhesives',
      'Soft-close and push-to-open options',
    ],
    displayOrder: 5,
    featuredImageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop',
  },
];

const seedDefaultData = async () => {
  try {
    const productCount = await Product.countDocuments();

    if (productCount === 0) {
      await Product.insertMany(defaultProducts);
      console.log('Default products seeded successfully');
    } else {
      // Ensure existing default products have their images set to the latest URLs
      for (const p of defaultProducts) {
        await Product.updateOne(
          { name: p.name },
          { $set: { featuredImageUrl: p.featuredImageUrl } }
        );
      }
      console.log('Existing default products updated with latest image URLs');
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = { seedDefaultData };
