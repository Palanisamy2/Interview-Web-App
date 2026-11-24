'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck, Clock, Terminal, AlertTriangle, CheckSquare, ArrowRight, Eye, Award } from 'lucide-react';

function ConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || '';

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartTest = async () => {
    if (!sessionId || !agreed) return;
    setError('');
    setLoading(true);

    try {
      await api.startSession(sessionId);
      router.push(`/test/${sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start test session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-3 shadow-xs">
          <Award className="h-3.5 w-3.5" /> Step 3 of 4: Assessment Verification
        </span>
        <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white mt-1">
          Assessment Rules & Proctoring Consent
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Please review the test parameters and platform integrity policy before starting.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Clean White Dashboard Card */}
      <div className="space-y-6 bg-[#FFFFFF] dark:bg-[#1E1E22] p-8 rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs mb-8">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#18181B] dark:text-white text-base">Server-Enforced 45-Minute Timer</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              You will have exactly 45 minutes to complete all questions. The timer is tracked strictly on the server. If the timer runs out, your current responses will be auto-submitted automatically.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center shrink-0">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#18181B] dark:text-white text-base">Coding Sandbox & Telemetry</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              For coding and bug-fix sections, an in-browser code sandbox is provided with "Run Code" capability against visible test cases. The platform evaluates keystroke activity, thinking time before first edit, and test iteration progression to assess your problem-solving process.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#18181B] dark:text-white text-base">Anti-Cheating & Integrity Monitoring</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              Switching tabs, minimizing the window, or copying/pasting external blocks of code is tracked and recorded in the audit log. Please remain on the assessment screen throughout the duration.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[#E4E4E7] dark:border-[#2E2E33] bg-[#FFFFFF] dark:bg-[#1E1E22] mb-8 flex items-start gap-3">
        <input
          type="checkbox"
          id="consentCheck"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-zinc-300 text-[#84CC16] focus:ring-[#84CC16] cursor-pointer accent-[#84CC16]"
        />
        <label htmlFor="consentCheck" className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
          I confirm that I will complete this assessment independently without unauthorized assistance, and I consent to telemetry timing, code run tracking, and browser event logging.
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/select')}
          className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[#18181B] dark:hover:text-white"
        >
          ← Back to Selection
        </button>

        {/* Electric Lime Primary Button */}
        <button
          type="button"
          disabled={!agreed || loading || !sessionId}
          onClick={handleStartTest}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-sm hover:bg-[#A3E635] transition disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Starting Exam...' : 'Begin Assessment Now'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-12 text-sm text-zinc-500">Loading assessment parameters...</div>}>
      <ConsentContent />
    </Suspense>
  );
}
