import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  RotateCcw,
  Sun,
  Moon,
  Database,
  CheckCircle2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export function SettingsPage() {
  const {
    user,
    updateProfile,
    darkMode,
    toggleDarkMode,
    resetDemoData,
    currency,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [course, setCourse] = useState(user?.course || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [dailyLimit, setDailyLimit] = useState(user?.dailySpendingLimit || 400);
  const [monthlyAllowance, setMonthlyAllowance] = useState(user?.monthlyAllowance || 0);
  const [currencyCode, setCurrencyCode] = useState(user?.currency || 'INR');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUniversity(user.university || '');
      setCourse(user.course || '');
      setStudentId(user.studentId || '');
      setDailyLimit(user.dailySpendingLimit || 400);
      setMonthlyAllowance(user.monthlyAllowance || 0);
      setCurrencyCode(user.currency || 'INR');
    }
  }, [user]);

  useEffect(() => {
    api.system.getHealth().then(setSystemHealth).catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        name,
        university,
        course,
        studentId,
        dailySpendingLimit: Number(dailyLimit),
        monthlyAllowance: Number(monthlyAllowance),
        currency: currencyCode,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Reset your financial records? This will remove your transactions and restore default categories.')) {
      setResetting(true);
      try {
        await resetDemoData();
        alert('Your money data has been restored.');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Change your account details, daily limit, currency, and app colors.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your profile and money preferences were saved.</span>
        </div>
      )}

      {/* Personal profile and money preferences */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Your account information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student ID (optional)
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              School or college (optional)
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course (optional)
            </label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Financial Limits Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Money preferences
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <select
                value={currencyCode}
                onChange={(event) => setCurrencyCode(event.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="CAD">Canadian Dollar (C$)</option>
                <option value="AUD">Australian Dollar (A$)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily spending limit ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="50"
                  step="50"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold font-mono rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Get a reminder when your spending for the day passes this amount.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected income each month ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={monthlyAllowance}
                onChange={(e) => setMonthlyAllowance(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Used to help set a savings goal for emergencies.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Appearance & System Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Theme Settings */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              App colors
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Choose a light or dark look.
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            <span>{darkMode ? 'Use light colors' : 'Use dark colors'}</span>
          </button>
        </div>

        {/* Database Health Engine */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Where your entries are saved</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
              {String(systemHealth?.database?.engine || '').toLowerCase().includes('mongo')
                ? 'Online database'
                : 'Saved on this computer'}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            Ready
          </span>
        </div>
      </div>

      {/* Reset Demo Data Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Reset demo data
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            This removes your activity and restores the sample data. This cannot be undone.
          </p>
        </div>
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="px-3.5 py-2 text-xs font-semibold rounded-md border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset my data'}</span>
        </button>
      </div>
    </div>
  );
}
