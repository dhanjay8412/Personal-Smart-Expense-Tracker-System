import React, { useEffect, useState } from 'react';
import { recurringService } from '../services/recurringService';
import { RecurringFormModal } from '../components/recurring/RecurringFormModal';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { Plus, Repeat, Calendar, Edit2, Trash2, CheckCircle2, PauseCircle } from 'lucide-react';

export const Recurring = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [recurringList, setRecurringList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Action state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchRecurring = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await recurringService.getRecurringTransactions();
      if (res.success && res.data) {
        setRecurringList(res.data);
      } else {
        setError(res.message || 'Failed to fetch recurring transactions.');
      }
    } catch (err) {
      setError(err.message || 'Error loading recurring items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    try {
      if (editingItem) {
        await recurringService.updateRecurringTransaction(editingItem._id, formData);
        setToast({ message: 'Recurring setup updated successfully!', type: 'success' });
      } else {
        await recurringService.createRecurringTransaction(formData);
        setToast({ message: 'Recurring transaction created!', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchRecurring();
    } catch (err) {
      setToast({ message: err.message || 'Failed to save recurring item', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await recurringService.updateRecurringTransaction(item._id, { isActive: !item.isActive });
      setToast({ message: `Recurring item ${!item.isActive ? 'activated' : 'paused'}`, type: 'info' });
      fetchRecurring();
    } catch (err) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await recurringService.deleteRecurringTransaction(deletingId);
      setToast({ message: 'Recurring item deleted successfully!', type: 'success' });
      setDeletingId(null);
      fetchRecurring();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete item', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Recurring Transactions</h1>
          <p className="text-xs text-slate-400 mt-1">Automate subscriptions, rent, and scheduled recurring bills</p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        >
          Add Recurring Setup
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecurring} />
      ) : recurringList.length === 0 ? (
        <EmptyState
          title="No Recurring Transactions"
          description="Automate monthly Netflix subscriptions, rent, or bill payments."
          actionLabel="Add Recurring Setup"
          onAction={() => setIsModalOpen(true)}
          icon={Repeat}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recurringList.map((item) => (
            <div
              key={item._id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                item.isActive ? 'border-slate-800 hover:border-slate-700/80' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(item)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    item.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {item.isActive ? 'Active' : 'Paused'}
                </button>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xl font-extrabold text-slate-100">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80">
                  {item.frequency}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span>Next Execution:</span>
                  <span className="font-semibold text-sky-400">{formatDate(item.nextExecutionDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Method:</span>
                  <span className="text-slate-300 font-medium">{item.paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(item._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <RecurringFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingItem}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Recurring Transaction"
        message="Are you sure you want to stop and delete this automated recurring transaction?"
        confirmText="Delete Recurring"
        isLoading={actionLoading}
      />
    </div>
  );
};
