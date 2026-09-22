import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Reset Password</h2>
        <p className="text-xs text-slate-400">Enter your account email to receive reset instructions</p>
      </div>

      {submitted ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-100">Reset Email Sent</h4>
          <p className="text-xs text-slate-300">
            If an account exists for <span className="font-semibold text-emerald-400">{email}</span>, password reset link has been dispatched.
          </p>
          <Link to="/login" className="inline-block pt-2">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. alex@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button variant="primary" type="submit" className="w-full py-3">
            Send Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
