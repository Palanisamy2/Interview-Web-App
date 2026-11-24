'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

function StudentTestStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [student, setStudent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS'>('ALL');

  useEffect(() => {
    const candStr = localStorage.getItem('candidateInfo');
    if (!candStr) {
      router.push('/register');
      return;
    }

    try {
      const cand = JSON.parse(candStr);
      setStudent(cand);

      api.getCandidateSessions(cand.id)
        .then(data => setSessions(data))
        .catch(err => setError(err.message || 'Failed to load test history'))
        .finally(() => setLoading(false));
    } catch (e) {
      router.push('/register');
    }
  }, [router]);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'COMPLETED') return s.status === 'SUBMITTED' || s.status === 'COMPLETED';
    if (filter === 'IN_PROGRESS') return s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <Clock className="h-3.5 w-3.5" />
            In Progress
          </span>
        );
      case 'NOT_STARTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-800/60">
            <Clock className="h-3.5 w-3.5" />
            Not Started
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'RECOMMENDED':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'BORDERLINE':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'NOT_RECOMMENDED':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'STRONG':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';
      case 'MEDIUM':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
      case 'LOW':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
          <div className="h-5 w-5 border-2 border-indigo-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
          Loading your test statuses & performance records...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors duration-150">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-2 shadow-xs">
              <ClipboardList className="h-3.5 w-3.5" />
              Candidate Assessment Records
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Test Status & Performance Reports
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review outcomes, sector competency scores, and assessment evaluation reports.
            </p>
          </div>

          <Link
            href="/select"
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-500/20 transition"
          >
            Take Another Test
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {(['ALL', 'COMPLETED', 'IN_PROGRESS'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C273C]'
              }`}
            >
              {tab === 'ALL' ? 'All Assessments' : tab === 'COMPLETED' ? 'Completed & Graded' : 'Active / Pending'}
            </button>
          ))}
        </div>

        {/* Test Cards List */}
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#161F30] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <ClipboardList className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No test sessions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You do not have any test records under the "{filter.toLowerCase()}" category.
            </p>
            <Link
              href="/select"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs hover:from-indigo-500 hover:to-cyan-500 shadow-sm transition"
            >
              Start New Test
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map(session => {
              const isHighlighted = highlightId === session.id;
              const isDone = session.status === 'SUBMITTED' || session.status === 'COMPLETED';
              const rec = session.recommendation;
              const analytics = session.sectorAnalytics || [];

              return (
                <div
                  key={session.id}
                  className={`bg-white dark:bg-[#161F30] rounded-2xl border p-6 transition-all duration-200 ${
                    isHighlighted
                      ? 'border-indigo-600 dark:border-cyan-400 ring-2 ring-indigo-500/20 dark:ring-cyan-500/30 shadow-lg'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {session.role?.name || 'Technical Role'} • {session.stack?.name}
                          </h3>
                          {getStatusBadge(session.status)}
                          {rec?.verdict && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getVerdictBadge(rec.verdict)}`}>
                              {rec.verdict}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span>Session ID: {session.id.slice(0, 8)}...</span>
                          <span>•</span>
                          <span>Started: {new Date(session.created_at || session.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-center">
                      {isDone ? (
                        <Link
                          href={`/admin/reports/${session.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-[#1A263E] border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-cyan-300 font-semibold text-xs hover:bg-indigo-100 dark:hover:bg-[#20304E] transition shadow-xs"
                        >
                          View Evaluation Report
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/consent?sessionId=${session.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs hover:from-indigo-500 hover:to-cyan-500 transition shadow-xs"
                        >
                          Continue Assessment
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Score & Verdict Details (if completed) */}
                  {isDone && rec && (
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1524] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Overall Score
                          </div>
                          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                            {rec.overallScore}%
                          </div>
                        </div>
                        <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1524] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Evaluated Seniority
                          </div>
                          <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                            {rec.seniority || 'Mid-Level'}
                          </div>
                        </div>
                        <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1524] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Alternative Role Fit
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate max-w-[180px]">
                            {rec.alternateRole ? rec.alternateRole.name : 'Primary Fit Strong'}
                          </div>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  )}

                  {/* Sector Performance Pills */}
                  {analytics.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Sector Tiers:</span>
                      {analytics.map((sa: any, idx: number) => (
                        <div
                          key={idx}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${getTierBadge(sa.tier)}`}
                        >
                          <span className="font-semibold">{sa.sector?.name || `Sector ${sa.sectorId}`}:</span>
                          <span>{sa.score}% ({sa.tier})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentTestStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
            <div className="h-5 w-5 border-2 border-indigo-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
            Loading test statuses...
          </div>
        </div>
      }
    >
      <StudentTestStatusContent />
    </Suspense>
  );
}
