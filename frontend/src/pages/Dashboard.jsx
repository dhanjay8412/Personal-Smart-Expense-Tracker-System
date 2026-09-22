import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { transactionService } from '../services/transactionService';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { IncomeExpenseBarChart } from '../components/dashboard/IncomeExpenseBarChart';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Actions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await analyticsService.getDashboardOverview();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to fetch dashboard metrics.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    try {
      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction._id, formData);
        setToast({ message: 'Transaction updated successfully!', type: 'success' });
      } else {
        await transactionService.createTransaction(formData);
        setToast({ message: 'Transaction added successfully!', type: 'success' });
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
      fetchDashboardData();
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
      fetchDashboardData();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete transaction', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  const { kpi, recentTransactions, categoryBreakdown, incomeVsExpenseChart, budgetStatus } = data || {};
  const currency = kpi?.currency || 'INR';

  const exceededBudgets = (budgetStatus || []).filter((b) => b.percentage >= 80);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Financial Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics & spending analytics</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Transaction
        </Button>
      </div>

      {/* Budget Warning Banners */}
      {exceededBudgets.length > 0 && (
        <div className="space-y-2">
          {exceededBudgets.map((b, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                b.percentage > 100
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {b.percentage > 100
                    ? `⚠ Budget Exceeded: ${b.category} budget spent ${b.percentage}%!`
                    : `⚠ Budget Alert: You have used ${b.percentage}% of your ${b.category} budget.`}
                </span>
              </div>
              <Link to="/budgets" className="text-sky-400 underline hover:text-sky-300 shrink-0">
                View Budgets
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          amount={kpi?.totalBalance || 0}
          currency={currency}
          icon={Wallet}
          colorScheme="sky"
          trendLabel="All-time Net Balance"
        />
        <StatCard
          title="Monthly Income"
          amount={kpi?.monthlyIncome || 0}
          currency={currency}
          icon={TrendingUp}
          colorScheme="emerald"
          trendLabel="This Month Earnings"
        />
        <StatCard
          title="Monthly Expenses"
          amount={kpi?.monthlyExpenses || 0}
          currency={currency}
          icon={TrendingDown}
          colorScheme="rose"
          trendLabel="This Month Spending"
        />
        <StatCard
          title="Monthly Savings"
          amount={kpi?.monthlySavings || 0}
          currency={currency}
          icon={PiggyBank}
          colorScheme="violet"
          trend={kpi?.savingsRate}
          trendLabel="Savings Rate"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Income vs Expenses" subtitle="6-Month Comparison Trend">
          <IncomeExpenseBarChart data={incomeVsExpenseChart} currency={currency} />
        </Card>

        <Card title="Expense Category Breakdown" subtitle="Current Month Distribution">
          <ExpensePieChart data={categoryBreakdown} currency={currency} />
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <Card
        title="Recent Transactions"
        subtitle="Latest 5 transactions recorded"
        action={
          <Link to="/transactions" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {recentTransactions && recentTransactions.length > 0 ? (
          <TransactionTable
            transactions={recentTransactions}
            currency={currency}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
            onDelete={(id) => setDeletingId(id)}
          />
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No transactions found. Click "Add Transaction" to record your first entry.
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Form Modal */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTransaction}
        isLoading={actionLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete Transaction"
        isLoading={actionLoading}
      />
    </div>
  );
};
