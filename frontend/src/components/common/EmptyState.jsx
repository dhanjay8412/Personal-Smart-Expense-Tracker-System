import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No Data Found',
  description = 'Add your first transaction or entry to start tracking.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card rounded-2xl border border-slate-800 my-4">
      <div className="p-4 bg-slate-800/80 rounded-2xl text-sky-400 mb-4 border border-slate-700/50">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-100 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
