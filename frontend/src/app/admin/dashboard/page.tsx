'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  CheckCircle,
  FileCheck2,
  TrendingUp,
  Mail,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Copy
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalCandidates: 0,
    totalSessions: 0,
    submittedSessions: 0,
    passRate: 0,
    avgScore: 0
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, candData] = await Promise.all([
          api.getDashboardStats().catch(() => ({})),
          api.listCandidates().catch(() => [])
        ]);
        setStats(statsData);
        setCandidates(candData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);

    try {
      const res = await api.createInvitation({ email: inviteEmail });
      const fullUrl = `${window.location.origin}${res.inviteUrl}`;
      setGeneratedInviteUrl(fullUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to create invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recruiter Analytics & Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time candidate pipelines, automated scoring metrics, and test sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-xs"
          >
            <Mail className="h-4 w-4" />
            Generate Candidate Invite
          </button>
          <Link
            href="/admin/questions"
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
          >
            Manage Question Bank
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Registered Candidates</span>
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalCandidates || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Across all role profiles</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Completed Assessments</span>
            <FileCheck2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.submittedSessions || 0}</div>
          <div className="text-xs text-slate-500 mt-1">From {stats.totalSessions || 0} total sessions</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Recommendation Pass Rate</span>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.passRate || 0}%</div>
          <div className="text-xs text-slate-500 mt-1">Graded as RECOMMENDED</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Average Composite Score</span>
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.avgScore || 0}%</div>
          <div className="text-xs text-slate-500 mt-1">Weighted sector average</div>
        </div>
      </div>

      {/* Recent Candidate Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Recent Candidates & Assessments</h2>
          <Link href="/admin/candidates" className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1">
            View All Candidates <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3">Role / Stack</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Verdict</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No assessments taken yet. Create an invitation to test candidate flows.
                  </td>
                </tr>
              ) : (
                candidates.slice(0, 8).map(cand => {
                  const session = cand.sessions && cand.sessions.length > 0 ? cand.sessions[0] : null;
                  const rec = session?.recommendation;

                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        <div>{cand.name}</div>
                        <div className="text-slate-400 font-normal">{cand.email}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        {session ? (
                          <div>
                            <span className="font-medium">{session.role?.name || 'Engineer'}</span>
                            <span className="text-slate-400 ml-1">({session.stack?.name || 'Stack'})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not started</span>
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
                          {session?.status || 'REGISTERED'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-semibold">
                        {rec ? `${rec.overallScore}%` : '-'}
                      </td>
                      <td className="px-6 py-3.5">
                        {rec ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.verdict === 'RECOMMENDED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.verdict === 'BORDERLINE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {rec.verdict}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {session ? (
                          <Link
                            href={`/admin/reports/${session.id}`}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            View Report <ExternalLink className="h-3 w-3" />
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Generate Candidate Assessment Invite</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter candidate's email to generate an authorized evaluation token link.
            </p>

            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Candidate Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {generatedInviteUrl && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-xs text-indigo-900">
                  <div className="font-semibold mb-1 flex items-center justify-between">
                    <span>Generated Invitation Link:</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(generatedInviteUrl)}
                      className="text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <div className="font-mono break-all select-all text-[11px]">{generatedInviteUrl}</div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setGeneratedInviteUrl('');
                    setInviteEmail('');
                  }}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

