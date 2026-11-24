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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <Sliders className="h-3.5 w-3.5" />
              Role Profiles & Grading Criteria
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Assessment Blueprints & Sector Weights
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configuration matrix for question distribution, time limits, and competency cutoffs.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stack or blueprint..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'frontend', 'backend', 'fullstack', 'mobile', 'qa'].map(rf => (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  roleFilter === rf
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {bp.role?.name || 'General Role'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {bp.durationMinutes || 45}m
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {bp.name}
                </h3>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Primary Stack: <span className="text-indigo-600 font-semibold">{bp.stack?.name}</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-600">Cutoff Thresholds:</div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                    STRONG: ≥70%
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 font-bold">
                    MED: ≥50%
                  </div>
                  <div className="p-1.5 rounded-lg bg-red-50 text-red-700 border border-red-100 font-bold">
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
