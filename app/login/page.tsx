'use client'
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type UserType = 'admin' | 'employee' | 'client';

export default function LoginPage() {
  const [selectedType, setSelectedType] = useState<UserType>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setErrorMsg('Invalid login credentials');
        setLoading(false);
        return;
      }

      // Check role from profiles table
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profError || !profile) {
        setErrorMsg('Profile record not found.');
        setLoading(false);
        return;
      }

      const role = profile.role;
      const employeeRoles = ['director', 'senior_manager', 'manager', 'executive', 'intern'];

      // Validate selection vs actual role
      if (selectedType === 'admin') {
        if (role !== 'admin') {
          setErrorMsg('Access denied: You do not have Admin privileges.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        router.push('/dashboard/admin');
      } else if (selectedType === 'employee') {
        if (!employeeRoles.includes(role)) {
          setErrorMsg('Access denied: You are not registered as an Employee.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        router.push('/dashboard/employee');
      } else {
        if (role !== 'client') {
          setErrorMsg('Access denied: Please choose Admin or Employee portal.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        router.push('/dashboard/client');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#0B0F17] overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Aesthetic Ambient Lighting */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-slate-900/60 rounded-full blur-[160px] pointer-events-none" />

      {/* Subtle Dot Matrix Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Aesthetic Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/75 backdrop-blur-2xl border border-slate-800/80 p-7 sm:p-8 rounded-3xl shadow-2xl shadow-black/70 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1 shadow-lg shadow-black/40 overflow-hidden">
            <img
              src="/logo/site-logo.jpg"
              alt="Askus Studio"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-white uppercase">
              ASKUS PORTAL
            </h1>
            <p className="text-xs text-slate-400 mt-1">Select your portal to sign in</p>
          </div>
        </div>

        {/* 3 Portal Selection Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 border border-slate-800/70 rounded-2xl">
          <button
            type="button"
            onClick={() => { setSelectedType('admin'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              selectedType === 'admin'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => { setSelectedType('employee'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              selectedType === 'employee'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => { setSelectedType('client'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              selectedType === 'client'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Client
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : `Sign In as ${selectedType.toUpperCase()}`}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-500 font-mono">
            Askus Studio Operations & Client Management
          </span>
        </div>
      </div>
    </div>
  );
}