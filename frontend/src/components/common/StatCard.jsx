import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const StatCard = ({
  title,
  amount,
  currency = 'INR',
  icon: Icon,
  trend,
  trendLabel,
  colorScheme = 'sky', // sky, emerald, rose, violet
}) => {
  const schemes = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${schemes[colorScheme]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          {typeof amount === 'number' ? formatCurrency(amount, currency) : amount}
        </h3>
        {trendLabel && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
            {trend && <span className={trend > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{trend}%</span>}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
