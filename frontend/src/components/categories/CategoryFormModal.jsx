import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  type: z.enum(['Income', 'Expense']),
  icon: z.string().default('Tag'),
});

export const CategoryFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'Expense',
      icon: 'Tag',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        icon: initialData.icon || 'Tag',
      });
    } else {
      reset({
        name: '',
        type: 'Expense',
        icon: 'Tag',
      });
    }
  }, [initialData, isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Custom Category' : 'Create Custom Category'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Pet Care, Gaming, Side Income"
          error={errors.name?.message}
          {...register('name')}
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

        <Select
          label="Icon Badge"
          error={errors.icon?.message}
          options={[
            { label: 'Tag (Default)', value: 'Tag' },
            { label: 'Utensils (Food)', value: 'Utensils' },
            { label: 'Car (Transport)', value: 'Car' },
            { label: 'ShoppingBag (Shopping)', value: 'ShoppingBag' },
            { label: 'Film (Entertainment)', value: 'Film' },
            { label: 'FileText (Bills)', value: 'FileText' },
            { label: 'Activity (Healthcare)', value: 'Activity' },
            { label: 'Plane (Travel)', value: 'Plane' },
            { label: 'Home (Rent)', value: 'Home' },
            { label: 'Sparkles (Special)', value: 'Sparkles' },
          ]}
          {...register('icon')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
