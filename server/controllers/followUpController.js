const FollowUp = require('../models/FollowUp');
const Inquiry = require('../models/Inquiry');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  d.setHours(23, 59, 59, 999);
  return d;
};

const addIsOverdue = (doc) => {
  const now = new Date();
  const followUpDate = new Date(doc.followUpDate);
  followUpDate.setHours(23, 59, 59, 999);
  const isOverdue = doc.status === 'pending' && followUpDate < now;
  return { ...doc.toObject(), isOverdue };
};

// ─── Get All Follow-Ups ────────────────────────────────────────────────────────

// @desc    Get all follow-ups with filters
// @route   GET /api/followups
// @access  Private
const getFollowUps = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      clientType,
      followUpType,
      date,
      dateFrom,
      dateTo,
      search,
      overdue,
      today,
      thisWeek,
      upcoming,
    } = req.query;

    const now = new Date();
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (clientType) filter.clientType = clientType;
    if (followUpType) filter.followUpType = followUpType;

    // Date filters
    if (date) {
      const d = new Date(date);
      filter.followUpDate = {
        $gte: getStartOfDay(d),
        $lte: getEndOfDay(d),
      };
    } else if (dateFrom || dateTo) {
      filter.followUpDate = {};
      if (dateFrom) filter.followUpDate.$gte = getStartOfDay(new Date(dateFrom));
      if (dateTo) filter.followUpDate.$lte = getEndOfDay(new Date(dateTo));
    }

    if (overdue === 'true') {
      filter.status = 'pending';
      filter.followUpDate = { $lt: getStartOfDay(now) };
    }

    if (today === 'true') {
      filter.followUpDate = {
        $gte: getStartOfDay(now),
        $lte: getEndOfDay(now),
      };
    }

    if (thisWeek === 'true') {
      filter.followUpDate = {
        $gte: getStartOfWeek(now),
        $lte: getEndOfWeek(now),
      };
    }

    if (upcoming === 'true') {
      filter.status = 'pending';
      filter.followUpDate = { $gte: getStartOfDay(now) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { clientName: searchRegex },
        { clientPhone: searchRegex },
        { projectName: searchRegex },
      ];
    }

    // Sort
    let sortOpt = { followUpDate: 1 };
    if (upcoming === 'true') sortOpt = { followUpDate: 1 };

    const followUps = await FollowUp.find(filter).sort(sortOpt);

    // Compute summary counts
    const allPending = await FollowUp.countDocuments({ status: 'pending' });
    const nowStart = getStartOfDay(now);
    const nowEnd = getEndOfDay(now);
    const overdueCount = await FollowUp.countDocuments({
      status: 'pending',
      followUpDate: { $lt: nowStart },
    });
    const todayCount = await FollowUp.countDocuments({
      followUpDate: { $gte: nowStart, $lte: nowEnd },
    });
    const completedCount = await FollowUp.countDocuments({ status: 'completed' });
    const highPriorityCount = await FollowUp.countDocuments({
      status: 'pending',
      priority: 'high',
    });

    // Total pipeline value (sum of estimatedValue for pending)
    const pipelineAgg = await FollowUp.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } },
    ]);
    const totalPipelineValue = pipelineAgg[0]?.total || 0;

    const weekStart = getStartOfWeek(now);
    const weekEnd = getEndOfWeek(now);
    const thisWeekCount = await FollowUp.countDocuments({
      followUpDate: { $gte: weekStart, $lte: weekEnd },
    });

    const data = followUps.map(addIsOverdue);

    res.status(200).json({
      success: true,
      count: data.length,
      totalCount: await FollowUp.countDocuments(),
      pendingCount: allPending,
      overdueCount,
      todayCount,
      thisWeekCount,
      completedCount,
      highPriorityCount,
      totalPipelineValue,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Create Follow-Up ─────────────────────────────────────────────────────────

// @desc    Create new follow-up
// @route   POST /api/followups
// @access  Private
const createFollowUp = async (req, res, next) => {
  try {
    const { clientName, clientPhone, followUpDate, clientType, followUpType, priority } = req.body;

    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required' });
    }
    if (!clientPhone || !clientPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Client phone is required' });
    }
    if (!followUpDate) {
      return res.status(400).json({ success: false, message: 'Follow-up date is required' });
    }
    if (!clientType) {
      return res.status(400).json({ success: false, message: 'Client type is required' });
    }
    if (!followUpType) {
      return res.status(400).json({ success: false, message: 'Follow-up type is required' });
    }
    if (!priority) {
      return res.status(400).json({ success: false, message: 'Priority is required' });
    }

    const followUp = await FollowUp.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Follow-up created successfully',
      data: addIsOverdue(followUp),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Follow-Up ─────────────────────────────────────────────────────

// @desc    Get single follow-up
// @route   GET /api/followups/:id
// @access  Private
const getFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id).populate('linkedInquiryId');

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    res.status(200).json({
      success: true,
      data: addIsOverdue(followUp),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Follow-Up ─────────────────────────────────────────────────────────

// @desc    Update follow-up
// @route   PUT /api/followups/:id
// @access  Private
const updateFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully',
      data: addIsOverdue(followUp),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Follow-Up Status ──────────────────────────────────────────────────

// @desc    Update status and optionally create next follow-up
// @route   PATCH /api/followups/:id/status
// @access  Private
const updateFollowUpStatus = async (req, res, next) => {
  try {
    const { status, outcome, nextFollowUpDate } = req.body;
    const allowedStatuses = ['pending', 'completed', 'rescheduled', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: pending, completed, rescheduled, cancelled',
      });
    }

    const updateData = { status };
    if (outcome !== undefined) updateData.outcome = outcome;

    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    let newFollowUp = null;

    // Auto-create next follow-up if completed or rescheduled with a next date
    if (
      (status === 'completed' || status === 'rescheduled') &&
      nextFollowUpDate
    ) {
      const fmtDate = new Date(followUp.followUpDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      newFollowUp = await FollowUp.create({
        clientName: followUp.clientName,
        clientPhone: followUp.clientPhone,
        clientEmail: followUp.clientEmail,
        clientCity: followUp.clientCity,
        clientType: followUp.clientType,
        projectName: followUp.projectName,
        materialsInterested: followUp.materialsInterested,
        estimatedValue: followUp.estimatedValue,
        followUpDate: nextFollowUpDate,
        followUpTime: followUp.followUpTime,
        followUpType: followUp.followUpType,
        priority: followUp.priority,
        linkedInquiryId: followUp.linkedInquiryId,
        tags: followUp.tags,
        status: 'pending',
        description: `Follow-up from previous interaction on ${fmtDate}`,
        createdBy: 'admin',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: addIsOverdue(followUp),
      newFollowUp: newFollowUp ? addIsOverdue(newFollowUp) : null,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Follow-Up ─────────────────────────────────────────────────────────

// @desc    Delete follow-up
// @route   DELETE /api/followups/:id
// @access  Private
const deleteFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findByIdAndDelete(req.params.id);

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Follow-up deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Stats Summary ────────────────────────────────────────────────────────────

// @desc    Get aggregated stats
// @route   GET /api/followups/stats/summary
// @access  Private
const getStatsSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfDay = getStartOfDay(now);

    const [
      totalThisMonth,
      completedThisMonth,
      overdueCount,
      highPriorityPending,
      pipelineAgg,
      byClientType,
      byFollowUpType,
      byStatus,
    ] = await Promise.all([
      FollowUp.countDocuments({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }),
      FollowUp.countDocuments({
        status: 'completed',
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      FollowUp.countDocuments({ status: 'pending', followUpDate: { $lt: startOfDay } }),
      FollowUp.countDocuments({ status: 'pending', priority: 'high' }),
      FollowUp.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } },
      ]),
      FollowUp.aggregate([
        { $group: { _id: '$clientType', count: { $sum: 1 } } },
      ]),
      FollowUp.aggregate([
        { $group: { _id: '$followUpType', count: { $sum: 1 } } },
      ]),
      FollowUp.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalThisMonth,
        completedThisMonth,
        overdueCount,
        highPriorityPending,
        totalPipelineValue: pipelineAgg[0]?.total || 0,
        byClientType: Object.fromEntries(byClientType.map((i) => [i._id, i.count])),
        byFollowUpType: Object.fromEntries(byFollowUpType.map((i) => [i._id, i.count])),
        byStatus: Object.fromEntries(byStatus.map((i) => [i._id, i.count])),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Calendar Month ────────────────────────────────────────────────────────────

// @desc    Get follow-ups grouped by date for a month
// @route   GET /api/followups/calendar/month
// @access  Private
const getCalendarMonth = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) - 1 || new Date().getMonth();

    const startDate = new Date(y, m, 1, 0, 0, 0, 0);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const followUps = await FollowUp.find({
      followUpDate: { $gte: startDate, $lte: endDate },
    }).sort({ followUpDate: 1 });

    // Group by date string key
    const grouped = {};
    for (const fu of followUps) {
      const d = new Date(fu.followUpDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(addIsOverdue(fu));
    }

    res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFollowUps,
  createFollowUp,
  getFollowUp,
  updateFollowUp,
  updateFollowUpStatus,
  deleteFollowUp,
  getStatsSummary,
  getCalendarMonth,
};
