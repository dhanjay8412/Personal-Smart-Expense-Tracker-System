import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, Lock, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);
    try {
      const res = await login(data);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setServerError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-400">Enter your credentials to access your financial dashboard</p>
      </div>

      {isExpired && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-semibold text-center">
          Your session has expired. Please log in again.
        </div>
      )}

      {serverError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold text-center">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. alex@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-[11px] font-semibold text-sky-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button variant="primary" type="submit" isLoading={isLoading} icon={LogIn} className="w-full py-3">
          Sign In to Dashboard
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-sky-400 hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};
