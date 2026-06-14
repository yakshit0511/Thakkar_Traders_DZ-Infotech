const Project = require('../models/Project');
const { cloudinary } = require('../config/cloudinary');
const { parseBoolean, parseNumber, parseJSONArray } = require('../utils/helpers');

const buildProjectData = (body, file) => {
  const data = {
    title: body.title,
    subtitle: body.subtitle,
    location: body.location,
    year: parseNumber(body.year),
    category: body.category,
    description: body.description,
    materialsUsed: parseJSONArray(body.materialsUsed),
    isActive: body.isActive !== undefined ? parseBoolean(body.isActive) : true,
    displayOrder: parseNumber(body.displayOrder, 0),
    isFeatured: body.isFeatured !== undefined ? parseBoolean(body.isFeatured) : false,
  };

  if (file) {
    data.coverImageUrl = file.path;
    data.cloudinaryPublicId = file.filename;
  }

  return data;
};

// @desc    Get all active projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    const projects = await Project.find(filter).sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { title, location, year, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required',
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project location is required',
      });
    }

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Project year is required',
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project category is required',
      });
    }

    const project = await Project.create(buildProjectData(req.body, req.file));

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (req.file && project.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(project.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion failed:', cloudinaryError.message);
      }
    }

    const updates = buildProjectData(req.body, req.file);

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        project[key] = updates[key];
      }
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(project.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion failed:', cloudinaryError.message);
      }
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle project active status
// @route   PATCH /api/projects/:id/toggle
// @access  Private
const toggleProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project.isActive = !project.isActive;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project ${project.isActive ? 'activated' : 'deactivated'} successfully`,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProject,
};
