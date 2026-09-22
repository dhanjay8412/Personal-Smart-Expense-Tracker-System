import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

export const FilterPanel = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories = [],
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value, page: 1 });
  };

  const hasActiveFilters =
    filters.search ||
    filters.type ||
    filters.category ||
    filters.paymentMethod ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <Input
          name="search"
          placeholder="Search description, notes..."
          icon={Search}
          value={filters.search || ''}
          onChange={handleChange}
        />

        {/* Type */}
        <Select
          name="type"
          value={filters.type || ''}
          onChange={handleChange}
          options={[
            { label: 'All Types', value: '' },
            { label: 'Expense Only', value: 'Expense' },
            { label: 'Income Only', value: 'Income' },
          ]}
        />

        {/* Category */}
        <Select
          name="category"
          value={filters.category || ''}
          onChange={handleChange}
          options={[
            { label: 'All Categories', value: '' },
            ...categories.map((c) => ({ label: c.name, value: c.name })),
          ]}
        />

        {/* Payment Method */}
        <Select
          name="paymentMethod"
          value={filters.paymentMethod || ''}
          onChange={handleChange}
          options={[
            { label: 'All Payment Methods', value: '' },
            { label: 'UPI', value: 'UPI' },
            { label: 'Cash', value: 'Cash' },
            { label: 'Credit Card', value: 'Credit Card' },
            { label: 'Debit Card', value: 'Debit Card' },
            { label: 'Bank Transfer', value: 'Bank Transfer' },
            { label: 'Other', value: 'Other' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end pt-2 border-t border-slate-800/80">
        <Input
          label="Start Date"
          type="date"
          name="startDate"
          value={filters.startDate || ''}
          onChange={handleChange}
        />

        <Input
          label="End Date"
          type="date"
          name="endDate"
          value={filters.endDate || ''}
          onChange={handleChange}
        />

        <Select
          label="Sort By"
          name="sortBy"
          value={filters.sortBy || 'date'}
          onChange={handleChange}
          options={[
            { label: 'Date', value: 'date' },
            { label: 'Amount', value: 'amount' },
          ]}
        />

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Select
            label="Order"
            name="sortOrder"
            value={filters.sortOrder || 'desc'}
            onChange={handleChange}
            options={[
              { label: 'Descending', value: 'desc' },
              { label: 'Ascending', value: 'asc' },
            ]}
          />

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              icon={X}
              onClick={onResetFilters}
              className="mt-6 shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
