import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { User, Mail, DollarSign, Lock, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  profileImage: z.string().optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
  monthlyIncome: z.coerce.number().min(0, 'Monthly income cannot be negative'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmNewPassword: z.string().min(8, 'Confirm new password is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Profile Form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      profileImage: user?.profileImage || '',
      currency: user?.currency || 'INR',
      monthlyIncome: user?.monthlyIncome || 0,
    },
  });

  // Password Form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onUpdateProfile = async (data) => {
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile(data);
      if (res.success && res.data.user) {
        updateUser(res.data.user);
        setToast({ message: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    setPasswordLoading(true);
    try {
      await authService.changePassword(data);
      setToast({ message: 'Password changed successfully!', type: 'success' });
      resetPasswordForm();
    } catch (err) {
      setToast({ message: err.message || 'Failed to change password', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authService.deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete account', type: 'error' });
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Account & Profile Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage personal info, currency preference, and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="lg:col-span-1 text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-sky-500/40 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-sky-500/40 flex items-center justify-center text-sky-400 text-3xl font-extrabold shadow-xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-100">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Currency:</span>
              <span className="font-bold text-sky-400">{user?.currency || 'INR'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Income:</span>
              <span className="font-bold text-emerald-400">{user?.monthlyIncome?.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <Card title="Personal Information" subtitle="Update your profile details">
            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <Input
                label="Full Name"
                icon={User}
                error={profileErrors.name?.message}
                {...regProfile('name')}
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                error={profileErrors.email?.message}
                {...regProfile('email')}
              />

              <Input
                label="Profile Image URL"
                placeholder="https://images.unsplash.com/..."
                icon={ImageIcon}
                error={profileErrors.profileImage?.message}
                {...regProfile('profileImage')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Preferred Currency"
                  error={profileErrors.currency?.message}
                  options={[
                    { label: 'INR (₹)', value: 'INR' },
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'EUR (€)', value: 'EUR' },
                    { label: 'GBP (£)', value: 'GBP' },
                  ]}
                  {...regProfile('currency')}
                />

                <Input
                  label="Monthly Income"
                  type="number"
                  icon={DollarSign}
                  error={profileErrors.monthlyIncome?.message}
                  {...regProfile('monthlyIncome')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" isLoading={profileLoading} icon={Save}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card title="Security" subtitle="Update account password">
            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                icon={Lock}
                error={passwordErrors.currentPassword?.message}
                {...regPassword('currentPassword')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  icon={Lock}
                  error={passwordErrors.newPassword?.message}
                  {...regPassword('newPassword')}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={Lock}
                  error={passwordErrors.confirmNewPassword?.message}
                  {...regPassword('confirmNewPassword')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="secondary" type="submit" isLoading={passwordLoading} icon={Lock}>
                  Change Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card title="Danger Zone" subtitle="Irreversible account actions">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <div>
                <h4 className="font-bold text-sm text-rose-300">Delete Account & Data</h4>
                <p className="text-xs text-rose-400/80">
                  Permanently delete your profile and all financial transactions.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setIsDeleteModalOpen(true)}
                className="shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Account Deletion Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Confirm Account Deletion"
        message="Are you completely sure? All your transactions, category budgets, notifications, and recurring setups will be permanently erased. This cannot be undone."
        confirmText="Permanently Delete Account"
        isLoading={deleteLoading}
      />
    </div>
  );
};
