const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} = require('../controllers/productController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, upload.single('image'), createProduct);
router.patch('/:id/toggle', protect, toggleProduct);
router.put('/:id', protect, upload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
