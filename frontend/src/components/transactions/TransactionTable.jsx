import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const TransactionTable = ({ transactions = [], currency = 'INR', onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="py-3.5 px-4">Transaction</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Payment Method</th>
            <th className="py-3.5 px-4">Date</th>
            <th className="py-3.5 px-4 text-right">Amount</th>
            <th className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
          {transactions.map((tx) => {
            const isExpense = tx.type === 'Expense';
            return (
              <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {isExpense ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                        {tx.description}
                      </p>
                      {tx.notes && <p className="text-[10px] text-slate-500 truncate max-w-xs">{tx.notes}</p>}
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-medium text-slate-300">{tx.category}</td>

                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/80">
                    {tx.paymentMethod || 'Cash'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-slate-400">{formatDate(tx.date)}</td>

                <td className="py-3.5 px-4 text-right font-extrabold text-sm">
                  <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                    {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tx._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
