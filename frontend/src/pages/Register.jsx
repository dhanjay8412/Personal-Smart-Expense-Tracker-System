import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, DollarSign, UserPlus } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
    monthlyIncome: z.coerce.number().min(0, 'Monthly income cannot be negative').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      currency: 'INR',
      monthlyIncome: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);
    try {
      const res = await registerAuth(data);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setServerError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-400">Join Smart Expense Tracker to manage your finances</p>
      </div>

      {serverError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold text-center">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Alex Johnson"
          icon={User}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. alex@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Preferred Currency"
            error={errors.currency?.message}
            options={[
              { label: 'INR (₹)', value: 'INR' },
              { label: 'USD ($)', value: 'USD' },
              { label: 'EUR (€)', value: 'EUR' },
              { label: 'GBP (£)', value: 'GBP' },
            ]}
            {...register('currency')}
          />

          <Input
            label="Est. Monthly Income"
            type="number"
            placeholder="e.g. 60000"
            icon={DollarSign}
            error={errors.monthlyIncome?.message}
            {...register('monthlyIncome')}
          />
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button variant="primary" type="submit" isLoading={isLoading} icon={UserPlus} className="w-full py-3">
          Create Free Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-sky-400 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
