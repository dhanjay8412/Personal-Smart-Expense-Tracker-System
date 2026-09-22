import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../common/Skeleton';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 mx-auto flex items-center justify-center animate-pulse">
            <span className="font-bold text-lg">SE</span>
          </div>
          <p className="text-xs text-slate-400">Securing your session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
