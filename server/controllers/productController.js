const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const { parseBoolean, parseNumber, parseJSONArray } = require('../utils/helpers');

const buildProductData = (body, file) => {
  const data = {
    name: body.name,
    category: body.category,
    description: body.description,
    brands: parseJSONArray(body.brands),
    keyHighlights: parseJSONArray(body.keyHighlights),
    isActive: body.isActive !== undefined ? parseBoolean(body.isActive) : true,
    displayOrder: parseNumber(body.displayOrder, 0),
  };

  if (file) {
    data.featuredImageUrl = file.path;
    data.cloudinaryPublicId = file.filename;
  }

  return data;
};

// @desc    Get all active products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product description is required',
      });
    }

    const product = await Product.create(buildProductData(req.body, req.file));

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (req.file && product.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(product.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion failed:', cloudinaryError.message);
      }
    }

    const updates = buildProductData(req.body, req.file);

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        product[key] = updates[key];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(product.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion failed:', cloudinaryError.message);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle
// @access  Private
const toggleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
};
