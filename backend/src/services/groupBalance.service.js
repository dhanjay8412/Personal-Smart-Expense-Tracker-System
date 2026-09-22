const SharedExpense = require('../models/SharedExpense');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

const calculateGroupBalances = async (groupId) => {
  const group = await Group.findById(groupId).populate('members.user', 'name email profileImage');
  if (!group) throw new Error('Group not found');

  const [expenses, settlements] = await Promise.all([
    SharedExpense.find({ groupId }).populate('paidBy', 'name email'),
    Settlement.find({ groupId }),
  ]);

  const memberBalances = {};

  group.members.forEach((m) => {
    const u = m.user;
    if (u && u._id) {
      const uid = u._id.toString();
      memberBalances[uid] = {
        userId: uid,
        name: u.name,
        email: u.email,
        profileImage: u.profileImage,
        role: m.role,
        paid: 0,
        share: 0,
        settlementsSent: 0,
        settlementsReceived: 0,
        netBalance: 0,
      };
    }
  });

  // Calculate expense payments & shares
  expenses.forEach((exp) => {
    const payerId = exp.paidBy._id ? exp.paidBy._id.toString() : exp.paidBy.toString();
    if (memberBalances[payerId]) {
      memberBalances[payerId].paid += exp.amount;
    }

    exp.participants.forEach((p) => {
      const partId = p.user.toString();
      if (memberBalances[partId]) {
        memberBalances[partId].share += p.shareAmount;
      }
    });
  });

  // Calculate settlements
  settlements.forEach((st) => {
    const fromId = st.fromUser.toString();
    const toId = st.toUser.toString();

    if (memberBalances[fromId]) {
      memberBalances[fromId].settlementsSent += st.amount;
    }
    if (memberBalances[toId]) {
      memberBalances[toId].settlementsReceived += st.amount;
    }
  });

  // Calculate final net balances
  const balancesList = Object.values(memberBalances).map((mb) => {
    const net = Number(
      (mb.paid - mb.share + mb.settlementsSent - mb.settlementsReceived).toFixed(2)
    );
    return {
      ...mb,
      paid: Number(mb.paid.toFixed(2)),
      share: Number(mb.share.toFixed(2)),
      netBalance: net,
    };
  });

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  return {
    groupId,
    groupName: group.name,
    totalExpenses: Number(totalExpense.toFixed(2)),
    memberCount: group.members.length,
    balances: balancesList,
  };
};

module.exports = { calculateGroupBalances };
