const Group = require('../models/Group');
const SharedExpense = require('../models/SharedExpense');
const Settlement = require('../models/Settlement');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { calculateGroupBalances } = require('../services/groupBalance.service');

// Middleware helper to verify group membership
const verifyMembership = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }
  const isMember = group.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'Access denied. You are not a member of this group.');
  }
  return group;
};

const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const group = await Group.create({
      name,
      description: description || '',
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'owner', joinedAt: new Date() }],
    });

    return res.status(201).json(new ApiResponse(201, group, 'Group created successfully'));
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email profileImage')
      .sort({ updatedAt: -1 });

    return res.status(200).json(new ApiResponse(200, groups, 'User groups retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getGroupById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await verifyMembership(id, req.user._id);

    const populated = await Group.findById(id).populate('members.user', 'name email profileImage');
    return res.status(200).json(new ApiResponse(200, populated, 'Group details retrieved'));
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await verifyMembership(id, req.user._id);

    const { name, description } = req.body;
    if (name) group.name = name;
    if (description !== undefined) group.description = description;

    await group.save();
    return res.status(200).json(new ApiResponse(200, group, 'Group updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await verifyMembership(id, req.user._id);

    // Only owner can delete group
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Only the group owner can delete this group'));
    }

    await Promise.all([
      SharedExpense.deleteMany({ groupId: id }),
      Settlement.deleteMany({ groupId: id }),
      Group.findByIdAndDelete(id),
    ]);

    return res.status(200).json(new ApiResponse(200, null, 'Group and shared expenses deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// Member management
const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const group = await verifyMembership(id, req.user._id);

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return next(new ApiError(404, `No registered user found with email "${email}"`));
    }

    const alreadyMember = group.members.some((m) => m.user.toString() === targetUser._id.toString());
    if (alreadyMember) {
      return next(new ApiError(400, 'User is already a member of this group'));
    }

    group.members.push({ user: targetUser._id, role: 'member', joinedAt: new Date() });
    await group.save();

    const updated = await Group.findById(id).populate('members.user', 'name email profileImage');
    return res.status(200).json(new ApiResponse(200, updated, 'Member added to group'));
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const group = await verifyMembership(id, req.user._id);

    group.members = group.members.filter((m) => m.user.toString() !== userId);
    await group.save();

    return res.status(200).json(new ApiResponse(200, null, 'Member removed from group'));
  } catch (error) {
    next(error);
  }
};

// Shared Expenses
const getSharedExpenses = async (req, res, next) => {
  try {
    const { id } = req.params;
    await verifyMembership(id, req.user._id);

    const expenses = await SharedExpense.find({ groupId: id })
      .populate('paidBy', 'name email profileImage')
      .populate('participants.user', 'name email')
      .sort({ date: -1 });

    return res.status(200).json(new ApiResponse(200, expenses, 'Shared expenses retrieved'));
  } catch (error) {
    next(error);
  }
};

const createSharedExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await verifyMembership(id, req.user._id);

    const { amount, description, category, date, splitMethod, participantsCustom } = req.body;

    const memberIds = group.members.map((m) => m.user.toString());
    const totalMembers = memberIds.length;

    let participants = [];

    if (splitMethod === 'equal' || !splitMethod) {
      const perPersonShare = Number((amount / totalMembers).toFixed(2));
      participants = memberIds.map((mId) => ({
        user: mId,
        shareAmount: perPersonShare,
        percentage: Number((100 / totalMembers).toFixed(2)),
      }));
    } else if (splitMethod === 'custom') {
      let sum = 0;
      participants = participantsCustom.map((p) => {
        sum += p.shareAmount;
        return {
          user: p.user,
          shareAmount: p.shareAmount,
        };
      });

      if (Math.abs(sum - amount) > 0.05) {
        return next(new ApiError(400, `Sum of custom shares (${sum}) must equal total amount (${amount})`));
      }
    } else if (splitMethod === 'percentage') {
      let pctSum = 0;
      participants = participantsCustom.map((p) => {
        pctSum += p.percentage;
        const share = Number(((amount * p.percentage) / 100).toFixed(2));
        return {
          user: p.user,
          percentage: p.percentage,
          shareAmount: share,
        };
      });

      if (Math.abs(pctSum - 100) > 0.1) {
        return next(new ApiError(400, `Total percentages (${pctSum}%) must sum to 100%`));
      }
    }

    const expense = await SharedExpense.create({
      groupId: id,
      paidBy: req.user._id,
      amount,
      description,
      category: category || 'Other',
      date: date ? new Date(date) : new Date(),
      splitMethod: splitMethod || 'equal',
      participants,
    });

    return res.status(201).json(new ApiResponse(201, expense, 'Shared expense recorded'));
  } catch (error) {
    next(error);
  }
};

const deleteSharedExpense = async (req, res, next) => {
  try {
    const { id, expenseId } = req.params;
    await verifyMembership(id, req.user._id);

    const expense = await SharedExpense.findOneAndDelete({ _id: expenseId, groupId: id });
    if (!expense) {
      return next(new ApiError(404, 'Shared expense not found'));
    }

    return res.status(200).json(new ApiResponse(200, null, 'Shared expense deleted'));
  } catch (error) {
    next(error);
  }
};

// Settlements
const addSettlement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await verifyMembership(id, req.user._id);

    const { toUser, amount, note } = req.body;

    const settlement = await Settlement.create({
      groupId: id,
      fromUser: req.user._id,
      toUser,
      amount,
      note: note || 'Group balance settlement',
      date: new Date(),
    });

    return res.status(201).json(new ApiResponse(201, settlement, 'Settlement recorded successfully'));
  } catch (error) {
    next(error);
  }
};

const getGroupBalancesData = async (req, res, next) => {
  try {
    const { id } = req.params;
    await verifyMembership(id, req.user._id);

    const balanceData = await calculateGroupBalances(id);
    return res.status(200).json(new ApiResponse(200, balanceData, 'Group balances calculated'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  getSharedExpenses,
  createSharedExpense,
  deleteSharedExpense,
  addSettlement,
  getGroupBalancesData,
};
