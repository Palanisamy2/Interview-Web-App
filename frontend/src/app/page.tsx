import Link from 'next/link';
import { ArrowRight, Code2, Cpu, CheckCircle2, ShieldAlert, LineChart, Terminal, Timer } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
          <Terminal className="h-3.5 w-3.5" />
          Technical Skill Assessment Platform 2.0
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Role-Based Technical Evaluations with <span className="text-indigo-600">Deep Coding Telemetry</span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          Evaluate candidates through randomized blueprints, multi-format questions, live Monaco code execution, and data-driven sector scoring (Strong, Medium, Low) with alternative role recommendations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
          >
            Start Candidate Assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition shadow-xs"
          >
            Open Recruiter Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="w-full max-w-6xl px-6 py-12 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">In-Browser Code Sandbox</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Monaco code editor with real-time test case execution for bug-fix and algorithmic questions. Evaluates visible unit tests instantly and verifies hidden edge cases on submit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Timer className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Thinking & Typing Telemetry</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measures candidate time-to-first-keystroke (reading/thinking phase), active typing duration, pause intervals, code churn, backspaces, and debug iteration progression.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <LineChart className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Sector Scoring & Role-Fit</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Classifies Frontend, Backend, Database, Debugging, and Fundamentals into Strong, Medium, or Low tiers, providing automated verdicts and alternative role suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Stages */}
      <section className="w-full max-w-5xl px-6 py-12 mb-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Candidate Journey & Assessment Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 1</div>
            <h4 className="font-semibold text-slate-800 mb-1">Registration or Token</h4>
            <p className="text-xs text-slate-500">Direct registration or verified invite link</p>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 2</div>
            <h4 className="font-semibold text-slate-800 mb-1">Role & Stack Selection</h4>
            <p className="text-xs text-slate-500">Pick target stack (React, Node.js, etc.)</p>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 3</div>
            <h4 className="font-semibold text-slate-800 mb-1">Timed Test Session</h4>
            <p className="text-xs text-slate-500">MCQs, output predictions & code bugfixes</p>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 bg-white">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 4</div>
            <h4 className="font-semibold text-slate-800 mb-1">Automated Evaluation</h4>
            <p className="text-xs text-slate-500">Sector analytics, tiers & recruiter report</p>
          </div>
        </div>
      </section>
    </div>
  );
}

