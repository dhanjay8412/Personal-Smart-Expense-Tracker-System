import React, { useEffect, useState, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { exportService } from '../services/exportService';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionCard } from '../components/transactions/TransactionCard';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { FilterPanel } from '../components/transactions/FilterPanel';
import { CSVImportModal } from '../components/csv/CSVImportModal';
import { Pagination } from '../components/common/Pagination';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Download, FileSpreadsheet, FileText, Upload } from 'lucide-react';

export const Transactions = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    category: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Modal & Action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await transactionService.getTransactions(filters);
      if (res.success && res.data) {
        setTransactions(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError(err.message || 'Error loading transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    try {
      if (editingTx) {
        await transactionService.updateTransaction(editingTx._id, formData);
        setToast({ message: 'Transaction updated successfully!', type: 'success' });
      } else {
        await transactionService.createTransaction(formData);
        setToast({ message: 'Transaction added successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingTx(null);
      fetchTransactions();
    } catch (err) {
      setToast({ message: err.message || 'Failed to save transaction', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await transactionService.deleteTransaction(deletingId);
      setToast({ message: 'Transaction deleted successfully!', type: 'success' });
      setDeletingId(null);
      fetchTransactions();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete transaction', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportService.downloadCSV(filters);
      setToast({ message: 'CSV Statement downloaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to export CSV', type: 'error' });
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportService.downloadPDF(filters);
      setToast({ message: 'PDF Statement downloaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to export PDF', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-400 mt-1">Manage, filter, search and export your financial records</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" icon={Upload} onClick={() => setIsImportModalOpen(true)}>
            Import File
          </Button>
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" icon={FileText} onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingTx(null);
              setIsModalOpen(true);
            }}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() =>
          setFilters({
            page: 1,
            limit: 10,
            search: '',
            type: '',
            category: '',
            paymentMethod: '',
            startDate: '',
            endDate: '',
            sortBy: 'date',
            sortOrder: 'desc',
          })
        }
        categories={categories}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTransactions} />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description="No financial transactions match your current search or filter criteria."
          actionLabel="Add Transaction"
          onAction={() => {
            setEditingTx(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <TransactionTable
              transactions={transactions}
              currency={currency}
              onEdit={(tx) => {
                setEditingTx(tx);
                setIsModalOpen(true);
              }}
              onDelete={(id) => setDeletingId(id)}
            />
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {transactions.map((tx) => (
              <TransactionCard
                key={tx._id}
                tx={tx}
                currency={currency}
                onEdit={(item) => {
                  setEditingTx(item);
                  setIsModalOpen(true);
                }}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalResults={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => setFilters({ ...filters, page: p })}
          />
        </div>
      )}

      {/* Add / Edit Transaction Form Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTx}
        isLoading={actionLoading}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          setToast({ message: 'Transactions imported successfully!', type: 'success' });
          fetchTransactions();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to permanently remove this transaction record?"
        confirmText="Delete Transaction"
        isLoading={actionLoading}
      />
    </div>
  );
};
