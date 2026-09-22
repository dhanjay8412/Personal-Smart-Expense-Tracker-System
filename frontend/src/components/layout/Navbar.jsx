import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Settings, Wallet, Menu } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // silent catch
      }
    };
    if (user) {
      fetchUnread();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Wallet className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white hidden sm:inline">
            Smart<span className="text-sky-400">Expense</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Currency Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 border border-slate-700/80 rounded-full text-xs font-semibold text-slate-300">
          <span className="text-sky-400">Currency:</span> {user?.currency || 'INR'}
        </div>

        {/* Notifications Icon Link */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <Link to="/profile" className="flex items-center gap-2 group">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-sky-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
