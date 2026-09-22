import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Calendar,
  PieChart,
  BarChart3,
  Tags,
  Repeat,
  Users,
  Bell,
  User,
  Settings,
  X,
} from 'lucide-react';

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Recurring', path: '/recurring', icon: Repeat },
  { name: 'Groups', path: '/groups', icon: Users },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden mb-6 pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-200 text-sm">Navigation Menu</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md shadow-sky-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info card */}
        <div className="glass-panel p-3.5 rounded-xl text-center border border-slate-800/90 mt-6">
          <p className="text-[11px] font-semibold text-slate-300">Smart Expense v1.0</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Secure Financial Management</p>
        </div>
      </aside>
    </>
  );
};
