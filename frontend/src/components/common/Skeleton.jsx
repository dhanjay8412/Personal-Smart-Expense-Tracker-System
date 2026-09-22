import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-800/80 rounded-xl ${className}`} />;
};

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-5 space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-36 mt-2" />
    <Skeleton className="h-3 w-28" />
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-3 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-800/60">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);
