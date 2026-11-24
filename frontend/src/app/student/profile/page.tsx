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
  ShieldCheck
} from 'lucide-react';

export default function StudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState('2');
  const [preferredRole, setPreferredRole] = useState('Full Stack Engineer');
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

      // Fetch fresh profile from backend if candidate ID is valid
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

      // Update localStorage
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading student profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <User className="h-3.5 w-3.5" />
              Candidate Profile & Preferences
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Student Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your candidate information, contact details, and assessment identity.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-xs">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 shadow-xs">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {student?.name ? student.name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{student?.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{student?.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-indigo-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Candidate Identity
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Assessment reports are tied to this email.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Years of Experience
                </label>
                <div className="relative">
                  <Briefcase className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="40"
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/student/status"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                ← View Past Test Results
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
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
