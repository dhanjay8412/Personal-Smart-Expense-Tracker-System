import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 transition-all border border-slate-800 hover:border-slate-700/80 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h3 className="text-base font-bold text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
