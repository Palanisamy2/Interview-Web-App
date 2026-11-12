'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Mail, Phone, Briefcase, Key, ArrowRight, AlertCircle } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState('2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.candidateStart({
        token: token ? token.trim() : undefined,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        experienceYears: parseFloat(experienceYears) || 0
      });

      if (data.token) {
        localStorage.setItem('candidateToken', data.token);
        localStorage.setItem('candidateInfo', JSON.stringify(data.candidate));

        if (data.preset && data.preset.roleId && data.preset.stackId) {
          localStorage.setItem('presetSelection', JSON.stringify(data.preset));
        }

        router.push('/select');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Candidate Registration</h2>
        <p className="text-sm text-slate-500 mt-1">
          {token ? 'Verifying invitation token' : 'Enter your details to begin the assessment'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
          <div className="relative">
            <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone (Optional)</label>
          <div className="relative">
            <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Years of Experience</label>
          <div className="relative">
            <Briefcase className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              step="0.5"
              min="0"
              max="30"
              required
              value={experienceYears}
              onChange={e => setExperienceYears(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Invite Token (Optional)</label>
          <div className="relative">
            <Key className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Optional invite code"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Continue to Role Selection'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
