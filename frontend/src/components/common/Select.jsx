import React, { forwardRef } from 'react';

export const Select = forwardRef(
  ({ label, options = [], error, icon: Icon, className = '', id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full bg-slate-900/90 border ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 focus:border-sky-500 focus:ring-sky-500'
            } text-slate-100 text-sm rounded-xl py-2.5 ${
              Icon ? 'pl-10' : 'pl-3.5'
            } pr-8 focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none cursor-pointer transition-all ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
