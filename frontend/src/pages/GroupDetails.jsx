import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Toast } from '../components/common/Toast';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  ArrowLeft,
  UserPlus,
  Receipt,
  DollarSign,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const GroupDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balancesData, setBalancesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    category: 'Food',
    splitMethod: 'equal',
  });

  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    toUser: '',
    amount: '',
    note: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadGroupData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [gRes, eRes, bRes] = await Promise.all([
        groupService.getGroupById(id),
        groupService.getSharedExpenses(id),
        groupService.getBalances(id),
      ]);

      if (gRes.success) setGroup(gRes.data);
      if (eRes.success) setExpenses(eRes.data);
      if (bRes.success) setBalancesData(bRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load group details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setActionLoading(true);
    try {
      await groupService.addMember(id, memberEmail);
      setToast({ message: 'Member added to group!', type: 'success' });
      setIsMemberModalOpen(false);
      setMemberEmail('');
      loadGroupData();
    } catch (err) {
      setToast({ message: err.message || 'Failed to add member', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) return;
    setActionLoading(true);
    try {
      await groupService.createSharedExpense(id, {
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
        category: expenseForm.category,
        splitMethod: expenseForm.splitMethod,
      });
      setToast({ message: 'Shared expense recorded!', type: 'success' });
      setIsExpenseModalOpen(false);
      setExpenseForm({ amount: '', description: '', category: 'Food', splitMethod: 'equal' });
      loadGroupData();
    } catch (err) {
      setToast({ message: err.message || 'Failed to record expense', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await groupService.deleteSharedExpense(id, expenseId);
      setToast({ message: 'Shared expense deleted!', type: 'success' });
      loadGroupData();
    } catch (err) {
      setToast({ message: 'Failed to delete expense', type: 'error' });
    }
  };

  const handleAddSettlement = async (e) => {
    e.preventDefault();
    if (!settlementForm.toUser || !settlementForm.amount) return;
    setActionLoading(true);
    try {
      await groupService.addSettlement(id, {
        toUser: settlementForm.toUser,
        amount: Number(settlementForm.amount),
        note: settlementForm.note,
      });
      setToast({ message: 'Settlement payment recorded!', type: 'success' });
      setIsSettlementModalOpen(false);
      setSettlementForm({ toUser: '', amount: '', note: '' });
      loadGroupData();
    } catch (err) {
      setToast({ message: err.message || 'Failed to record settlement', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <CardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadGroupData} />;

  const myBalance = balancesData?.balances?.find((b) => b.userId === user?._id);

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/groups" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">{group?.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{group?.description || 'Group Expense Splitting'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={UserPlus} onClick={() => setIsMemberModalOpen(true)}>
            Add Member
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsExpenseModalOpen(true)}>
            Add Shared Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Group Expenses</span>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">
            {formatCurrency(balancesData?.totalExpenses || 0, currency)}
          </h3>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Members Count</span>
          <h3 className="text-2xl font-extrabold text-sky-400 mt-2">
            {group?.members?.length || 1} Members
          </h3>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Your Net Balance</span>
          <h3
            className={`text-2xl font-extrabold mt-2 ${
              (myBalance?.netBalance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(myBalance?.netBalance || 0) >= 0 ? '+' : ''}
            {formatCurrency(myBalance?.netBalance || 0, currency)}
          </h3>
        </div>
      </div>

      {/* Balances & Settlement Section */}
      <Card title="Group Member Balances" subtitle="Net calculated balance per participant">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balancesData?.balances?.map((mb) => {
            const isPositive = mb.netBalance >= 0;
            return (
              <div key={mb.userId} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{mb.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Paid: {formatCurrency(mb.paid, currency)} • Share: {formatCurrency(mb.share, currency)}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-extrabold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(mb.netBalance, currency)}
                  </span>
                  <p className="text-[10px] text-slate-500">{isPositive ? 'Gets back' : 'Owes'}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
          <Button variant="outline" size="sm" icon={DollarSign} onClick={() => setIsSettlementModalOpen(true)}>
            Record Settlement Payment
          </Button>
        </div>
      </Card>

      {/* Shared Expenses List */}
      <Card title="Group Shared Expenses" subtitle="History of bills recorded for this group">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No shared expenses recorded yet. Click "Add Shared Expense" to start.
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp._id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{exp.description}</h4>
                    <p className="text-[11px] text-slate-400">
                      Paid by <strong className="text-slate-200">{exp.paidBy?.name}</strong> • Split ({exp.splitMethod}) • {formatDate(exp.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold text-slate-100">
                    {formatCurrency(exp.amount, currency)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Member Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Invite Member to Group" maxWidth="max-w-md">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="User Email Address"
            type="email"
            placeholder="e.g. friend@example.com"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Shared Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Group Shared Expense" maxWidth="max-w-md">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Hotel Stay, Dinner, Car Rental"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            required
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="e.g. 3000"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            required
          />

          <Select
            label="Category"
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            options={[
              { label: 'Food', value: 'Food' },
              { label: 'Transportation', value: 'Transportation' },
              { label: 'Travel', value: 'Travel' },
              { label: 'Rent', value: 'Rent' },
              { label: 'Entertainment', value: 'Entertainment' },
              { label: 'Other', value: 'Other' },
            ]}
          />

          <Select
            label="Split Method"
            value={expenseForm.splitMethod}
            onChange={(e) => setExpenseForm({ ...expenseForm, splitMethod: e.target.value })}
            options={[
              { label: 'Equal Split', value: 'equal' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Record Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Settlement Modal */}
      <Modal isOpen={isSettlementModalOpen} onClose={() => setIsSettlementModalOpen(false)} title="Record Settlement Payment" maxWidth="max-w-md">
        <form onSubmit={handleAddSettlement} className="space-y-4">
          <Select
            label="Paid To (Member)"
            value={settlementForm.toUser}
            onChange={(e) => setSettlementForm({ ...settlementForm, toUser: e.target.value })}
            options={[
              { label: 'Select Member...', value: '' },
              ...(group?.members || [])
                .filter((m) => m.user?._id !== user?._id)
                .map((m) => ({ label: m.user?.name || m.user?.email, value: m.user?._id })),
            ]}
            required
          />

          <Input
            label="Settlement Amount"
            type="number"
            step="0.01"
            placeholder="e.g. 1000"
            value={settlementForm.amount}
            onChange={(e) => setSettlementForm({ ...settlementForm, amount: e.target.value })}
            required
          />

          <Input
            label="Note (Optional)"
            placeholder="e.g. UPI transfer for dinner"
            value={settlementForm.note}
            onChange={(e) => setSettlementForm({ ...settlementForm, note: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsSettlementModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Settlement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
