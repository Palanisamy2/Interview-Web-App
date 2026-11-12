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
  ChevronUp
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
        // expand first question by default
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Compiling evaluation report...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error || 'Report not found'}
        </div>
      </div>
    );
  }

  const { session, sectorAnalytics, recommendation, radarData, auditEvents, codingTelemetries, questionReviews } = report;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'STRONG':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">STRONG</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">LOW</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">INSUFFICIENT DATA</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/admin/candidates" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Candidates List
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {session.candidate?.name ? session.candidate.name[0].toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{session.candidate?.name}</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                recommendation?.verdict === 'RECOMMENDED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : recommendation?.verdict === 'BORDERLINE'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {recommendation?.verdict || 'EVALUATED'}
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{session.candidate?.email}</span>
              <span>•</span>
              <span>Applied: <strong className="text-slate-700">{session.role?.name}</strong> ({session.stack?.name})</span>
              <span>•</span>
              <span>Experience: {session.candidate?.experienceYears || 0} years</span>
            </div>
          </div>
        </div>

        {/* Verdict Box */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Composite Score</div>
            <div className="text-3xl font-extrabold text-slate-900">{recommendation?.overallScore || 0}%</div>
            <div className="text-xs text-indigo-600 font-semibold">{recommendation?.level || 'Mid-Level'}</div>
          </div>
        </div>
      </div>

      {/* Primary Visuals: Radar Chart & Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Radar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-1">Sector Skill Profile</h2>
          <p className="text-xs text-slate-500 mb-4">Normalized candidate performance across evaluation sectors.</p>
          
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="sector" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="Candidate" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-1">Sector Performance Breakdown</h2>
          <p className="text-xs text-slate-500 mb-4">Detailed points and tier classification per technical domain.</p>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Sector</th>
                  <th className="py-2.5">Questions</th>
                  <th className="py-2.5">Points</th>
                  <th className="py-2.5">Score</th>
                  <th className="py-2.5">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sectorAnalytics?.map((sa: any) => (
                  <tr key={sa.id}>
                    <td className="py-3 font-semibold text-slate-900">{sa.sector?.name || 'Sector'}</td>
                    <td className="py-3">{sa.correctCount} / {sa.totalQuestions}</td>
                    <td className="py-3">{sa.earnedPoints} / {sa.maxPoints}</td>
                    <td className="py-3 font-bold">{sa.scorePercentage}%</td>
                    <td className="py-3">{getTierBadge(sa.tier)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alternative Role Recommendations */}
      {recommendation?.alternatives && recommendation.alternatives.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
          <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Alternative Role Fit Opportunities
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Candidate demonstrated strong competency in sectors applicable to these additional roles:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendation.alternatives.map((alt: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                <div className="font-bold text-slate-900 text-sm">{alt.roleName}</div>
                <div className="text-xs text-indigo-700 mt-1">
                  Fit Match: <span className="font-extrabold">{alt.fit}%</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">0 mandatory sector failures</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep Coding & Logic Telemetry (User Requested Feature) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Coding Dynamics & Logic Thinking Telemetry</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Behavioral metrics capturing candidate thinking time, keystroke dynamics, code churn, and test run iteration patterns.
        </p>

        {codingTelemetries && codingTelemetries.length > 0 ? (
          <div className="space-y-4">
            {codingTelemetries.map((tele: any) => {
              const thinkingSec = Math.round((tele.timeToFirstKeystrokeMs || 0) / 1000);
              const activeTypingSec = Math.round((tele.activeTypingMs || 0) / 1000);
              const idleSec = Math.round((tele.idleThinkingMs || 0) / 1000);

              return (
                <div key={tele.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/75">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <span className="font-bold text-slate-900 text-sm">
                      Question #{tele.questionId}: {tele.question?.title || 'Coding Problem'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Runs: {tele.runCount || 0} attempts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs mb-4">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 mb-0.5 font-medium">Initial Thinking Time</div>
                      <div className="font-bold text-slate-800 text-sm">{thinkingSec}s</div>
                      <div className="text-[10px] text-slate-500">Before 1st keystroke</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 mb-0.5 font-medium">Active Typing Time</div>
                      <div className="font-bold text-slate-800 text-sm">{activeTypingSec}s</div>
                      <div className="text-[10px] text-slate-500">Hands-on-keyboard</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 mb-0.5 font-medium">Idle Formulation Time</div>
                      <div className="font-bold text-slate-800 text-sm">{idleSec}s</div>
                      <div className="text-[10px] text-slate-500">Pausing & thinking</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 mb-0.5 font-medium">Keystroke Churn</div>
                      <div className="font-bold text-slate-800 text-sm">
                        {tele.totalKeystrokes || 0} keys
                      </div>
                      <div className="text-[10px] text-slate-500">{tele.backspaceCount || 0} backspaces</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 mb-0.5 font-medium">Syntax Errors</div>
                      <div className="font-bold text-slate-800 text-sm">{tele.syntaxErrorsCount || 0}</div>
                      <div className="text-[10px] text-slate-500">{tele.pasteCount > 0 ? `${tele.pasteCount} paste alerts` : 'Clean typing'}</div>
                    </div>
                  </div>

                  {/* Run Progression Timeline */}
                  {tele.testPassProgression && tele.testPassProgression.length > 0 && (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 block mb-2">Test Run Progression:</span>
                      <div className="flex flex-wrap gap-2">
                        {tele.testPassProgression.map((prog: any, pIdx: number) => (
                          <div
                            key={pIdx}
                            className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] ${
                              prog.passedCount === prog.totalCount
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-700'
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
          <div className="text-xs text-slate-400 italic">
            No interactive code questions were taken in this session.
          </div>
        )}
      </div>

      {/* Anti-Cheating & Proctoring Audit Events */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Anti-Cheating & Integrity Log</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
            Total Tab Switches: {session.tabSwitchCount || 0}
          </span>
        </div>

        {auditEvents && auditEvents.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
            {auditEvents.map((ev: any) => (
              <div key={ev.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-slate-700">
                <span className="font-semibold text-amber-700">{ev.eventType}</span>
                <span className="text-slate-400 font-mono">
                  {new Date(ev.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
            <CheckCircle className="h-4 w-4" /> No suspicious window or focus switches detected during testing.
          </div>
        )}
      </div>

      {/* Question by Question Answer Review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2">Question-by-Question Evaluation</h2>
        <p className="text-xs text-slate-500 mb-6">Examine candidate answers against master solutions.</p>

        <div className="space-y-4">
          {questionReviews?.map((qr: any) => {
            const isExpanded = !!expandedQ[qr.id];
            const isCorrect = qr.candidateResponse?.isCorrect;

            return (
              <div key={qr.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpand(qr.id)}
                  className="w-full px-5 py-4 bg-slate-50 flex items-center justify-between text-left hover:bg-slate-100/75 transition"
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-xs text-slate-800 mr-2">Q{qr.position}.</span>
                      <span className="text-xs font-semibold text-slate-900">{qr.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-bold text-slate-700">
                      {qr.candidateResponse?.earnedPoints || 0} / {qr.points} pts
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 text-xs space-y-4 bg-white border-t border-slate-200">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Question Body:</span>
                      <div className="text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-lg font-mono">
                        {qr.body}
                      </div>
                    </div>

                    {/* Candidate code answer */}
                    {qr.type === 'BUGFIX' && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Candidate Submitted Code:</span>
                        <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto font-mono">
                          {qr.candidateResponse?.codeAnswer || '(No code submitted)'}
                        </pre>
                      </div>
                    )}

                    {/* Candidate text answer */}
                    {qr.type === 'OUTPUT' && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Candidate Text Answer:</span>
                        <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-slate-900">
                          {qr.candidateResponse?.textAnswer || '(No answer provided)'}
                        </div>
                        <div className="mt-1 text-slate-500">
                          Expected: <code className="font-bold text-slate-800">{qr.expectedOutput}</code>
                        </div>
                      </div>
                    )}

                    {/* MCQ Options review */}
                    {(qr.type === 'MCQ_SINGLE' || qr.type === 'MCQ_MULTI') && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Options:</span>
                        <div className="space-y-1.5">
                          {qr.options?.map((opt: any) => {
                            const selected = (qr.candidateResponse?.selectedOptionIds || []).includes(opt.id);
                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                                  opt.isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                                    : selected
                                    ? 'bg-red-50 border-red-200 text-red-900'
                                    : 'border-slate-200 text-slate-600'
                                }`}
                              >
                                <span>{opt.label}. {opt.text}</span>
                                <div className="text-[10px] flex items-center gap-2">
                                  {selected && <span className="text-indigo-700 font-bold">[Candidate Selected]</span>}
                                  {opt.isCorrect && <span className="text-emerald-700 font-bold">[Correct]</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {qr.explanation && (
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-900">
                        <strong className="block mb-0.5">Explanation:</strong>
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
  );
}

