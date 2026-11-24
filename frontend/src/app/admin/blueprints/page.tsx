'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Sliders,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Code2,
  Server,
  Smartphone,
  CheckSquare,
  ShieldCheck,
  Terminal
} from 'lucide-react';

export default function AdminBlueprintsPage() {
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    api.listBlueprints()
      .then(data => {
        setBlueprints(data.blueprints || []);
        setSectors(data.sectors || []);
      })
      .catch(err => setError(err.message || 'Failed to load blueprints'))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredBlueprints = blueprints.filter(bp => {
    const roleCode = bp.role?.code || '';
    const matchRole = roleFilter === 'ALL' || roleCode === roleFilter;
    const matchSearch =
      !search ||
      (bp.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (bp.stack?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors duration-150">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-2 shadow-xs">
              <Sliders className="h-3.5 w-3.5" />
              Role Profiles & Grading Criteria
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Assessment Blueprints & Sector Weights
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configuration matrix for question distribution, time limits, and competency cutoffs.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[#161F30] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stack or blueprint..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1422] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-cyan-500/20 focus:border-indigo-600 dark:focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'frontend', 'backend', 'fullstack', 'mobile', 'qa'].map(rf => (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  roleFilter === rf
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map(bp => (
            <div
              key={bp.id}
              className="bg-white dark:bg-[#161F30] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-400 border border-indigo-100 dark:border-indigo-800/60">
                    {bp.role?.name || 'General Role'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    {bp.durationMinutes || 45}m
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {bp.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Primary Stack: <span className="text-indigo-600 dark:text-cyan-400 font-semibold">{bp.stack?.name}</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Cutoff Thresholds:</div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60 font-bold">
                    STRONG: ≥70%
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/60 font-bold">
                    MED: ≥50%
                  </div>
                  <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800/60 font-bold">
                    LOW: &lt;50%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
