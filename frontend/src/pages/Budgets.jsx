import React, { useEffect, useState } from 'react';
import { budgetService } from '../services/budgetService';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetFormModal } from '../components/budgets/BudgetFormModal';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { Plus, PieChart, AlertTriangle } from 'lucide-react';

export const Budgets = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Action state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchBudgets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await budgetService.getBudgets({ month, year });
      if (res.success && res.data) {
        setBudgets(res.data);
      } else {
        setError(res.message || 'Failed to load budgets');
      }
    } catch (err) {
      setError(err.message || 'Error loading budgets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget._id, formData);
        setToast({ message: 'Budget updated successfully!', type: 'success' });
      } else {
        await budgetService.createBudget(formData);
        setToast({ message: 'Budget set successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingBudget(null);
      fetchBudgets();
    } catch (err) {
      setToast({ message: err.message || 'Failed to save budget', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await budgetService.deleteBudget(deletingId);
      setToast({ message: 'Budget deleted successfully!', type: 'success' });
      setDeletingId(null);
      fetchBudgets();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete budget', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Budget Management</h1>
          <p className="text-xs text-slate-400 mt-1">Set monthly limit thresholds & prevent overspending</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Month / Year Selectors */}
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            options={[
              { label: 'Jan', value: 1 },
              { label: 'Feb', value: 2 },
              { label: 'Mar', value: 3 },
              { label: 'Apr', value: 4 },
              { label: 'May', value: 5 },
              { label: 'Jun', value: 6 },
              { label: 'Jul', value: 7 },
              { label: 'Aug', value: 8 },
              { label: 'Sep', value: 9 },
              { label: 'Oct', value: 10 },
              { label: 'Nov', value: 11 },
              { label: 'Dec', value: 12 },
            ]}
          />

          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            options={[
              { label: '2024', value: 2024 },
              { label: '2025', value: 2025 },
              { label: '2026', value: 2026 },
            ]}
          />

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="shrink-0"
          >
            Set Budget
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      {!isLoading && !error && budgets.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Monthly Budget Summary</p>
              <h3 className="text-xl font-extrabold text-slate-100">
                {totalSpent.toLocaleString()} / {totalBudgeted.toLocaleString()} {currency}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Categories: {budgets.length}</span>
            <div className="text-xs font-bold text-sky-400 mt-0.5">
              {totalBudgeted > 0 ? `${((totalSpent / totalBudgeted) * 100).toFixed(1)}% Overall Budget Used` : '0%'}
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBudgets} />
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No Budgets Set"
          description={`You have not configured any category budgets for ${month}/${year}.`}
          actionLabel="Set Budget Now"
          onAction={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          icon={PieChart}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              currency={currency}
              onEdit={(b) => {
                setEditingBudget(b);
                setIsModalOpen(true);
              }}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingBudget}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message="Are you sure you want to remove this category budget limit?"
        confirmText="Delete Budget"
        isLoading={actionLoading}
      />
    </div>
  );
};
