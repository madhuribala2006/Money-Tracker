import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, ShieldCheck, Wallet, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('123@gmsil.com');
  const [password, setPassword] = useState('1234');
  const [currency, setCurrency] = useState('INR');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ name, email, password, currency });
      } else {
        await login({ email, password });
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login({ email: '123@gmsil.com', password: '1234' });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-8">
      <div className={`auth-layout relative ${user ? 'auth-layout-compact' : ''}`}>
        {!user && (
          <section className="auth-intro">
            <div className="relative z-10">
              <div className="mb-12 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Wallet className="h-6 w-6" />
                </span>
                <span className="text-lg font-extrabold tracking-tight">Money Tracker</span>
              </div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold ring-1 ring-white/20">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                A clearer view of your money
              </span>
              <h1 className="max-w-lg text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Make your money feel easier.
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80">
                Keep track of spending, plan for bills, and see your savings grow—all in one place.
              </p>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <p className="text-sm font-semibold text-white/70">Know where it goes</p>
                <p className="mt-1 text-base font-bold">Simple spending view</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <p className="text-sm font-semibold text-white/70">Plan with confidence</p>
                <p className="mt-1 text-base font-bold">Budgets and goals</p>
              </div>
            </div>
          </section>
        )}

        <section className="auth-form-panel relative">
          {user && (
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close sign-in dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Lock className="h-5 w-5" />
            </div>
            <p className="text-sm font-extrabold uppercase tracking-[.14em] text-indigo-600">
              {mode === 'register' ? 'Start saving' : 'Welcome back'}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {mode === 'register' ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              {mode === 'register'
                ? 'Your account and money data are private to you.'
                : 'Sign in to see your money overview.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label htmlFor="signup-name" className="mb-2 block text-sm font-bold text-slate-800">Your name</label>
              <input
                id="signup-name"
                type="text"
                required
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="mb-2 block text-sm font-bold text-slate-800">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="signup-currency" className="mb-2 block text-sm font-bold text-slate-800">Currency</label>
              <select
                id="signup-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
          )}

          <div>
            <label htmlFor="auth-password" className="mb-2 block text-sm font-bold text-slate-800">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={mode === 'register' ? 8 : undefined}
                maxLength={72}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-base font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
          >
            {loading ? (mode === 'register' ? 'Creating account…' : 'Signing in…') : (mode === 'register' ? 'Create account' : 'Sign in')}
            <ArrowRight className="h-5 w-5" />
          </button>

          {mode === 'login' && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-sm font-extrabold text-emerald-900">Demo sign-in details</p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                Email: <strong>123@gmsil.com</strong><br />Password: <strong>1234</strong>
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="mt-3 inline-flex min-h-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-emerald-800 shadow-sm ring-1 ring-emerald-200 transition hover:bg-emerald-100 disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                Use demo account
              </button>
            </div>
          </div>
          )}
          {!user && (
            <p className="text-center text-sm text-slate-600">
              {mode === 'register' ? 'Already have an account?' : 'New here?'}{' '}
              <button
                type="button"
                onClick={() => {
                  const nextMode = mode === 'register' ? 'login' : 'register';
                  setMode(nextMode);
                  setEmail(nextMode === 'login' ? '123@gmsil.com' : '');
                  setPassword(nextMode === 'login' ? '1234' : '');
                  setName('');
                  setError(null);
                }}
                className="font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950"
              >
                {mode === 'register' ? 'Sign in' : 'Create a free account'}
              </button>
            </p>
          )}
          </form>
        </section>
      </div>
    </div>
  );
}
