'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Code,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      api.getCandidateSessions(cand.id)
        .then(data => setSessions(data))
        .catch(err => setError(err.message || 'Failed to load test activity'))
        .finally(() => setLoading(false));
    } catch (e) {
      router.push('/register');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
          <div className="h-5 w-5 border-2 border-indigo-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
          Loading your student dashboard...
        </div>
      </div>
    );
  }

  const completedSessions = sessions.filter(s => s.status === 'SUBMITTED' || s.status === 'COMPLETED');
  const inProgressSessions = sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED');

  // Compute best score if recommendations exist
  const scores = completedSessions
    .map(s => s.recommendation?.overallScore)
    .filter(sc => sc !== undefined && sc !== null)
    .map(Number);
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;

  const latestVerdict = completedSessions.length > 0 && completedSessions[0].recommendation?.verdict;
  const latestSeniority = completedSessions.length > 0 && completedSessions[0].recommendation?.seniority;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors duration-150">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-700 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              Candidate Student Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.name}!
            </h1>
            <p className="text-indigo-100 text-sm mt-2 max-w-xl">
              Track your technical test performance, view radar competency breakdown, and launch new framework assessments.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/select"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 shadow-sm transition"
              >
                <Code className="h-4 w-4" />
                Take New Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/student/status"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/30 text-white font-medium text-sm hover:bg-indigo-500/50 backdrop-blur border border-white/20 transition"
              >
                <FileText className="h-4 w-4" />
                View All Test Reports
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
            <Award className="h-80 w-80 text-white" />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
              <span>Tests Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {completedSessions.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Evaluated & Graded
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
              <span>Active Sessions</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {inProgressSessions.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Ready to take or resume
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
              <span>Highest Score</span>
              <TrendingUp className="h-4 w-4 text-indigo-500 dark:text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {bestScore !== null ? `${bestScore}%` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Across all sectors
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
              <span>Seniority Rating</span>
              <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {latestSeniority || 'Unranked'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {latestVerdict || 'Assessment required'}
            </div>
          </div>
        </div>

        {/* Recent Assessment Sessions */}
        <div className="bg-white dark:bg-[#161F30] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Assessments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your technical evaluation attempts and outcomes</p>
            </div>
            <Link
              href="/select"
              className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:text-indigo-800 dark:hover:text-cyan-300 transition flex items-center gap-1"
            >
              Start New Test
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-3">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No assessments recorded yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Select your engineering discipline and stack to take your first 45-minute timed technical evaluation.
              </p>
              <Link
                href="/select"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-500/20 transition"
              >
                Choose Role & Stack
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {sessions.map(s => {
                const isDone = s.status === 'SUBMITTED' || s.status === 'COMPLETED';
                const score = s.recommendation?.overallScore;
                const verdict = s.recommendation?.verdict;

                return (
                  <div key={s.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-[#1C273C]/50 transition">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {s.role?.name || 'Technical Assessment'} • <span className="text-indigo-600 dark:text-cyan-400">{s.stack?.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>Created: {new Date(s.created_at || s.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`font-semibold ${
                            isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {s.status}
                          </span>
                          {score !== undefined && score !== null && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-slate-900 dark:text-white">Score: {score}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isDone ? (
                        <Link
                          href={`/student/status?highlight=${s.id}`}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-cyan-400 transition"
                        >
                          View Results
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/consent?sessionId=${s.id}`}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-xs font-semibold text-white hover:from-indigo-500 hover:to-cyan-500 shadow-xs transition"
                        >
                          Continue Test
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
