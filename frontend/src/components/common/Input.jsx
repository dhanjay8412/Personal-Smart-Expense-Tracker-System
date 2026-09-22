import React, { forwardRef } from 'react';

export const Input = forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 h-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-slate-900/90 border ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 focus:border-sky-500 focus:ring-sky-500'
            } text-slate-100 placeholder-slate-500 text-sm rounded-xl py-2.5 ${
              Icon ? 'pl-10' : 'pl-3.5'
            } pr-3.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
