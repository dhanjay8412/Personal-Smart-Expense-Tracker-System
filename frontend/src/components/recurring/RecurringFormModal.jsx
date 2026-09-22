import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { categoryService } from '../../services/categoryService';

const recurringSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  amount: z.coerce.number().gt(0, 'Amount must be greater than 0'),
  type: z.enum(['Income', 'Expense']),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other']),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Yearly']),
  startDate: z.string().min(1, 'Start date is required'),
});

export const RecurringFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      name: '',
      amount: '',
      type: 'Expense',
      category: '',
      paymentMethod: 'UPI',
      frequency: 'Monthly',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');

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

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        amount: initialData.amount,
        type: initialData.type || 'Expense',
        category: initialData.category,
        paymentMethod: initialData.paymentMethod || 'UPI',
        frequency: initialData.frequency || 'Monthly',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        name: '',
        amount: '',
        type: 'Expense',
        category: '',
        paymentMethod: 'UPI',
        frequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, isOpen, reset]);

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title / Name"
          placeholder="e.g. Netflix Subscription, House Rent, Gym"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="e.g. 999"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Select
            label="Type"
            error={errors.type?.message}
            options={[
              { label: 'Expense', value: 'Expense' },
              { label: 'Income', value: 'Income' },
            ]}
            {...register('type')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            error={errors.category?.message}
            options={[
              { label: 'Select Category...', value: '' },
              ...filteredCategories.map((c) => ({ label: c.name, value: c.name })),
            ]}
            {...register('category')}
          />

          <Select
            label="Frequency"
            error={errors.frequency?.message}
            options={[
              { label: 'Daily', value: 'Daily' },
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
              { label: 'Yearly', value: 'Yearly' },
            ]}
            {...register('frequency')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Update Recurring' : 'Save Recurring'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
