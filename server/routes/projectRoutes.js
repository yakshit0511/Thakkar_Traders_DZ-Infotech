const express = require('express');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProject,
} = require('../controllers/projectController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProjects);
router.post('/', protect, upload.single('image'), createProject);
router.patch('/:id/toggle', protect, toggleProject);
router.put('/:id', protect, upload.single('image'), updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
