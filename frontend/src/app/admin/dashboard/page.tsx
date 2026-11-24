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
  Copy,
  Award,
  ShieldCheck
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
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-8 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-2 shadow-xs">
              <Award className="h-3.5 w-3.5" />
              Recruiter Analytics & Command
            </div>
            <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Recruiter Analytics & Dashboard
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Real-time candidate pipelines, automated scoring metrics, and test sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#84CC16] text-[#18181B] rounded-xl text-xs font-bold hover:bg-[#A3E635] transition shadow-xs"
            >
              <Mail className="h-4 w-4" />
              Generate Candidate Invite
            </button>
            <Link
              href="/admin/questions"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#1E1E22] text-[#18181B] dark:text-zinc-200 rounded-xl text-xs font-semibold hover:border-[#84CC16] transition shadow-xs"
            >
              Manage Question Bank
            </Link>
          </div>
        </div>

        {/* KPI Metric Cards (Clean White Dashboard Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Registered Candidates</span>
              <Users className="h-5 w-5 text-[#84CC16]" />
            </div>
            <div className="text-3xl font-extrabold text-[#18181B] dark:text-white">{stats.totalCandidates || 0}</div>
            <div className="text-xs text-zinc-500 mt-1">Across all role profiles</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Completed Assessments</span>
              <FileCheck2 className="h-5 w-5 text-[#84CC16]" />
            </div>
            <div className="text-3xl font-extrabold text-[#18181B] dark:text-white">{stats.submittedSessions || 0}</div>
            <div className="text-xs text-zinc-500 mt-1">From {stats.totalSessions || 0} total sessions</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recommendation Pass Rate</span>
              <CheckCircle className="h-5 w-5 text-[#84CC16]" />
            </div>
            <div className="text-3xl font-extrabold text-[#18181B] dark:text-white">{stats.passRate || 0}%</div>
            <div className="text-xs text-zinc-500 mt-1">Graded as RECOMMENDED</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Average Composite Score</span>
              <TrendingUp className="h-5 w-5 text-[#84CC16]" />
            </div>
            <div className="text-3xl font-extrabold text-[#18181B] dark:text-white">{stats.avgScore || 0}%</div>
            <div className="text-xs text-zinc-500 mt-1">Weighted sector average</div>
          </div>
        </div>

        {/* Recent Candidate Activity Table */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E4E4E7] dark:border-[#2E2E33] flex items-center justify-between">
            <h2 className="font-extrabold text-[#18181B] dark:text-white text-base">Recent Candidates & Assessments</h2>
            <Link href="/admin/candidates" className="text-xs text-[#84CC16] font-bold hover:underline flex items-center gap-1">
              View All Candidates <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAFA] dark:bg-[#27272A]/40 border-b border-[#E4E4E7] dark:border-[#2E2E33] text-zinc-500 uppercase font-bold text-[11px]">
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Role / Stack</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Verdict</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E33] text-zinc-700 dark:text-zinc-300">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                      No assessments taken yet. Create an invitation to test candidate flows.
                    </td>
                  </tr>
                ) : (
                  candidates.slice(0, 8).map(cand => {
                    const session = cand.sessions && cand.sessions.length > 0 ? cand.sessions[0] : null;
                    const rec = session?.recommendation;

                    return (
                      <tr key={cand.id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40 transition">
                        <td className="px-6 py-4 font-semibold text-[#18181B] dark:text-white">
                          <div>{cand.name}</div>
                          <div className="text-zinc-400 font-normal text-[11px]">{cand.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          {session ? (
                            <div>
                              <span className="font-semibold text-[#18181B] dark:text-zinc-200">{session.role?.name || 'Engineer'}</span>
                              <span className="text-[#84CC16] ml-1 font-bold">({session.stack?.name || 'Stack'})</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400">Not started</span>
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
                            {session?.status || 'REGISTERED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-sm text-[#18181B] dark:text-white">
                          {rec ? `${rec.overallScore}%` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {rec ? (
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              rec.verdict === 'RECOMMENDED'
                                ? 'bg-[#84CC16]/20 text-[#84CC16] border-[#84CC16]/40'
                                : rec.verdict === 'BORDERLINE'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 border-amber-300'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-800 border-red-300'
                            }`}>
                              {rec.verdict}
                            </span>
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
                              View Report <ExternalLink className="h-3 w-3" />
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

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl max-w-md w-full p-6 border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xl text-[#18181B] dark:text-white">
              <h3 className="font-extrabold text-lg mb-2">Generate Candidate Assessment Invite</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Enter candidate's email to generate an authorized evaluation token link.
              </p>

              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1">Candidate Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                  />
                </div>

                {generatedInviteUrl && (
                  <div className="p-3.5 bg-[#F4F4F5] dark:bg-[#27272A] rounded-xl border border-[#84CC16]/40 text-xs text-[#18181B] dark:text-white">
                    <div className="font-bold mb-1 flex items-center justify-between text-[#84CC16]">
                      <span>Generated Invitation Link:</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(generatedInviteUrl)}
                        className="hover:underline flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <div className="font-mono break-all select-all text-[11px] text-zinc-600 dark:text-zinc-300">{generatedInviteUrl}</div>
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
                    className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-[#18181B] dark:hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-5 py-2.5 bg-[#84CC16] text-[#18181B] rounded-xl text-xs font-bold hover:bg-[#A3E635] transition shadow-xs disabled:opacity-50"
                  >
                    {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
