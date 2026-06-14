const Inquiry = require('../models/Inquiry');
const { sendInquiryNotification } = require('../utils/sendEmail');
const { getClientIp, formatIST, escapeCsvValue } = require('../utils/helpers');

// @desc    Submit a new inquiry
// @route   POST /api/inquiries
// @access  Public
const createInquiry = async (req, res, next) => {
  try {
    const { fullName, phoneNumber } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const inquiry = await Inquiry.create({
      ...req.body,
      ipAddress: getClientIp(req),
    });

    await sendInquiryNotification(inquiry);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private
const getInquiries = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ fullName: searchRegex }, { phoneNumber: searchRegex }];
    }

    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
    const newCount = await Inquiry.countDocuments({ status: 'new' });

    res.status(200).json({
      success: true,
      message: 'Inquiries retrieved successfully',
      count: inquiries.length,
      newCount,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export inquiries as CSV
// @route   GET /api/inquiries/export
// @access  Private
const exportInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    const headers = [
      'Name',
      'Phone',
      'Email',
      'City',
      'Project Type',
      'Material Required',
      'Message',
      'Status',
      'Source',
      'Date Submitted',
    ];

    const rows = inquiries.map((inquiry) =>
      [
        inquiry.fullName,
        inquiry.phoneNumber,
        inquiry.emailAddress,
        inquiry.city,
        inquiry.projectType,
        inquiry.materialRequired,
        inquiry.message,
        inquiry.status,
        inquiry.source,
        formatIST(inquiry.createdAt),
      ]
        .map(escapeCsvValue)
        .join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=thakkar-inquiries.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private
const getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry retrieved successfully',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status
// @route   PATCH /api/inquiries/:id/status
// @access  Private
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['new', 'read', 'replied'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: new, read, replied',
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private
const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  exportInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
};
