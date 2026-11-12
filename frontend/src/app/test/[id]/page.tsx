'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Bookmark,
  Flag,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Terminal,
  Save
} from 'lucide-react';

export default function TestTakingPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Candidate answers map keyed by questionId
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});

  // Timer
  const [remainingSec, setRemainingSec] = useState<number>(45 * 60);

  // Code runner state
  const [runningCode, setRunningCode] = useState(false);
  const [runResults, setRunResults] = useState<any>(null);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Anti-cheat modal & count
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Coding Telemetry Refs for current question
  const questionLoadTimeRef = useRef<number>(Date.now());
  const firstKeystrokeTimeRef = useRef<number | null>(null);
  const activeTypingMsRef = useRef<number>(0);
  const lastKeyTimeRef = useRef<number | null>(null);
  const keystrokeCountRef = useRef<number>(0);
  const backspaceCountRef = useRef<number>(0);
  const pasteCountRef = useRef<number>(0);

  // Flush telemetry for a question
  const flushTelemetry = useCallback((qId: number) => {
    if (!qId) return;
    const now = Date.now();
    const totalTimeOnQ = now - questionLoadTimeRef.current;
    const thinkingTime = firstKeystrokeTimeRef.current 
      ? firstKeystrokeTimeRef.current - questionLoadTimeRef.current 
      : totalTimeOnQ;
    const idleTime = Math.max(0, totalTimeOnQ - activeTypingMsRef.current);

    api.recordTelemetry(sessionId, qId, {
      timeToFirstKeystrokeMs: Math.max(0, thinkingTime),
      activeTypingMs: activeTypingMsRef.current,
      idleThinkingMs: idleTime,
      keystrokeDelta: keystrokeCountRef.current,
      backspaceDelta: backspaceCountRef.current,
      pasteDetected: pasteCountRef.current > 0
    }).catch(console.error);

    // Reset telemetry counters for next question
    questionLoadTimeRef.current = Date.now();
    firstKeystrokeTimeRef.current = null;
    activeTypingMsRef.current = 0;
    lastKeyTimeRef.current = null;
    keystrokeCountRef.current = 0;
    backspaceCountRef.current = 0;
    pasteCountRef.current = 0;
  }, [sessionId]);

  // Load questions and initial session state
  useEffect(() => {
    async function loadTest() {
      try {
        const data = await api.getQuestions(sessionId);
        setSessionData(data);
        setQuestions(data.questions || []);

        // Populate initial answers from previous drafts
        const initialAnswers: Record<number, any> = {};
        (data.questions || []).forEach((q: any) => {
          if (q.userResponse) {
            initialAnswers[q.id] = {
              selectedOptionIds: q.userResponse.selectedOptionIds || [],
              textAnswer: q.userResponse.textAnswer || '',
              codeAnswer: q.userResponse.codeAnswer || (q.bugfixSpec?.starterCode || ''),
              timeSpentSec: q.userResponse.timeSpentSec || 0
            };
          } else {
            initialAnswers[q.id] = {
              selectedOptionIds: [],
              textAnswer: '',
              codeAnswer: q.bugfixSpec?.starterCode || '',
              timeSpentSec: 0
            };
          }
        });
        setAnswers(initialAnswers);

        // Fetch remaining time from server
        const status = await api.getSessionStatus(sessionId);
        setRemainingSec(status.remainingSeconds || 45 * 60);
        setTabSwitches(status.tabSwitchCount || 0);

        setLoading(false);
      } catch (err: any) {
        alert(err.message || 'Failed to load test questions');
        router.push('/register');
      }
    }
    loadTest();
  }, [sessionId, router]);

  // Server Countdown Timer
  useEffect(() => {
    if (loading || remainingSec <= 0) return;

    const timer = setInterval(() => {
      setRemainingSec(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, remainingSec]);

  // Proctoring: Detect Tab Blur & Window Focus Loss
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        api.logAuditEvent(sessionId, 'TAB_BLUR', { url: window.location.href });
        setTabSwitches(prev => prev + 1);
        setShowWarningModal(true);
      }
    };

    const handleCopy = () => {
      api.logAuditEvent(sessionId, 'COPY', { qIndex: currentIndex + 1 });
    };

    const handlePaste = () => {
      pasteCountRef.current += 1;
      api.logAuditEvent(sessionId, 'PASTE', { qIndex: currentIndex + 1 });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [sessionId, currentIndex]);

  // Keystroke handler for typing telemetry
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const now = Date.now();
    if (!firstKeystrokeTimeRef.current) {
      firstKeystrokeTimeRef.current = now;
    }

    keystrokeCountRef.current += 1;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      backspaceCountRef.current += 1;
    }

    if (lastKeyTimeRef.current) {
      const delta = now - lastKeyTimeRef.current;
      // If keystrokes are within 2 seconds of each other, count as active typing
      if (delta < 2000) {
        activeTypingMsRef.current += delta;
      }
    }
    lastKeyTimeRef.current = now;
  };

  // Autosave function (debounced or on transition)
  const saveAnswer = async (qId: number, currentAns: any) => {
    setSaveStatus('saving');
    try {
      await api.autosaveAnswer(sessionId, qId, currentAns);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Autosave failed:', e);
      setSaveStatus('error');
    }
  };

  const handleOptionToggle = (optionId: number, isMulti: boolean) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers(prev => {
      const curr = prev[currentQ.id] || { selectedOptionIds: [] };
      let newOptionIds: number[] = [];

      if (isMulti) {
        const set = new Set<number>(curr.selectedOptionIds || []);
        if (set.has(optionId)) set.delete(optionId);
        else set.add(optionId);
        newOptionIds = Array.from(set);
      } else {
        newOptionIds = [optionId];
      }

      const updated = { ...curr, selectedOptionIds: newOptionIds };
      saveAnswer(currentQ.id, updated);
      return { ...prev, [currentQ.id]: updated };
    });
  };

  const handleTextAnswerChange = (text: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers(prev => {
      const updated = { ...(prev[currentQ.id] || {}), textAnswer: text };
      saveAnswer(currentQ.id, updated);
      return { ...prev, [currentQ.id]: updated };
    });
  };

  const handleCodeAnswerChange = (code: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers(prev => {
      const updated = { ...(prev[currentQ.id] || {}), codeAnswer: code };
      return { ...prev, [currentQ.id]: updated };
    });
  };

  // Save code changes on blur
  const handleCodeBlur = () => {
    const currentQ = questions[currentIndex];
    if (currentQ) {
      saveAnswer(currentQ.id, answers[currentQ.id]);
    }
  };

  // Run code against visible test cases
  const handleRunCode = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const userCode = answers[currentQ.id]?.codeAnswer || '';
    setRunningCode(true);
    setRunResults(null);

    try {
      const res = await api.runCode(sessionId, currentQ.id, userCode);
      setRunResults(res);
      // Autosave after running
      await saveAnswer(currentQ.id, answers[currentQ.id]);
    } catch (err: any) {
      setRunResults({
        totalTests: 0,
        passedCount: 0,
        allPassed: false,
        testResults: [{ error: err.message || 'Execution error', isHidden: false }]
      });
    } finally {
      setRunningCode(false);
    }
  };

  // Switch questions
  const goToQuestion = (index: number) => {
    if (index === currentIndex) return;
    const prevQ = questions[currentIndex];
    if (prevQ) {
      flushTelemetry(prevQ.id);
      saveAnswer(prevQ.id, answers[prevQ.id]);
    }
    setRunResults(null);
    setCurrentIndex(index);
  };

  // Final submission
  const handleSubmitTest = async (auto = false) => {
    if (!auto) {
      const confirmed = window.confirm('Are you sure you want to finish and submit your assessment?');
      if (!confirmed) return;
    }

    setSubmitting(true);
    const currentQ = questions[currentIndex];
    if (currentQ) {
      flushTelemetry(currentQ.id);
      await saveAnswer(currentQ.id, answers[currentQ.id]).catch(() => {});
    }

    try {
      const result = await api.submitSession(sessionId);
      router.push(`/completed?sessionId=${sessionId}&verdict=${result.verdict}&score=${result.overallScore}`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing test environment...</span>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || {};
  const currentAnswer = answers[currentQ.id] || {};
  const isFlagged = !!flagged[currentQ.id];

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
      {/* Test Control Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-16 z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg font-mono font-bold text-sm">
            <Clock className={`h-4 w-4 ${remainingSec < 300 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`} />
            <span className={remainingSec < 300 ? 'text-red-600 font-extrabold' : ''}>
              {formatTimer(remainingSec)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Auto-save active</span>
            {lastSavedTime && <span className="text-slate-400">({lastSavedTime})</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isFlagged
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            {isFlagged ? 'Marked for Review' : 'Mark for Review'}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitTest(false)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-6 gap-6">
        {/* Left: Question Content & Interactive Work Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {currentQ.sector?.name || 'Technical Sector'}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                currentQ.difficulty === 'HARD'
                  ? 'bg-red-50 text-red-600'
                  : currentQ.difficulty === 'MEDIUM'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                {currentQ.difficulty} ({currentQ.points} {currentQ.points === 1 ? 'pt' : 'pts'})
              </span>
            </div>
          </div>

          {/* Question Body */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">{currentQ.title}</h2>
            <div className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
              {currentQ.body}
            </div>
          </div>

          {/* Interactive Answer Area According to Type */}
          <div className="flex-1 flex flex-col">
            {/* 1. Single / Multi MCQ */}
            {(currentQ.type === 'MCQ_SINGLE' || currentQ.type === 'MCQ_MULTI') && (
              <div className="space-y-3 mt-4">
                {currentQ.type === 'MCQ_MULTI' && (
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                    * Multiple Choice (Select all that apply)
                  </p>
                )}
                {currentQ.options?.map((opt: any) => {
                  const isChecked = (currentAnswer.selectedOptionIds || []).includes(opt.id);
                  const isMulti = currentQ.type === 'MCQ_MULTI';

                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleOptionToggle(opt.id, isMulti)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type={isMulti ? 'checkbox' : 'radio'}
                        name={`question_${currentQ.id}`}
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300"
                      />
                      <div className="flex-1 text-sm text-slate-800">
                        <span className="font-bold mr-2 text-indigo-700">{opt.label}.</span>
                        {opt.text}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 2. Output Prediction */}
            {currentQ.type === 'OUTPUT' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Enter Expected Terminal Output:
                </label>
                <input
                  type="text"
                  value={currentAnswer.textAnswer || ''}
                  onKeyDown={handleKeyDown}
                  onChange={e => handleTextAnswerChange(e.target.value)}
                  placeholder="e.g. 1 4 3 2"
                  className="w-full p-3 font-mono text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* 3. Bug-Fix Code Question with Live Execution */}
            {currentQ.type === 'BUGFIX' && (
              <div className="mt-4 flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-indigo-600" />
                    Code Editor ({currentQ.bugfixSpec?.language || 'JavaScript'})
                  </span>

                  <button
                    type="button"
                    disabled={runningCode}
                    onClick={handleRunCode}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-xs"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {runningCode ? 'Evaluating Test Cases...' : 'Run Code'}
                  </button>
                </div>

                {/* Code Textarea with Telemetry Listeners */}
                <textarea
                  value={currentAnswer.codeAnswer || ''}
                  onKeyDown={handleKeyDown}
                  onChange={e => handleCodeAnswerChange(e.target.value)}
                  onBlur={handleCodeBlur}
                  rows={10}
                  spellCheck={false}
                  placeholder="// Type or paste your solution here..."
                  className="w-full p-4 font-mono text-sm bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
                />

                {/* Test Results Display */}
                {runResults && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Visible Test Case Results:
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        runResults.allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        Passed {runResults.passedCount} / {runResults.totalTests} tests
                      </span>
                    </div>

                    <div className="space-y-2">
                      {runResults.testResults?.map((t: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-700">Test Case #{t.testIndex}</span>
                            {t.passed ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Passed
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5" /> Failed
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-slate-600">
                            <div>Input: <span className="text-slate-900">{t.input}</span></div>
                            <div>Expected: <span className="text-slate-900">{t.expected}</span></div>
                            <div>Actual: <span className={t.passed ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'}>{t.actual}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => goToQuestion(currentIndex + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-30 shadow-xs"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Question Navigation Palette */}
        <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col h-fit">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Question Overview</h3>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isAnswered =
                (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                (ans?.textAnswer && ans.textAnswer.trim().length > 0) ||
                (ans?.codeAnswer && ans.codeAnswer.trim().length > 0 && ans.codeAnswer !== q.bugfixSpec?.starterCode);
              const isFlag = !!flagged[q.id];
              const isCurrent = currentIndex === idx;

              let btnClass = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';
              if (isCurrent) {
                btnClass = 'ring-2 ring-indigo-600 border-indigo-600 bg-white text-indigo-700 font-bold';
              } else if (isFlag) {
                btnClass = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
              } else if (isAnswered) {
                btnClass = 'bg-indigo-600 text-white border-indigo-600 font-semibold';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goToQuestion(idx)}
                  className={`h-10 rounded-lg border text-xs flex items-center justify-center transition relative ${btnClass}`}
                >
                  {idx + 1}
                  {isFlag && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-600" />}
                </button>
              );
            })}
          </div>

          <div className="text-xs space-y-2 border-t border-slate-100 pt-4 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-indigo-600 inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-amber-100 border border-amber-300 inline-block" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-slate-100 border border-slate-200 inline-block" />
              <span>Unanswered</span>
            </div>
          </div>

          {/* Telemetry Proctoring Status */}
          <div className="mt-8 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <div className="font-semibold text-slate-700 mb-1">Integrity Telemetry</div>
            <div>Tab switches detected: <span className="font-bold text-slate-800">{tabSwitches}</span></div>
          </div>
        </div>
      </div>

      {/* Tab Switch Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-slate-200 shadow-xl">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Proctoring Notice</h3>
            <p className="text-xs text-slate-600 mb-6">
              You navigated away or switched windows. This event has been recorded in your evaluation log ({tabSwitches} switches recorded). Repeated switches may invalidate your assessment.
            </p>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Return to Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
