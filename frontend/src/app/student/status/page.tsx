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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#84CC16]/15 text-[#84CC16] border border-[#84CC16]/30">
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <Clock className="h-3.5 w-3.5" />
            Not Started
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {status}
          </span>
        );
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'RECOMMENDED':
        return 'bg-[#84CC16]/20 text-[#84CC16] border-[#84CC16]/40';
      case 'BORDERLINE':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300';
      case 'NOT_RECOMMENDED':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5] dark:bg-[#121214]">
        <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
          <div className="h-5 w-5 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
          Loading your test statuses & performance records...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-10 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-2 shadow-xs">
              <ClipboardList className="h-3.5 w-3.5" />
              Candidate Assessment Records
            </div>
            <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Test Status & Performance Reports
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review evaluation outcomes, score breakdown, and assessment reports.
            </p>
          </div>

          <Link
            href="/select"
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-xs hover:bg-[#A3E635] shadow-xs transition"
          >
            Take Another Test
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E4E4E7] dark:border-[#2E2E33] pb-3">
          {(['ALL', 'COMPLETED', 'IN_PROGRESS'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === tab
                  ? 'bg-[#84CC16] text-[#18181B] shadow-xs'
                  : 'bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] text-zinc-600 dark:text-zinc-300 hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]'
              }`}
            >
              {tab === 'ALL' ? 'All Assessments' : tab === 'COMPLETED' ? 'Completed & Graded' : 'Active / Pending'}
            </button>
          ))}
        </div>

        {/* Test Cards List */}
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
            <ClipboardList className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#18181B] dark:text-white">No test sessions found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              You do not have any test records under the "{filter.toLowerCase()}" category.
            </p>
            <Link
              href="/select"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-xs hover:bg-[#A3E635] shadow-sm transition"
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

              return (
                <div
                  key={session.id}
                  className={`bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border p-6 transition-all duration-200 ${
                    isHighlighted
                      ? 'border-[#84CC16] ring-2 ring-[#84CC16]/20 shadow-md'
                      : 'border-[#E4E4E7] dark:border-[#2E2E33] hover:border-[#84CC16]/60 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7] dark:border-[#2E2E33]">
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-[#27272A] text-white flex items-center justify-center shrink-0">
                        <Layers className="h-6 w-6 text-[#84CC16]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-extrabold text-[#18181B] dark:text-white text-base">
                            {session.role?.name || 'Technical Role'} • {session.stack?.name}
                          </h3>
                          {getStatusBadge(session.status)}
                          {rec?.verdict && (
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getVerdictBadge(rec.verdict)}`}>
                              {rec.verdict}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 flex-wrap">
                          <span>Session ID: {session.id.slice(0, 8)}...</span>
                          <span>•</span>
                          <span>Date: {new Date(session.created_at || session.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-center">
                      {isDone ? (
                        <Link
                          href={`/admin/reports/${session.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#27272A] border border-[#3F3F46] text-[#84CC16] font-bold text-xs hover:bg-[#3F3F46] hover:text-white transition shadow-xs"
                        >
                          View Evaluation Report
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/consent?sessionId=${session.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-xs hover:bg-[#A3E635] transition shadow-xs"
                        >
                          Continue Assessment
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Overall Score:</span>
                      <span className="font-extrabold text-[#84CC16] text-sm">
                        {rec?.overallScore !== undefined && rec?.overallScore !== null ? `${rec.overallScore}%` : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Seniority Level:</span>
                      <span className="font-semibold text-[#18181B] dark:text-white">
                        {rec?.seniority || 'Under Evaluation'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Tab Switches:</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {session.tab_switch_count || 0} recorded
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Integrity Audit:</span>
                      <span className="font-bold text-[#84CC16] inline-flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Monitored
                      </span>
                    </div>
                  </div>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm">Loading test records...</div>}>
      <StudentTestStatusContent />
    </Suspense>
  );
}
