import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { categoryService } from '../../services/categoryService';
import { categorizationService } from '../../services/categorizationService';
import { Sparkles, Check } from 'lucide-react';

const transactionSchema = z.object({
  amount: z.coerce.number().gt(0, 'Amount must be greater than 0'),
  type: z.enum(['Income', 'Expense']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(200),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other']),
  notes: z.string().max(500).optional(),
});

export const TransactionFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [categories, setCategories] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const debounceTimerRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      type: 'Expense',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const descriptionValue = watch('description');
  const categoryValue = watch('category');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('[Categories Load Error]', err);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Debounced Auto Categorization Suggestion
  useEffect(() => {
    if (!descriptionValue || descriptionValue.trim().length < 3 || selectedType !== 'Expense') {
      setSuggestion(null);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await categorizationService.suggestCategory(descriptionValue);
        if (res.success && res.data && res.data.confidence >= 0.5) {
          setSuggestion(res.data);
        } else {
          setSuggestion(null);
        }
      } catch (err) {
        setSuggestion(null);
      }
    }, 400);

    return () => clearTimeout(debounceTimerRef.current);
  }, [descriptionValue, selectedType]);

  useEffect(() => {
    if (initialData) {
      reset({
        amount: initialData.amount,
        type: initialData.type,
        category: initialData.category,
        description: initialData.description,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        paymentMethod: initialData.paymentMethod || 'Cash',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        amount: '',
        type: 'Expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        notes: '',
      });
    }
    setSuggestion(null);
  }, [initialData, isOpen, reset]);

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      setValue('category', suggestion.category, { shouldValidate: true });
      setSuggestion(null);
    }
  };

  const handleFormSubmit = (data) => {
    // If user changed category from suggestion, learn correction
    if (suggestion && data.category !== suggestion.category) {
      categorizationService.saveCorrection(data.description, data.category).catch(() => {});
    }
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add New Transaction'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Transaction Type Selector */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setValue('type', 'Expense');
              setValue('category', '');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              selectedType === 'Expense'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('type', 'Income');
              setValue('category', '');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              selectedType === 'Income'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income
          </button>
        </div>

        <Input
          label="Description"
          placeholder="e.g. Swiggy order, Uber ride"
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Smart Category Suggestion Badge */}
        {suggestion && selectedType === 'Expense' && categoryValue !== suggestion.category && (
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-between text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-sky-300">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Suggested: <strong className="text-white font-bold">{suggestion.category}</strong> ({Math.round(suggestion.confidence * 100)}% confidence)
              </span>
            </div>
            <button
              type="button"
              onClick={handleAcceptSuggestion}
              className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="e.g. 500"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Select
            label="Category"
            error={errors.category?.message}
            options={[
              { label: 'Select Category...', value: '' },
              ...filteredCategories.map((c) => ({ label: c.name, value: c.name })),
            ]}
            {...register('category')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            error={errors.paymentMethod?.message}
            options={[
              { label: 'UPI', value: 'UPI' },
              { label: 'Cash', value: 'Cash' },
              { label: 'Credit Card', value: 'Credit Card' },
              { label: 'Debit Card', value: 'Debit Card' },
              { label: 'Bank Transfer', value: 'Bank Transfer' },
              { label: 'Other', value: 'Other' },
            ]}
            {...register('paymentMethod')}
          />

          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Additional details or context..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            {...register('notes')}
          />
          {errors.notes && <p className="text-xs text-rose-400 mt-1">{errors.notes.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
