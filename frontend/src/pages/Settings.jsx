import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Card } from '../components/common/Card';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { Moon, Sun, Bell, Shield, Save } from 'lucide-react';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();

  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const res = await authService.updateProfile({ currency });
      if (res.success && res.data.user) {
        updateUser(res.data.user);
        setToast({ message: 'Settings saved successfully!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Application Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure appearance, default currencies, and notification rules</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Theme Settings */}
        <Card title="Appearance & Theme" subtitle="Toggle dashboard theme">
          <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">Theme Mode</h4>
                <p className="text-xs text-slate-400">Current mode: {theme.toUpperCase()}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </div>
        </Card>

        {/* Financial Preferences */}
        <Card title="Financial Preferences" subtitle="Global application defaults">
          <div className="space-y-4">
            <Select
              label="Default Currency Symbol"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { label: 'Indian Rupee (INR ₹)', value: 'INR' },
                { label: 'US Dollar (USD $)', value: 'USD' },
                { label: 'Euro (EUR €)', value: 'EUR' },
                { label: 'British Pound (GBP £)', value: 'GBP' },
              ]}
            />

            <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Budget Warning Alerts</h4>
                  <p className="text-xs text-slate-400">Notify when spending hits 80% or exceeds category limits</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" icon={Save} onClick={handleSavePreferences} isLoading={isLoading}>
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
