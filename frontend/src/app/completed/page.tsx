'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck, Award } from 'lucide-react';

function CompletedContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  return (
    <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-8 text-center shadow-xs">
      <div className="h-16 w-16 bg-[#84CC16]/20 border border-[#84CC16]/40 text-[#84CC16] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <h1 className="text-2xl font-extrabold text-[#18181B] dark:text-white mb-2">Assessment Submitted</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
        Thank you for completing the technical skill evaluation! Your responses and coding telemetry have been securely transmitted to the hiring team for evaluation.
      </p>

      <div className="p-4 rounded-xl bg-[#F4F4F5] dark:bg-[#27272A] border border-[#E4E4E7] dark:border-[#3F3F46] text-xs text-zinc-600 dark:text-zinc-300 mb-6 text-left space-y-2">
        <div className="flex items-center gap-2 text-[#18181B] dark:text-white font-bold">
          <ShieldCheck className="h-4 w-4 text-[#84CC16]" />
          Verification Status
        </div>
        <div>Session Reference: <span className="font-mono text-[#18181B] dark:text-white">{sessionId ? sessionId.slice(0, 13) + '...' : 'Verified'}</span></div>
        <div>Code Test Cases: <span className="text-[#84CC16] font-bold">Evaluated & Recorded</span></div>
        <div>Telemetry Status: <span className="text-[#84CC16] font-bold">Synced with Hiring Team</span></div>
      </div>

      <div className="space-y-3">
        {/* Electric Lime Primary Return Button */}
        <Link
          href="/student/dashboard"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#84CC16] text-[#18181B] text-xs font-bold hover:bg-[#A3E635] transition shadow-xs"
        >
          Return to My Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/student/status"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:border-[#84CC16] transition"
        >
          View Evaluation Results
        </Link>
      </div>
    </div>
  );
}

export default function CompletedPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm text-zinc-500">Loading confirmation...</div>}>
        <CompletedContent />
      </Suspense>
    </div>
  );
}
