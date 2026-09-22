import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, BarChart3, User } from 'lucide-react';

const mobileTabs = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Profile', path: '/profile', icon: User },
];

export const MobileNavigation = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-2 flex items-center justify-around">
      {mobileTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive ? 'text-sky-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
