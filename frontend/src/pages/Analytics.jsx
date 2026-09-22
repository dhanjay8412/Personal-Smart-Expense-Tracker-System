import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, PiggyBank, DollarSign, CreditCard, BarChart2, ArrowUpRight, ArrowDownLeft, Minus } from 'lucide-react';

export const Analytics = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'paymentMethods' | 'spendingTrends'
  const [range, setRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [data, setData] = useState(null);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [spendingTrendsData, setSpendingTrendsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        const res = await analyticsService.getAnalyticsTrends({ range, startDate, endDate });
        if (res.success && res.data) setData(res.data);
      } else if (activeTab === 'paymentMethods') {
        const res = await analyticsService.getPaymentMethods({ range, startDate, endDate });
        if (res.success && res.data) setPaymentMethodsData(res.data);
      } else if (activeTab === 'spendingTrends') {
        const res = await analyticsService.getSpendingTrends();
        if (res.success && res.data) setSpendingTrendsData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, range, startDate, endDate]);

  const { summary, categoryDistribution, paymentMethodDistribution, dailyTrend } = data || {};

  const categoryPieData = (categoryDistribution || []).map((c) => ({
    name: c._id,
    amount: c.total,
    percentage: summary?.totalExpenses > 0 ? Number(((c.total / summary.totalExpenses) * 100).toFixed(1)) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Financial Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Deep-dive analysis into spending patterns and payment habits</p>
        </div>

        {/* Date Filter Controls */}
        {activeTab !== 'spendingTrends' && (
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              options={[
                { label: 'This Month', value: 'thisMonth' },
                { label: 'Last Month', value: 'lastMonth' },
                { label: 'Last 3 Months', value: 'last3Months' },
                { label: 'Last 6 Months', value: 'last6Months' },
                { label: 'This Year', value: 'thisYear' },
                { label: 'Custom Range', value: 'custom' },
              ]}
            />

            {range === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="py-1.5 text-xs"
                />
                <span className="text-xs text-slate-500">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="py-1.5 text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('paymentMethods')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'paymentMethods'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
          }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab('spendingTrends')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'spendingTrends'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
          }`}
        >
          Spending Trends
        </button>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAnalytics} />
      ) : activeTab === 'overview' ? (
        /* TAB 1: OVERVIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Period Income"
              amount={summary?.totalIncome || 0}
              currency={currency}
              icon={TrendingUp}
              colorScheme="emerald"
            />
            <StatCard
              title="Total Period Expenses"
              amount={summary?.totalExpenses || 0}
              currency={currency}
              icon={TrendingDown}
              colorScheme="rose"
            />
            <StatCard
              title="Period Net Savings"
              amount={summary?.savings || 0}
              currency={currency}
              icon={PiggyBank}
              colorScheme="violet"
            />
            <StatCard
              title="Average Expense / Tx"
              amount={summary?.averageExpense || 0}
              currency={currency}
              icon={DollarSign}
              colorScheme="sky"
            />
          </div>

          <Card title="Daily Spending Trend" subtitle="Expense amount progression over selected period">
            <SpendingTrendChart data={dailyTrend} currency={currency} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Category Spending Share" subtitle="Proportional expense breakdown">
              <ExpensePieChart data={categoryPieData} currency={currency} />
            </Card>

            <Card title="Payment Method Distribution" subtitle="Spending by payment mode">
              <div className="space-y-4 py-2">
                {paymentMethodDistribution && paymentMethodDistribution.length > 0 ? (
                  paymentMethodDistribution.map((pm, idx) => {
                    const totalSpent = summary?.totalExpenses || 1;
                    const pct = ((pm.total / totalSpent) * 100).toFixed(1);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{pm._id || 'Cash'}</span>
                          <span className="text-slate-400 font-semibold">
                            {formatCurrency(pm.total, currency)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-sky-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No payment distribution data.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : activeTab === 'paymentMethods' ? (
        /* TAB 2: PAYMENT METHODS */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethodsData.map((pm, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">{pm.paymentMethod}</span>
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-100">{formatCurrency(pm.amount, currency)}</h3>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>{pm.count} Transactions</span>
                  <span className="font-bold text-sky-400">{pm.percentage}% of total</span>
                </div>
              </div>
            ))}
          </div>

          <Card title="Payment Method Share Chart" subtitle="Visual comparison across payment modes">
            <ExpensePieChart
              data={paymentMethodsData.map((p) => ({
                name: p.paymentMethod,
                amount: p.amount,
                percentage: p.percentage,
              }))}
              currency={currency}
            />
          </Card>
        </div>
      ) : (
        /* TAB 3: SPENDING TRENDS */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Current Month Spending</span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-2">
                {formatCurrency(spendingTrendsData?.currentPeriod?.amount || 0, currency)}
              </h3>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Previous Month Spending</span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-2">
                {formatCurrency(spendingTrendsData?.previousPeriod?.amount || 0, currency)}
              </h3>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Period Difference</span>
              <h3
                className={`text-2xl font-extrabold mt-2 ${
                  (spendingTrendsData?.difference || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {(spendingTrendsData?.difference || 0) > 0 ? '+' : ''}
                {formatCurrency(spendingTrendsData?.difference || 0, currency)} (
                {spendingTrendsData?.percentageChange}%)
              </h3>
            </div>
          </div>

          <Card title="Category Spending Comparison" subtitle="Current vs Previous Month changes">
            <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Previous Month</th>
                    <th className="p-3">Current Month</th>
                    <th className="p-3">Difference</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  {(spendingTrendsData?.categoryChanges || []).map((cat, idx) => {
                    const isIncreased = cat.difference > 0;
                    return (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-slate-100">{cat.category}</td>
                        <td className="p-3 text-slate-400">{formatCurrency(cat.previous, currency)}</td>
                        <td className="p-3 font-bold text-slate-200">{formatCurrency(cat.current, currency)}</td>
                        <td className={`p-3 font-extrabold ${isIncreased ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isIncreased ? '+' : ''}{formatCurrency(cat.difference, currency)} ({cat.percentageChange}%)
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              cat.status === 'Increasing'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : cat.status === 'Decreasing'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {cat.status === 'Increasing' ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : cat.status === 'Decreasing' ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                            {cat.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
