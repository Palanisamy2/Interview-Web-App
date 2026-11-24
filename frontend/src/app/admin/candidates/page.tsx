'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, Filter, ExternalLink, User, ArrowLeft, Award, ShieldCheck } from 'lucide-react';

export default function CandidatesListPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadCandidates();
  }, [search, statusFilter]);

  const loadCandidates = async () => {
    try {
      const data = await api.listCandidates({
        search: search.trim() || undefined,
        status: statusFilter || undefined
      });
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-8 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link href="/admin/dashboard" className="text-xs text-[#84CC16] font-bold hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Candidates & Evaluation Reports
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review candidate competency scores, coding telemetry, and hiring recommendations.
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#1E1E22] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#1E1E22] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>
          </div>
        </div>

        {/* Clean White Candidates Table Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAFA] dark:bg-[#27272A]/40 border-b border-[#E4E4E7] dark:border-[#2E2E33] text-zinc-500 uppercase font-bold text-[11px]">
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Applied Role & Stack</th>
                  <th className="px-6 py-3.5">Assessment Status</th>
                  <th className="px-6 py-3.5">Overall Fit</th>
                  <th className="px-6 py-3.5">Verdict</th>
                  <th className="px-6 py-3.5 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E33] text-zinc-700 dark:text-zinc-300">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                      No candidates found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  candidates.map(cand => {
                    const session = cand.sessions && cand.sessions.length > 0 ? cand.sessions[0] : null;
                    const rec = session?.recommendation;

                    return (
                      <tr key={cand.id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40 transition">
                        <td className="px-6 py-4 font-semibold text-[#18181B] dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {cand.name ? cand.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div>{cand.name}</div>
                              <div className="text-zinc-400 font-normal text-[11px]">{cand.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {cand.experienceYears ? `${cand.experienceYears} yrs` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {session ? (
                            <div>
                              <span className="font-semibold text-[#18181B] dark:text-zinc-200">{session.role?.name || 'Engineer'}</span>
                              <div className="text-[#84CC16] font-bold">{session.stack?.name || 'Standard Stack'}</div>
                            </div>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            session?.status === 'SUBMITTED'
                              ? 'bg-[#84CC16]/15 text-[#84CC16] border-[#84CC16]/30'
                              : session?.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200'
                          }`}>
                            {session?.status || 'INVITED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-sm text-[#18181B] dark:text-white">
                          {rec ? `${rec.overallScore}%` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {rec ? (
                            <div>
                              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                rec.verdict === 'RECOMMENDED'
                                  ? 'bg-[#84CC16]/20 text-[#84CC16] border-[#84CC16]/40'
                                  : rec.verdict === 'BORDERLINE'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 border-amber-300'
                                  : 'bg-red-100 dark:bg-red-950/60 text-red-800 border-red-300'
                              }`}>
                                {rec.verdict}
                              </span>
                              <div className="text-[10px] text-zinc-400 mt-0.5">{rec.seniority || rec.level}</div>
                            </div>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {session ? (
                            <Link
                              href={`/admin/reports/${session.id}`}
                              className="inline-flex items-center gap-1 text-[#84CC16] hover:underline font-bold"
                            >
                              Full Report <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
