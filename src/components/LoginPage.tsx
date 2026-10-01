import React, { useState } from 'react';
import { SwarnLogo } from './SwarnLogo';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { ArtistProfile } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onSuccess: (user: ArtistProfile) => void;
  onNavigateHome: () => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateHome,
  onNavigateRegister,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered Gmail or phone number.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.login(identifier.trim(), password);

      if (res && res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMsg(res?.message || 'Invalid credentials. Please verify your email/phone and password.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden text-stone-900 transition-colors duration-300">
      {/* Liquid Glass Background Ornaments & Glowing Ambient Spheres */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#7A131B]/20 blur-3xl pointer-events-none" />

      {/* Standalone Header with Liquid Glass Blur */}
      <header className="border-b border-white/60 liquid-glass-track px-4 sm:px-8 py-4 relative z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SwarnLogo size="sm" />
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-[#7A131B]">
                swarnmusic
              </span>
              <span className="hidden sm:inline-block ml-3 text-xs text-stone-700 border-l border-[#DFCFC0] pl-3">
                Artist Sign In
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white/70 hover:bg-white border border-white/80 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </button>
        </div>
      </header>

      {/* Main Login Container with Liquid Glass Card */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center relative z-10">
        <div className="liquid-glass-card rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-2xl">
          <div className="space-y-1.5 border-b border-stone-200/60 pb-4">
            <h1 className="text-2xl font-display font-bold text-stone-900 tracking-tight">
              Sign In to Your Portfolio
            </h1>
            <p className="text-xs text-stone-700">
              Access your public works, view incoming collaboration requests, and connect with other creators.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50/90 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Registered Gmail or Phone Number
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. your.email@gmail.com or 9876543210"
                  className="w-full pl-10 pr-3.5 py-2.5 liquid-glass-input rounded-xl text-sm text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-10 py-2.5 liquid-glass-input rounded-xl text-sm text-stone-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-[#7A131B] hover:bg-[#8C1620] disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200/60 text-center text-xs text-stone-700">
            Don't have an artist portfolio yet?{' '}
            <button
              onClick={onNavigateRegister}
              className="text-[#7A131B] font-semibold underline hover:text-[#8C1620] cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
