import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { categoryService } from '../../services/categoryService';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().gt(0, 'Budget amount must be greater than 0'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
});

export const BudgetFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          // Budgets apply to Expense categories
          setCategories(res.data.filter((c) => c.type === 'Expense'));
        }
      } catch (err) {
        console.error('[Categories Load Error]', err);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category,
        amount: initialData.amount,
        month: initialData.month || new Date().getMonth() + 1,
        year: initialData.year || new Date().getFullYear(),
      });
    } else {
      reset({
        category: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
  }, [initialData, isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Category Budget' : 'Set Monthly Category Budget'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Category"
          error={errors.category?.message}
          options={[
            { label: 'Select Category...', value: '' },
            ...categories.map((c) => ({ label: c.name, value: c.name })),
          ]}
          disabled={!!initialData}
          {...register('category')}
        />

        <Input
          label="Monthly Budget Limit"
          type="number"
          step="1"
          placeholder="e.g. 10000"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Month"
            error={errors.month?.message}
            options={[
              { label: 'January', value: 1 },
              { label: 'February', value: 2 },
              { label: 'March', value: 3 },
              { label: 'April', value: 4 },
              { label: 'May', value: 5 },
              { label: 'June', value: 6 },
              { label: 'July', value: 7 },
              { label: 'August', value: 8 },
              { label: 'September', value: 9 },
              { label: 'October', value: 10 },
              { label: 'November', value: 11 },
              { label: 'December', value: 12 },
            ]}
            {...register('month')}
          />

          <Input
            label="Year"
            type="number"
            error={errors.year?.message}
            {...register('year')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Update Budget' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
