import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, CheckCircle, Edit2, Trash2 } from 'lucide-react';

export const BudgetCard = ({ budget, currency = 'INR', onEdit, onDelete }) => {
  const { category, amount, spent, remaining, percentage, status } = budget;

  const getStatusColor = () => {
    if (status === 'exceeded') return 'border-rose-500/40 bg-rose-500/5';
    if (status === 'warning') return 'border-amber-500/40 bg-amber-500/5';
    return 'border-slate-800 hover:border-slate-700/80';
  };

  const getProgressColor = () => {
    if (status === 'exceeded') return 'bg-rose-500';
    if (status === 'warning') return 'bg-amber-500';
    return 'bg-sky-500';
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-slate-100 text-base">{category}</h4>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
            title="Edit Budget"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(budget._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete Budget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between text-xs mb-2">
        <span className="text-slate-400 font-medium">Spent: {formatCurrency(spent, currency)}</span>
        <span className="text-slate-300 font-semibold">Budget: {formatCurrency(amount, currency)}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mb-3 border border-slate-800">
        <div
          className={`h-full transition-all duration-500 rounded-full ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="font-extrabold text-slate-200">{percentage}% used</span>

        {status === 'exceeded' ? (
          <span className="flex items-center gap-1 font-bold text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Exceeded by {formatCurrency(Math.abs(remaining), currency)}
          </span>
        ) : status === 'warning' ? (
          <span className="flex items-center gap-1 font-bold text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {remaining > 0 ? `${formatCurrency(remaining, currency)} remaining` : 'Limit reached'}
          </span>
        ) : (
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {formatCurrency(remaining, currency)} remaining
          </span>
        )}
      </div>
    </div>
  );
};
