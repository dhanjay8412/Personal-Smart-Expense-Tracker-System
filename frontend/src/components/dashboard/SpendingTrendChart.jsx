import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export const SpendingTrendChart = ({ data = [], currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-500">
        No daily spending trend available.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: item._id?.dateStr || item.date || '',
    amount: item.total || item.amount || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-slate-300">{label}</p>
          <p className="text-sky-400 font-extrabold mt-1">
            Spent: {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0284c7"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
