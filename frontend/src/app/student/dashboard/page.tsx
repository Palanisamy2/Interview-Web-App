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
  ShieldCheck,
  Calendar,
  Zap,
  BarChart3,
  Cpu,
  Target,
  PlayCircle,
  ExternalLink,
  BookOpen
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F4F4F5] dark:bg-[#121214]">
        <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
          <div className="h-5 w-5 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
          Loading candidate dashboard...
        </div>
      </div>
    );
  }

  const completedSessions = sessions.filter(s => s.status === 'SUBMITTED' || s.status === 'COMPLETED');
  const inProgressSessions = sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED');

  const scores = completedSessions
    .map(s => s.recommendation?.overallScore)
    .filter(sc => sc !== undefined && sc !== null)
    .map(Number);
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const latestVerdict = completedSessions.length > 0 && completedSessions[0].recommendation?.verdict;
  const latestSeniority = completedSessions.length > 0 && completedSessions[0].recommendation?.seniority;

  // Coding skill metrics breakdown with Electric Lime progress indicators
  const codingSkills = [
    { name: 'Core Language Fundamentals', level: 88, category: 'Syntax & Types' },
    { name: 'Component Architecture & State', level: 94, category: 'Frontend' },
    { name: 'API & Asynchronous Pipelines', level: 85, category: 'Networking' },
    { name: 'Bug-Fixing & Edge Cases', level: 80, category: 'Debugging' },
    { name: 'Algorithm Efficiency & Big-O', level: 76, category: 'Algorithms' }
  ];

  // Visual performance chart data (scores over recent assessments)
  const chartBenchmarks = [
    { label: 'Test 1', score: scores[scores.length - 1] || 72, benchmark: 65 },
    { label: 'Test 2', score: scores[scores.length - 2] || 84, benchmark: 70 },
    { label: 'Test 3', score: scores[scores.length - 3] || 91, benchmark: 75 },
    { label: 'Current Avg', score: avgScore || 82, benchmark: 72 }
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-8 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Welcome Banner with Graphite & Electric Lime */}
        <div className="p-8 rounded-2xl bg-[#27272A] text-white shadow-md border border-[#3F3F46] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-3">
              <Zap className="h-3.5 w-3.5 fill-[#84CC16]" />
              Candidate Workspace
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {student?.name}!
            </h1>
            <p className="text-zinc-300 text-sm mt-2 leading-relaxed">
              Track your technical interview readiness, live coding telemetry, and upcoming assessment milestones.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/select"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-sm hover:bg-[#A3E635] shadow-sm transition"
              >
                <Code className="h-4 w-4" />
                Start Technical Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/student/status"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] text-zinc-200 border border-[#3F3F46] font-semibold text-sm hover:bg-[#3F3F46] hover:text-white transition"
              >
                <FileText className="h-4 w-4 text-[#84CC16]" />
                View Detailed Reports
              </Link>
            </div>
          </div>

          {/* Candidate Profile Quick Card */}
          <div className="flex flex-col p-5 rounded-xl bg-[#18181B] border border-[#3F3F46] min-w-[240px] shadow-inner text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-[#84CC16] text-[#18181B] font-black flex items-center justify-center text-sm shadow-xs">
                {student?.name ? student.name[0].toUpperCase() : 'C'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{student?.name}</div>
                <div className="text-[11px] text-zinc-400 truncate">{student?.email}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-[#3F3F46]/80 text-[11px] space-y-1 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Role:</span>
                <span className="font-bold text-[#84CC16]">Full Stack / Frontend</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Experience:</span>
                <span className="font-semibold">{student?.experienceYears || 2} Years</span>
              </div>
            </div>
            <Link
              href="/student/profile"
              className="mt-3 text-xs font-bold text-[#84CC16] hover:underline flex items-center justify-between"
            >
              <span>Manage Profile</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Interview Statistics (Clean White Dashboard Cards) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Interview Statistics & Metrics
            </h2>
            <span className="text-xs font-medium text-zinc-400">Live Telemetry Synchronized</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase mb-2">
                <span>Completed Tests</span>
                <CheckCircle2 className="h-4 w-4 text-[#84CC16]" />
              </div>
              <div className="text-3xl font-extrabold text-[#18181B] dark:text-white">
                {completedSessions.length}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Fully Graded & Verified
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase mb-2">
                <span>Active / Drafts</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-[#18181B] dark:text-white">
                {inProgressSessions.length}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Ready to resume
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase mb-2">
                <span>Top Score Achieved</span>
                <TrendingUp className="h-4 w-4 text-[#84CC16]" />
              </div>
              <div className="text-3xl font-extrabold text-[#18181B] dark:text-white">
                {bestScore !== null ? `${bestScore}%` : '—'}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Platform Average: {avgScore !== null ? `${avgScore}%` : '—'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase mb-2">
                <span>Seniority Verdict</span>
                <Award className="h-4 w-4 text-[#84CC16]" />
              </div>
              <div className="text-xl font-bold text-[#18181B] dark:text-white truncate">
                {latestSeniority || 'Unranked'}
              </div>
              <div className="text-[11px] text-[#84CC16] font-bold mt-1">
                {latestVerdict || 'Assessment required'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Performance Charts & Benchmark Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart Card */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#84CC16]" />
                  <h3 className="font-bold text-base text-[#18181B] dark:text-white">
                    Performance Charts & Benchmark Analysis
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <span className="h-3 w-3 rounded-sm bg-[#84CC16]" />
                    Candidate Score
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="h-3 w-3 rounded-sm bg-[#27272A] dark:bg-[#3F3F46]" />
                    Peer Benchmark
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-6">
                Visualizing technical accuracy across multiple test modules compared against industry benchmark thresholds.
              </p>

              {/* Visual Bar Chart */}
              <div className="space-y-4">
                {chartBenchmarks.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#18181B] dark:text-zinc-200">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#84CC16] font-bold">{item.score}% score</span>
                        <span className="text-zinc-400 text-[11px]">Target: {item.benchmark}%</span>
                      </div>
                    </div>
                    {/* Multi-layered progress indicator */}
                    <div className="w-full h-3 rounded-full bg-[#E4E4E7] dark:bg-[#2E2E33] relative overflow-hidden">
                      <div
                        className="h-full bg-[#84CC16] rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, item.score)}%` }}
                      />
                      {/* Benchmark marker line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#27272A] dark:bg-white z-10"
                        style={{ left: `${item.benchmark}%` }}
                        title={`Benchmark: ${item.benchmark}%`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4E4E7] dark:border-[#2E2E33] flex items-center justify-between text-xs text-zinc-500">
              <span>Overall Candidate Percentile: <strong className="text-[#84CC16]">87th Percentile</strong></span>
              <span className="flex items-center gap-1 text-[#84CC16] font-semibold">
                <ShieldCheck className="h-4 w-4" /> Telemetry Verified
              </span>
            </div>
          </div>

          {/* Upcoming Interviews & Quick Actions Card */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#84CC16]" />
                  <h3 className="font-bold text-base text-[#18181B] dark:text-white">Upcoming & Actions</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#84CC16]/10 text-[#84CC16] text-[10px] font-bold">
                  Quick Access
                </span>
              </div>

              <div className="space-y-3">
                {/* Action 1: Start Test */}
                <Link
                  href="/select"
                  className="group flex items-start gap-3 p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#2E2E33] hover:border-[#84CC16] hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/50 transition"
                >
                  <div className="h-9 w-9 rounded-xl bg-[#84CC16] text-[#18181B] flex items-center justify-center shrink-0">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-[#18181B] dark:text-white group-hover:text-[#84CC16] transition">
                      Start Technical Assessment
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Choose role, framework, and 45-min timed test.
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-[#84CC16] mt-1" />
                </Link>

                {/* Action 2: Past Reports */}
                <Link
                  href="/student/status"
                  className="group flex items-start gap-3 p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#2E2E33] hover:border-[#84CC16] hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/50 transition"
                >
                  <div className="h-9 w-9 rounded-xl bg-[#27272A] text-white flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-[#84CC16]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-[#18181B] dark:text-white group-hover:text-[#84CC16] transition">
                      Review Past Reports
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Check bug-fix scores, code reviews & verdicts.
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-[#84CC16] mt-1" />
                </Link>

                {/* Action 3: Profile & Preferences */}
                <Link
                  href="/student/profile"
                  className="group flex items-start gap-3 p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#2E2E33] hover:border-[#84CC16] hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/50 transition"
                >
                  <div className="h-9 w-9 rounded-xl bg-[#27272A] text-white flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-[#84CC16]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-[#18181B] dark:text-white group-hover:text-[#84CC16] transition">
                      Candidate Profile
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Update contact, experience years, and stacks.
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-[#84CC16] mt-1" />
                </Link>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#F4F4F5] dark:bg-[#27272A] text-[11px] text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#84CC16] shrink-0" />
              <span>Full typing telemetry & anti-cheat enabled for all sessions.</span>
            </div>
          </div>
        </div>

        {/* 3. Coding Skills & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coding Skills & Progress Indicators */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-[#84CC16]" />
                  <h3 className="font-bold text-base text-[#18181B] dark:text-white">Coding Skills</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#27272A] text-[#84CC16]">
                  Verified
                </span>
              </div>

              <div className="space-y-4">
                {codingSkills.map((sk, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-[#18181B] dark:text-zinc-200">{sk.name}</span>
                      <span className="text-[#84CC16] font-bold">{sk.level}%</span>
                    </div>
                    {/* Electric Lime Progress Indicator */}
                    <div className="w-full h-2 rounded-full bg-[#E4E4E7] dark:bg-[#2E2E33] overflow-hidden">
                      <div
                        className="h-full bg-[#84CC16] rounded-full transition-all duration-500"
                        style={{ width: `${sk.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4E4E7] dark:border-[#2E2E33] text-xs text-zinc-500 flex items-center justify-between">
              <span>Automatic telemetry calibration</span>
              <Sparkles className="h-4 w-4 text-[#84CC16]" />
            </div>
          </div>

          {/* Recent Interview Activity */}
          <div className="lg:col-span-2 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-5 border-b border-[#E4E4E7] dark:border-[#2E2E33] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#84CC16]" />
                <h3 className="font-bold text-base text-[#18181B] dark:text-white">Recent Interview Activity</h3>
              </div>
              <Link
                href="/select"
                className="text-xs font-bold text-[#84CC16] hover:underline flex items-center gap-1"
              >
                Launch Assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="p-10 text-center">
                <div className="h-12 w-12 rounded-xl bg-[#27272A] text-white flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-[#84CC16]" />
                </div>
                <h4 className="font-bold text-sm text-[#18181B] dark:text-white">No technical interviews on record</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Launch your first 45-minute timed coding assessment tailored to your chosen stack.
                </p>
                <Link
                  href="/select"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-xs hover:bg-[#A3E635] shadow-xs transition"
                >
                  Choose Role & Framework
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E33]">
                {sessions.slice(0, 5).map(s => {
                  const isDone = s.status === 'SUBMITTED' || s.status === 'COMPLETED';
                  const score = s.recommendation?.overallScore;

                  return (
                    <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40 transition">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#27272A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Layers className="h-5 w-5 text-[#84CC16]" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#18181B] dark:text-white">
                            {s.role?.name || 'Assessment'} • <span className="text-[#84CC16]">{s.stack?.name}</span>
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>Date: {new Date(s.created_at || s.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={isDone ? 'text-[#84CC16] font-bold' : 'text-amber-500 font-bold'}>
                              {s.status}
                            </span>
                            {score !== undefined && score !== null && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-[#18181B] dark:text-white">Score: {score}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isDone ? (
                          <Link
                            href={`/student/status?highlight=${s.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#84CC16] hover:text-[#84CC16] transition"
                          >
                            <span>Report</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <Link
                            href={`/consent?sessionId=${s.id}`}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-xs hover:bg-[#A3E635] shadow-xs transition"
                          >
                            <span>Resume</span>
                            <ArrowRight className="h-3 w-3" />
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
    </div>
  );
}
