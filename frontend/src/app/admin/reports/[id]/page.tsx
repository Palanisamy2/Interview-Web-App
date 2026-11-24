'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Terminal,
  Activity,
  ShieldAlert,
  User,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  ShieldCheck
} from 'lucide-react';

export default function CandidateReportPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQ, setExpandedQ] = useState<Record<number, boolean>>({});

  useEffect(() => {
    api.getSessionReport(sessionId)
      .then(data => {
        setReport(data);
        if (data.questionReviews && data.questionReviews.length > 0) {
          setExpandedQ({ [data.questionReviews[0].id]: true });
        }
      })
      .catch(err => setError(err.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const toggleExpand = (id: number) => {
    setExpandedQ(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5] dark:bg-[#121214]">
        <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
          <div className="h-5 w-5 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
          Compiling candidate evaluation report...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 text-sm">
          {error || 'Report not found'}
        </div>
      </div>
    );
  }

  const { session, sectorAnalytics, recommendation, radarData, auditEvents, codingTelemetries, questionReviews } = report;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'STRONG':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]/40">STRONG</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200">LOW</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">INSUFFICIENT DATA</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-8 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div>
          <Link href="/admin/candidates" className="text-xs text-[#84CC16] hover:underline flex items-center gap-1 font-bold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Candidates List
          </Link>
        </div>

        {/* Header Banner (Clean White Card with Graphite & Electric Lime) */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#27272A] border border-[#3F3F46] text-[#84CC16] flex items-center justify-center font-black text-2xl shadow-xs">
              {session.candidate?.name ? session.candidate.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-[#18181B] dark:text-white">{session.candidate?.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                  recommendation?.verdict === 'RECOMMENDED'
                    ? 'bg-[#84CC16]/20 text-[#84CC16] border-[#84CC16]/40'
                    : recommendation?.verdict === 'BORDERLINE'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {recommendation?.verdict || 'EVALUATED'}
                </span>
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>{session.candidate?.email}</span>
                <span>•</span>
                <span>Applied: <strong className="text-[#18181B] dark:text-zinc-200">{session.role?.name}</strong> (<span className="text-[#84CC16] font-bold">{session.stack?.name}</span>)</span>
                <span>•</span>
                <span>Experience: {session.candidate?.experienceYears || 0} years</span>
              </div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#E4E4E7] dark:border-[#2E2E33] pt-4 md:pt-0 md:pl-8">
            <div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Composite Score</div>
              <div className="text-3xl font-extrabold text-[#84CC16]">{recommendation?.overallScore || 0}%</div>
              <div className="text-xs text-[#18181B] dark:text-zinc-300 font-semibold">{recommendation?.seniority || recommendation?.level || 'Mid-Level'}</div>
            </div>
          </div>
        </div>

        {/* Primary Visuals: Radar Chart & Sector Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart (Clean White Card) */}
          <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-6 shadow-xs flex flex-col">
            <h2 className="text-base font-extrabold text-[#18181B] dark:text-white mb-1">Sector Skill Profile</h2>
            <p className="text-xs text-zinc-500 mb-4">Normalized candidate performance across evaluation sectors.</p>
            
            <div className="h-72 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#E4E4E7" />
                  <PolarAngleAxis dataKey="sector" tick={{ fill: '#71717A', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#E4E4E7" />
                  <Radar name="Candidate" dataKey="score" stroke="#84CC16" fill="#84CC16" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Table (Clean White Card) */}
          <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-6 shadow-xs flex flex-col">
            <h2 className="text-base font-extrabold text-[#18181B] dark:text-white mb-1">Sector Performance Breakdown</h2>
            <p className="text-xs text-zinc-500 mb-4">Detailed points and tier classification per technical domain.</p>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E4E4E7] dark:border-[#2E2E33] text-zinc-500 font-bold uppercase text-[11px]">
                    <th className="py-2.5">Sector</th>
                    <th className="py-2.5">Questions</th>
                    <th className="py-2.5">Points</th>
                    <th className="py-2.5">Score</th>
                    <th className="py-2.5">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E33] text-zinc-700 dark:text-zinc-300">
                  {sectorAnalytics?.map((sa: any) => (
                    <tr key={sa.id}>
                      <td className="py-3 font-semibold text-[#18181B] dark:text-white">{sa.sector?.name || 'Sector'}</td>
                      <td className="py-3">{sa.correctCount} / {sa.totalQuestions}</td>
                      <td className="py-3">{sa.earnedPoints} / {sa.maxPoints}</td>
                      <td className="py-3 font-bold text-[#84CC16]">{sa.scorePercentage}%</td>
                      <td className="py-3">{getTierBadge(sa.tier)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Deep Coding & Logic Telemetry */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-[#84CC16]" />
            <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">Coding Dynamics & Logic Thinking Telemetry</h2>
          </div>
          <p className="text-xs text-zinc-500 mb-6">
            Behavioral metrics capturing candidate thinking time, keystroke dynamics, code churn, and test run iteration patterns.
          </p>

          {codingTelemetries && codingTelemetries.length > 0 ? (
            <div className="space-y-4">
              {codingTelemetries.map((tele: any) => {
                const thinkingSec = Math.round((tele.timeToFirstKeystrokeMs || 0) / 1000);
                const activeTypingSec = Math.round((tele.activeTypingMs || 0) / 1000);
                const idleSec = Math.round((tele.idleThinkingMs || 0) / 1000);

                return (
                  <div key={tele.id} className="p-5 rounded-xl border border-[#E4E4E7] dark:border-[#2E2E33] bg-[#FAFAFA] dark:bg-[#27272A]/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <span className="font-bold text-[#18181B] dark:text-white text-sm">
                        Question #{tele.questionId}: {tele.question?.title || 'Coding Problem'}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#27272A] text-[#84CC16]">
                        Runs: {tele.runCount || 0} attempts
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs mb-4">
                      <div className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46]">
                        <div className="text-zinc-500 mb-0.5 font-medium">Initial Thinking Time</div>
                        <div className="font-extrabold text-[#18181B] dark:text-white text-sm">{thinkingSec}s</div>
                        <div className="text-[10px] text-zinc-400">Before 1st keystroke</div>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46]">
                        <div className="text-zinc-500 mb-0.5 font-medium">Active Typing Time</div>
                        <div className="font-extrabold text-[#18181B] dark:text-white text-sm">{activeTypingSec}s</div>
                        <div className="text-[10px] text-zinc-400">Hands-on-keyboard</div>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46]">
                        <div className="text-zinc-500 mb-0.5 font-medium">Idle Formulation Time</div>
                        <div className="font-extrabold text-[#18181B] dark:text-white text-sm">{idleSec}s</div>
                        <div className="text-[10px] text-zinc-400">Pausing & thinking</div>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46]">
                        <div className="text-zinc-500 mb-0.5 font-medium">Keystroke Churn</div>
                        <div className="font-extrabold text-[#18181B] dark:text-white text-sm">
                          {tele.totalKeystrokes || 0} keys
                        </div>
                        <div className="text-[10px] text-zinc-400">{tele.backspaceCount || 0} backspaces</div>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46]">
                        <div className="text-zinc-500 mb-0.5 font-medium">Syntax Errors</div>
                        <div className="font-extrabold text-[#18181B] dark:text-white text-sm">{tele.syntaxErrorsCount || 0}</div>
                        <div className="text-[10px] text-zinc-400">{tele.pasteCount > 0 ? `${tele.pasteCount} paste alerts` : 'Clean typing'}</div>
                      </div>
                    </div>

                    {/* Run Progression Timeline */}
                    {tele.testPassProgression && tele.testPassProgression.length > 0 && (
                      <div className="text-xs">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">Test Run Progression:</span>
                        <div className="flex flex-wrap gap-2">
                          {tele.testPassProgression.map((prog: any, pIdx: number) => (
                            <div
                              key={pIdx}
                              className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] ${
                                prog.passedCount === prog.totalCount
                                  ? 'bg-[#84CC16]/15 border-[#84CC16]/40 text-[#84CC16] font-bold'
                                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-700'
                              }`}
                            >
                              Run #{pIdx + 1}: {prog.passedCount}/{prog.totalCount} passed
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-zinc-400 italic">
              No interactive code questions were taken in this session.
            </div>
          )}
        </div>

        {/* Anti-Cheating & Proctoring Audit Events */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">Anti-Cheating & Integrity Log</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#27272A] text-[#84CC16]">
              Total Tab Switches: {session.tabSwitchCount || 0}
            </span>
          </div>

          {auditEvents && auditEvents.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {auditEvents.map((ev: any) => (
                <div key={ev.id} className="p-2.5 bg-[#FAFAFA] dark:bg-[#27272A] rounded-xl flex items-center justify-between text-zinc-700 dark:text-zinc-300 border border-[#E4E4E7] dark:border-[#3F3F46]">
                  <span className="font-bold text-amber-600">{ev.eventType}</span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {new Date(ev.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#84CC16] flex items-center gap-1.5 font-bold">
              <CheckCircle className="h-4 w-4" /> No suspicious window or focus switches detected during testing.
            </div>
          )}
        </div>

        {/* Question by Question Answer Review */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-[#18181B] dark:text-white mb-2">Question-by-Question Evaluation</h2>
          <p className="text-xs text-zinc-500 mb-6">Examine candidate answers against master solutions.</p>

          <div className="space-y-4">
            {questionReviews?.map((qr: any) => {
              const isExpanded = !!expandedQ[qr.id];
              const isCorrect = qr.candidateResponse?.isCorrect;

              return (
                <div key={qr.id} className="border border-[#E4E4E7] dark:border-[#2E2E33] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleExpand(qr.id)}
                    className="w-full px-5 py-4 bg-[#FAFAFA] dark:bg-[#27272A]/50 flex items-center justify-between text-left hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition"
                  >
                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-[#84CC16] shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-extrabold text-xs text-[#18181B] dark:text-white mr-2">Q{qr.position}.</span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{qr.title}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-bold text-[#18181B] dark:text-white">
                        {qr.candidateResponse?.earnedPoints || 0} / {qr.points} pts
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-5 text-xs space-y-4 bg-white dark:bg-[#1E1E22] border-t border-[#E4E4E7] dark:border-[#2E2E33]">
                      <div>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Question Body:</span>
                        <div className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line bg-[#F4F4F5] dark:bg-[#27272A] p-3.5 rounded-xl font-mono text-[11px]">
                          {qr.body}
                        </div>
                      </div>

                      {/* Candidate code answer */}
                      {qr.type === 'BUGFIX' && (
                        <div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Candidate Submitted Code:</span>
                          <pre className="p-3.5 bg-[#27272A] text-white rounded-xl overflow-x-auto font-mono text-[11px]">
                            {qr.candidateResponse?.codeAnswer || '(No code submitted)'}
                          </pre>
                        </div>
                      )}

                      {/* Candidate text answer */}
                      {qr.type === 'OUTPUT' && (
                        <div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Candidate Text Answer:</span>
                          <div className="p-3 rounded-xl bg-[#F4F4F5] dark:bg-[#27272A] font-mono text-[#18181B] dark:text-white">
                            {qr.candidateResponse?.textAnswer || '(No answer provided)'}
                          </div>
                          <div className="mt-1 text-zinc-500">
                            Expected: <code className="font-bold text-[#84CC16]">{qr.expectedOutput}</code>
                          </div>
                        </div>
                      )}

                      {/* MCQ Options review */}
                      {(qr.type === 'MCQ_SINGLE' || qr.type === 'MCQ_MULTI') && (
                        <div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Options:</span>
                          <div className="space-y-1.5">
                            {qr.options?.map((opt: any) => {
                              const selected = (qr.candidateResponse?.selectedOptionIds || []).includes(opt.id);
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl border flex items-center justify-between ${
                                    opt.isCorrect
                                      ? 'bg-[#84CC16]/10 border-[#84CC16]/40 text-[#18181B] dark:text-white font-medium'
                                      : selected
                                      ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-900 dark:text-red-300'
                                      : 'border-[#E4E4E7] dark:border-[#3F3F46] text-zinc-600 dark:text-zinc-400'
                                  }`}
                                >
                                  <span>{opt.label}. {opt.text}</span>
                                  <div className="text-[10px] flex items-center gap-2">
                                    {selected && <span className="text-[#84CC16] font-bold">[Candidate Selected]</span>}
                                    {opt.isCorrect && <span className="text-[#84CC16] font-bold">[Correct]</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {qr.explanation && (
                        <div className="p-3.5 bg-[#F4F4F5] dark:bg-[#27272A] border border-[#E4E4E7] dark:border-[#3F3F46] rounded-xl text-zinc-700 dark:text-zinc-300">
                          <strong className="block mb-0.5 text-[#18181B] dark:text-white">Explanation:</strong>
                          {qr.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
