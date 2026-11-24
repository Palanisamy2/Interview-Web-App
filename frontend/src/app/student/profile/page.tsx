'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Save,
  LogOut,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function StudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState('2');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const candStr = localStorage.getItem('candidateInfo');
    if (!candStr) {
      router.push('/register');
      return;
    }

    try {
      const cand = JSON.parse(candStr);
      setStudent(cand);
      setName(cand.name || '');
      setEmail(cand.email || '');
      setPhone(cand.phone || '');
      setExperienceYears(String(cand.experienceYears || '2'));

      if (cand.id) {
        api.getCandidateProfile(cand.id)
          .then(data => {
            if (data) {
              setStudent(data);
              setName(data.name || '');
              setEmail(data.email || '');
              setPhone(data.phone || '');
              setExperienceYears(String(data.experienceYears || '2'));
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch (e) {
      router.push('/register');
    }
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updated = await api.updateCandidateProfile(student.id, {
        name: name.trim(),
        phone: phone.trim() || null,
        experienceYears: parseFloat(experienceYears) || 0
      });

      const newCand = { ...student, ...updated };
      localStorage.setItem('candidateInfo', JSON.stringify(newCand));
      setStudent(newCand);
      setSuccess('Profile successfully updated!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('candidateInfo');
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('presetSelection');
    router.push('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5] dark:bg-[#121214]">
        <div className="flex items-center gap-3 text-zinc-500 text-sm">
          <div className="h-5 w-5 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
          Loading candidate profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-10 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-2 shadow-xs">
              <User className="h-3.5 w-3.5" />
              Candidate Profile & Preferences
            </div>
            <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Candidate Profile
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your personal information, experience tier, and evaluation credentials.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Clean White Profile Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-8 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-[#E4E4E7] dark:border-[#2E2E33]">
            <div className="h-16 w-16 rounded-2xl bg-[#27272A] border border-[#3F3F46] text-[#84CC16] font-black text-2xl flex items-center justify-center shadow-sm">
              {student?.name ? student.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#18181B] dark:text-white">{student?.name}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{student?.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-[#84CC16]/10 border border-[#84CC16]/30 text-[11px] font-bold text-[#84CC16]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Candidate Identity
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#F4F4F5] dark:bg-[#18181B] text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">Assessment reports are tied to this email.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Years of Technical Experience
                </label>
                <div className="relative">
                  <Briefcase className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="40"
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E4E4E7] dark:border-[#2E2E33] flex items-center justify-between">
              <Link
                href="/student/status"
                className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#84CC16] flex items-center gap-1"
              >
                ← View Past Test Results
              </Link>

              {/* Electric Lime Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-xs hover:bg-[#A3E635] transition disabled:opacity-50 shadow-xs"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
