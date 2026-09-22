import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-6xl font-extrabold text-slate-100 mb-2">404</h1>
      <h3 className="text-xl font-bold text-slate-300 mb-2">Page Not Found</h3>
      <p className="text-xs text-slate-400 max-w-md mb-6">
        The requested financial route or page does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={Home}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};
