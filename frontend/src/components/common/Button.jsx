import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  const variants = {
    primary:
      'bg-sky-600 hover:bg-sky-500 text-white focus:ring-sky-500 border border-sky-500/30 active:scale-[0.98]',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 border border-rose-500/30 active:scale-[0.98]',
    success:
      'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 border border-emerald-500/30 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-700 focus:ring-slate-500',
    ghost:
      'bg-transparent hover:bg-slate-800 text-slate-300 border-none shadow-none focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
