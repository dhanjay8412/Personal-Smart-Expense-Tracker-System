import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNavigation } from '../components/layout/MobileNavigation';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
};
