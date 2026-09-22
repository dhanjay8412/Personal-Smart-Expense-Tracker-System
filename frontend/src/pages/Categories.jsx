import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Plus, Tag, Lock, Trash2, Edit2 } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setError(res.message || 'Failed to fetch categories.');
      }
    } catch (err) {
      setError(err.message || 'Error loading categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
        setToast({ message: 'Category updated successfully!', type: 'success' });
      } else {
        await categoryService.createCategory(formData);
        setToast({ message: 'Custom category created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      setToast({ message: err.message || 'Failed to save category', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await categoryService.deleteCategory(deletingId);
      setToast({ message: 'Category deleted successfully!', type: 'success' });
      setDeletingId(null);
      fetchCategories();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete category', type: 'error' });
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Categories</h1>
          <p className="text-xs text-slate-400 mt-1">System defaults & custom user expense/income categories</p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          Create Custom Category
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState title="No Categories Found" actionLabel="Create Category" onAction={() => setIsModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const isExpense = cat.type === 'Expense';
            return (
              <div
                key={cat._id}
                className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between transition-all hover:border-slate-700/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isExpense
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{cat.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {cat.type} {cat.isDefault ? '• Default' : '• Custom'}
                    </span>
                  </div>
                </div>

                <div>
                  {cat.isDefault ? (
                    <span className="p-2 text-slate-500" title="System default (Protected)">
                      <Lock className="w-4 h-4" />
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(cat._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCategory}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Custom Category"
        message="Are you sure you want to delete this custom category?"
        confirmText="Delete Category"
        isLoading={actionLoading}
      />
    </div>
  );
};
