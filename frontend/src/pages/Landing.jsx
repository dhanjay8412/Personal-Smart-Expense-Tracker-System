import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShieldCheck, PieChart, TrendingUp, Bell, Download, ChevronRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white overflow-hidden">
      {/* Navbar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-800/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Wallet className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Smart<span className="text-sky-400">Expense</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 lg:py-24 flex flex-col items-center text-center relative">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" /> Next-Gen Personal Financial Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-slate-100 leading-tight">
          Master Your Money with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400">Smart Financial Analytics</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mt-6 leading-relaxed">
          Track expenses, define custom category budgets, monitor automated recurring bills, and receive instant threshold alerts with a production-grade financial tracker.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Link to="/register">
            <Button variant="primary" size="lg" icon={ChevronRight}>
              Create Free Account
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Explore Demo Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl w-max mb-4 border border-sky-500/20">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Category Budgets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set monthly budget caps for Food, Rent, Shopping, and custom categories. Get instant warnings when spending hits 80%.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-max mb-4 border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Visual Recharts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive expense pie charts, monthly income vs expense bar trends, and daily spending graphs powered by Recharts.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl w-max mb-4 border border-violet-500/20">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">CSV & PDF Exports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your filtered transaction logs directly to professional CSV spreadsheets and formatted PDF statements.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Personal Smart Expense Tracker System. Built with React & Node.js.
      </footer>
    </div>
  );
};
