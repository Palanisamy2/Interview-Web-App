'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck, Clock, Terminal, AlertTriangle, CheckSquare, ArrowRight, Eye } from 'lucide-react';

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
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step 3 of 4</span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Assessment Rules & Proctoring Consent</h1>
        <p className="text-sm text-slate-500 mt-2">
          Please review the test parameters and platform integrity policy before starting.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs mb-8">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Server-Enforced Timer</h3>
            <p className="text-sm text-slate-600 mt-1">
              You will have exactly 45 minutes to complete all questions. The timer is tracked strictly on the server. If the timer runs out, your current responses will be auto-submitted automatically.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Coding Sandbox & Telemetry</h3>
            <p className="text-sm text-slate-600 mt-1">
              For coding and bug-fix sections, an in-browser code editor is provided with "Run" capability against visible test cases. The platform evaluates keystroke activity, thinking time before first edit, and test iteration progression to assess your problem-solving process.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Anti-Cheating & Integrity Monitoring</h3>
            <p className="text-sm text-slate-600 mt-1">
              Switching tabs, minimizing the window, or copying/pasting external blocks of code is tracked and recorded in the recruiter's audit log. Please remain on the assessment screen throughout the duration.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 mb-8 flex items-start gap-3">
        <input
          type="checkbox"
          id="consentCheck"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="consentCheck" className="text-sm text-slate-700 cursor-pointer">
          I confirm that I will complete this assessment independently without unauthorized assistance, and I consent to telemetry timing, code run tracking, and browser event logging.
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/select')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back
        </button>

        <button
          type="button"
          disabled={!agreed || loading || !sessionId}
          onClick={handleStartTest}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
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
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-12 text-sm text-slate-500">Loading assessment parameters...</div>}>
      <ConsentContent />
    </Suspense>
  );
}
