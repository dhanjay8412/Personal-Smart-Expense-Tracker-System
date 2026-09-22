import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({ message = 'Failed to load data. Please try again.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card rounded-2xl border border-rose-500/30 my-4 bg-rose-500/5">
      <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 mb-3 border border-rose-500/20">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-100 mb-1">Something went wrong</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
