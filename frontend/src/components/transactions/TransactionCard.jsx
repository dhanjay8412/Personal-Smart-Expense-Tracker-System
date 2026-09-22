import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const TransactionCard = ({ tx, currency = 'INR', onEdit, onDelete }) => {
  const isExpense = tx.type === 'Expense';

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {isExpense ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm">{tx.description}</h4>
            <p className="text-xs text-slate-400">{tx.category}</p>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-base font-extrabold ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(tx.date)}</p>
        </div>
      </div>

      {tx.notes && (
        <p className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 italic">
          "{tx.notes}"
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700/80">
          {tx.paymentMethod || 'Cash'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(tx)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-sky-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(tx._id)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
