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
  Save,
  ShieldCheck
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
      if (delta < 2000) {
        activeTypingMsRef.current += delta;
      }
    }
    lastKeyTimeRef.current = now;
  };

  // Autosave function
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
      <div className="min-h-screen flex items-center justify-center bg-[#27272A] text-white">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm text-zinc-300">Synchronizing assessment sandbox...</span>
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] transition-colors duration-150">
      
      {/* Test Control Bar - Graphite Background with Electric Lime Accents */}
      <div className="h-14 bg-[#27272A] border-b border-[#3F3F46] px-6 flex items-center justify-between sticky top-16 z-30 shadow-sm text-white">
        <div className="flex items-center gap-4">
          {/* Interview Timer in Electric Lime */}
          <div className="flex items-center gap-2 bg-[#18181B] border border-[#3F3F46] text-[#84CC16] px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm shadow-inner">
            <Clock className={`h-4 w-4 ${remainingSec < 300 ? 'text-red-400 animate-pulse' : 'text-[#84CC16]'}`} />
            <span className={remainingSec < 300 ? 'text-red-400 font-extrabold' : ''}>
              {formatTimer(remainingSec)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-[#84CC16] animate-pulse" />
            <span>Auto-save active</span>
            {lastSavedTime && <span className="text-zinc-400">({lastSavedTime})</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isFlagged
                ? 'bg-amber-950/40 text-amber-300 border-amber-600'
                : 'text-zinc-300 border-[#3F3F46] hover:bg-[#3F3F46] hover:text-white'
            }`}
          >
            <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isFlagged ? 'Marked for Review' : 'Mark for Review'}
          </button>

          {/* Electric Lime Primary Submit Button */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitTest(false)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#84CC16] text-[#18181B] text-xs font-bold hover:bg-[#A3E635] transition shadow-xs disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-6 gap-6">
        
        {/* Left: Clean White Question Card */}
        <div className="flex-1 flex flex-col bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs p-6 md:p-8">
          
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7] dark:border-[#2E2E33] mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-[#18181B] bg-[#84CC16] px-3 py-1 rounded-lg">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-[#F4F4F5] dark:bg-[#27272A] px-2.5 py-1 rounded-lg border border-[#E4E4E7] dark:border-[#3F3F46]">
                {currentQ.sector?.name || 'Technical Sector'}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                currentQ.difficulty === 'HARD'
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-900/40'
                  : currentQ.difficulty === 'MEDIUM'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200 dark:border-amber-900/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-900/40'
              }`}>
                {currentQ.difficulty} ({currentQ.points} {currentQ.points === 1 ? 'pt' : 'pts'})
              </span>
            </div>
          </div>

          {/* Question Title & Prompt */}
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-[#18181B] dark:text-white mb-3">{currentQ.title}</h2>
            <div className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
              {currentQ.body}
            </div>
          </div>

          {/* Interactive Answer Area According to Type */}
          <div className="flex-1 flex flex-col">
            {/* 1. Single / Multi MCQ */}
            {(currentQ.type === 'MCQ_SINGLE' || currentQ.type === 'MCQ_MULTI') && (
              <div className="space-y-3 mt-4">
                {currentQ.type === 'MCQ_MULTI' && (
                  <p className="text-xs font-bold text-[#84CC16] uppercase tracking-wider mb-2">
                    * Multiple Choice (Select all applicable answers)
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
                          ? 'border-[#84CC16] bg-[#84CC16]/10 dark:bg-[#84CC16]/15 ring-1 ring-[#84CC16]'
                          : 'border-[#E4E4E7] dark:border-[#2E2E33] hover:border-zinc-400 hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/50'
                      }`}
                    >
                      <input
                        type={isMulti ? 'checkbox' : 'radio'}
                        name={`question_${currentQ.id}`}
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 text-[#84CC16] focus:ring-[#84CC16] rounded border-zinc-300 accent-[#84CC16]"
                      />
                      <div className="flex-1 text-sm text-[#18181B] dark:text-zinc-200">
                        <span className="font-extrabold mr-2 text-[#84CC16]">{opt.label}.</span>
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
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Enter Expected Terminal Output:
                </label>
                <input
                  type="text"
                  value={currentAnswer.textAnswer || ''}
                  onKeyDown={handleKeyDown}
                  onChange={e => handleTextAnswerChange(e.target.value)}
                  placeholder="e.g. 1 4 3 2"
                  className="w-full p-3.5 font-mono text-sm rounded-xl border border-[#E4E4E7] dark:border-[#2E2E33] bg-[#FAFAFA] dark:bg-[#27272A] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                />
              </div>
            )}

            {/* 3. Bug-Fix Code Question with Live Execution */}
            {currentQ.type === 'BUGFIX' && (
              <div className="mt-4 flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-[#84CC16]" />
                    Code Sandbox ({currentQ.bugfixSpec?.language || 'JavaScript'})
                  </span>

                  {/* Electric Lime Run Code Button */}
                  <button
                    type="button"
                    disabled={runningCode}
                    onClick={handleRunCode}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#84CC16] text-[#18181B] text-xs font-bold hover:bg-[#A3E635] transition disabled:opacity-50 shadow-xs"
                  >
                    <Play className="h-3.5 w-3.5 fill-[#18181B]" />
                    {runningCode ? 'Evaluating Test Cases...' : 'Run Code'}
                  </button>
                </div>

                {/* Graphite Code Textarea with Telemetry Listeners */}
                <textarea
                  value={currentAnswer.codeAnswer || ''}
                  onKeyDown={handleKeyDown}
                  onChange={e => handleCodeAnswerChange(e.target.value)}
                  onBlur={handleCodeBlur}
                  rows={11}
                  spellCheck={false}
                  placeholder="// Implement bug-fix solution here..."
                  className="w-full p-4 font-mono text-sm bg-[#27272A] text-[#FAFAFA] rounded-xl border border-[#3F3F46] focus:outline-none focus:ring-2 focus:ring-[#84CC16] leading-relaxed resize-y shadow-inner"
                />

                {/* Test Results Display */}
                {runResults && (
                  <div className="p-4 rounded-xl border border-[#E4E4E7] dark:border-[#2E2E33] bg-[#FAFAFA] dark:bg-[#18181B] mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Visible Test Case Results:
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                        runResults.allPassed 
                          ? 'bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]/40' 
                          : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                      }`}>
                        Passed {runResults.passedCount} / {runResults.totalTests} tests
                      </span>
                    </div>

                    <div className="space-y-2">
                      {runResults.testResults?.map((t: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white dark:bg-[#27272A] rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#18181B] dark:text-white">Test Case #{t.testIndex}</span>
                            {t.passed ? (
                              <span className="text-[#84CC16] font-bold flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Passed
                              </span>
                            ) : (
                              <span className="text-red-500 font-bold flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5" /> Failed
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-zinc-600 dark:text-zinc-400 space-y-0.5">
                            <div>Input: <span className="text-[#18181B] dark:text-zinc-200">{t.input}</span></div>
                            <div>Expected: <span className="text-[#18181B] dark:text-zinc-200">{t.expected}</span></div>
                            <div>Actual: <span className={t.passed ? 'text-[#84CC16] font-bold' : 'text-red-500 font-bold'}>{t.actual}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E4E4E7] dark:border-[#2E2E33] mt-8">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:border-[#84CC16] hover:text-[#84CC16] transition disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => goToQuestion(currentIndex + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#84CC16] text-[#18181B] text-xs font-bold hover:bg-[#A3E635] transition disabled:opacity-30 shadow-xs"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Question Navigation Palette Card */}
        <div className="w-full md:w-80 bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs p-6 flex flex-col h-fit">
          <h3 className="font-bold text-[#18181B] dark:text-white text-sm mb-4">Question Overview</h3>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isAnswered =
                (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                (ans?.textAnswer && ans.textAnswer.trim().length > 0) ||
                (ans?.codeAnswer && ans.codeAnswer.trim().length > 0 && ans.codeAnswer !== q.bugfixSpec?.starterCode);
              const isFlag = !!flagged[q.id];
              const isCurrent = currentIndex === idx;

              let btnClass = 'border-[#E4E4E7] dark:border-[#3F3F46] bg-[#F4F4F5] dark:bg-[#27272A] text-zinc-700 dark:text-zinc-300 hover:bg-[#E4E4E7]';
              if (isCurrent) {
                btnClass = 'ring-2 ring-[#84CC16] border-[#84CC16] bg-[#27272A] text-[#84CC16] font-black shadow-xs';
              } else if (isFlag) {
                btnClass = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 font-semibold';
              } else if (isAnswered) {
                btnClass = 'bg-[#84CC16] text-[#18181B] border-[#84CC16] font-bold shadow-xs';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goToQuestion(idx)}
                  className={`h-10 rounded-xl border text-xs flex items-center justify-center transition relative ${btnClass}`}
                >
                  {idx + 1}
                  {isFlag && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />}
                </button>
              );
            })}
          </div>

          <div className="text-xs space-y-2 border-t border-[#E4E4E7] dark:border-[#2E2E33] pt-4 text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-[#84CC16] inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-amber-100 border border-amber-300 inline-block" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-[#F4F4F5] dark:bg-[#27272A] border border-[#E4E4E7] dark:border-[#3F3F46] inline-block" />
              <span>Unanswered</span>
            </div>
          </div>

          {/* Integrity Proctoring Status Card */}
          <div className="mt-8 p-3.5 rounded-xl bg-[#F4F4F5] dark:bg-[#27272A] border border-[#E4E4E7] dark:border-[#3F3F46] text-xs text-zinc-600 dark:text-zinc-400">
            <div className="font-bold text-[#18181B] dark:text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#84CC16]" />
              Integrity Telemetry
            </div>
            <div>Tab switches recorded: <span className="font-bold text-[#84CC16]">{tabSwitches}</span></div>
          </div>
        </div>
      </div>

      {/* Tab Switch Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl max-w-sm w-full p-6 text-center border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xl text-[#18181B] dark:text-white">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Proctoring Notice</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
              You navigated away or switched windows. This event has been recorded in your evaluation log ({tabSwitches} switches recorded). Repeated switches may invalidate your assessment.
            </p>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 px-4 bg-[#84CC16] text-[#18181B] rounded-xl text-xs font-bold hover:bg-[#A3E635] transition shadow-xs"
            >
              Return to Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
