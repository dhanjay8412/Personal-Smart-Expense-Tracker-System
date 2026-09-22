import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-sky-500/20">
            <Wallet className="w-7 h-7 text-slate-950 font-bold" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Smart<span className="text-sky-400">Expense</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 mt-2">Personal Smart Expense & Budget Management System</p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 z-10">
        <Outlet />
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} Smart Expense Tracker. All rights reserved.
      </div>
    </div>
  );
};
