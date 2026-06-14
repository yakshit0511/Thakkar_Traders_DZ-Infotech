const express = require('express');
const {
  createInquiry,
  getInquiries,
  exportInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createInquiry);
router.get('/export', protect, exportInquiries);
router.get('/', protect, getInquiries);
router.get('/:id', protect, getInquiry);
router.patch('/:id/status', protect, updateInquiryStatus);
router.delete('/:id', protect, deleteInquiry);

module.exports = router;
