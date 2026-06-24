'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

export default function AuthGate() {
  const [mode,         setMode]         = useState<Mode>('login');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [fullName,     setFullName]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const setUser        = useAuthStore(s => s.setUser);
  const setAccessToken = useAuthStore(s => s.setAccessToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await authService.login(email, password);
      } else {
        if (!fullName) { toast.error('Full name is required'); setLoading(false); return; }
        res = await authService.register(email, password, fullName);
      }
      const { data } = res;
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      toast.success(mode === 'login' ? 'Welcome back' : 'Account created');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10">

      {/* Gold emblem */}
      <div className="w-12 h-12 border border-gold-faint flex items-center justify-center mb-6">
        <span className="font-serif text-lg font-light text-gold select-none">PP</span>
      </div>

      <h2 className="font-serif text-xl font-light text-text-primary mb-1 text-center">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h2>
      <p className="font-sans text-xs text-text-muted text-center mb-8">
        {mode === 'login'
          ? 'Sign in to access your conversations.'
          : 'Create an account to start a conversation with our team.'
        }
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">

        {mode === 'register' && (
          <div>
            <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="input-gold"
              required
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-gold"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-gold pr-10"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'btn-gold btn-gold-fill w-full justify-center mt-2',
            loading && 'opacity-60 cursor-not-allowed'
          )}
        >
          <span>{loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
        </button>
      </form>

      {/* Toggle mode */}
      <div className="mt-6 flex items-center gap-2">
        <span className="font-sans text-xs text-text-muted">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
        </span>
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="font-sans text-xs text-gold hover:text-gold-light transition-colors"
        >
          {mode === 'login' ? 'Register' : 'Sign in'}
        </button>
      </div>

    </div>
  );
}
