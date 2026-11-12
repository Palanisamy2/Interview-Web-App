'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

function CompletedContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  return (
    <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
      <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Assessment Submitted</h1>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Thank you for completing the technical skill evaluation! Your responses and coding telemetry have been securely transmitted to the hiring team for evaluation.
      </p>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-6 text-left space-y-2">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Verification Status
        </div>
        <div>Session Reference: <span className="font-mono text-slate-900">{sessionId ? sessionId.slice(0, 13) + '...' : 'Verified'}</span></div>
        <div>Code Test Cases: <span className="text-emerald-700 font-medium">Evaluated & Recorded</span></div>
        <div>Telemetry Status: <span className="text-indigo-700 font-medium">Synced with Hiring Team</span></div>
      </div>

      <div className="space-y-3">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          Return to Homepage
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/admin/dashboard"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
        >
          Go to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function CompletedPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading confirmation...</div>}>
        <CompletedContent />
      </Suspense>
    </div>
  );
}
