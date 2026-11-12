'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, Filter, ExternalLink, User, ArrowLeft } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/dashboard" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates & Evaluation Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review detailed sector profiles, coding telemetry, and hiring fit reports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NOT_STARTED">Not Started</option>
          </select>
        </div>
      </div>

      {/* Candidates List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3">Experience</th>
                <th className="px-6 py-3">Applied Role & Stack</th>
                <th className="px-6 py-3">Assessment Status</th>
                <th className="px-6 py-3">Overall Fit</th>
                <th className="px-6 py-3">Verdict</th>
                <th className="px-6 py-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No candidates found matching the selected filters.
                  </td>
                </tr>
              ) : (
                candidates.map(cand => {
                  const session = cand.sessions && cand.sessions.length > 0 ? cand.sessions[0] : null;
                  const rec = session?.recommendation;

                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {cand.name ? cand.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div>{cand.name}</div>
                            <div className="text-slate-400 font-normal">{cand.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        {cand.experienceYears ? `${cand.experienceYears} yrs` : 'N/A'}
                      </td>
                      <td className="px-6 py-3.5">
                        {session ? (
                          <div>
                            <span className="font-semibold text-slate-800">{session.role?.name || 'Engineer'}</span>
                            <div className="text-slate-400">{session.stack?.name || 'Standard Stack'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          session?.status === 'SUBMITTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : session?.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {session?.status || 'INVITED'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold">
                        {rec ? `${rec.overallScore}%` : '-'}
                      </td>
                      <td className="px-6 py-3.5">
                        {rec ? (
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.verdict === 'RECOMMENDED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.verdict === 'BORDERLINE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {rec.verdict}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">{rec.level}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {session ? (
                          <Link
                            href={`/admin/reports/${session.id}`}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            Full Report <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">-</span>
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
  );
}

