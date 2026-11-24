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
  Terminal,
  Award
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
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-8 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-2 shadow-xs">
              <Sliders className="h-3.5 w-3.5" />
              Role Profiles & Grading Criteria
            </div>
            <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Assessment Blueprints & Sector Weights
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Configuration matrix for question distribution, time limits, and competency cutoffs.
            </p>
          </div>
        </div>

        {/* Filter Bar (Clean White Card) */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] p-4 rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stack or blueprint..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'frontend', 'backend', 'fullstack', 'mobile', 'qa'].map(rf => (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  roleFilter === rf
                    ? 'bg-[#84CC16] text-[#18181B] shadow-xs'
                    : 'bg-[#F4F4F5] dark:bg-[#27272A] text-zinc-600 dark:text-zinc-300 hover:bg-[#E4E4E7] dark:hover:bg-[#3F3F46]'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprints Grid (Clean White Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBlueprints.map(bp => {
            const weights = bp.weights || {};
            return (
              <div
                key={bp.id}
                className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-6 shadow-xs hover:border-[#84CC16] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center font-bold">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#18181B] dark:text-white text-base">{bp.name}</h3>
                        <span className="text-xs text-[#84CC16] font-bold">{bp.stack?.name}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#27272A] text-[#84CC16] text-xs font-mono font-bold">
                      {bp.duration_minutes || 45} mins
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mb-4">{bp.description}</p>

                  <div className="space-y-2 pt-3 border-t border-[#E4E4E7] dark:border-[#2E2E33]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Sector Distribution Weights:
                    </div>
                    {Object.entries(weights).map(([secKey, wt]: any) => (
                      <div key={secKey} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-300 capitalize">{secKey.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-[#E4E4E7] dark:bg-[#2E2E33] overflow-hidden">
                            <div
                              className="h-full bg-[#84CC16] rounded-full"
                              style={{ width: `${Number(wt) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#84CC16] w-8 text-right">{Math.round(Number(wt) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E4E4E7] dark:border-[#2E2E33] flex items-center justify-between text-xs text-zinc-500">
                  <span>Pass Threshold: <strong className="text-[#84CC16]">{bp.pass_threshold || 60}%</strong></span>
                  <span className="flex items-center gap-1 text-[#84CC16] font-bold">
                    <ShieldCheck className="h-4 w-4" /> Active Blueprint
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
