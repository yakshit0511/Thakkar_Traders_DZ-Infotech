const express = require('express');
const {
  getFollowUps,
  createFollowUp,
  getFollowUp,
  updateFollowUp,
  updateFollowUpStatus,
  deleteFollowUp,
  getStatsSummary,
  getCalendarMonth,
} = require('../controllers/followUpController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
// IMPORTANT: Static routes must come before /:id to avoid param collision
router.get('/stats/summary', protect, getStatsSummary);
router.get('/calendar/month', protect, getCalendarMonth);

router.get('/', protect, getFollowUps);
router.post('/', protect, createFollowUp);

router.get('/:id', protect, getFollowUp);
router.put('/:id', protect, updateFollowUp);
router.patch('/:id/status', protect, updateFollowUpStatus);
router.delete('/:id', protect, deleteFollowUp);

module.exports = router;
