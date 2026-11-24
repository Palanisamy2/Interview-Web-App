import Link from 'next/link';
import { ArrowRight, Code2, Cpu, CheckCircle2, ShieldCheck, LineChart, Terminal, Timer, Layers } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 pt-20 pb-16 flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient background glow for dark mode */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-500/10 via-cyan-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-6 shadow-xs">
          <Terminal className="h-3.5 w-3.5" />
          Technical Skill Assessment Platform 2.0
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl leading-tight">
          Role-Based Technical Evaluations with <span className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Deep Coding Telemetry</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Evaluate candidates through randomized blueprints, multi-format questions, live Monaco code execution, and data-driven sector scoring with alternative role recommendations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold hover:from-indigo-500 hover:to-cyan-500 transition shadow-lg shadow-indigo-500/25 text-sm"
          >
            Candidate / Student Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161F30] text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-[#1C273C] transition shadow-xs text-sm"
          >
            Recruiter & Admin Portal
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="w-full max-w-6xl px-6 py-12 border-t border-slate-200 dark:border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">In-Browser Code Sandbox</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Monaco code editor with real-time test case execution for bug-fix and algorithmic questions. Evaluates visible unit tests instantly and verifies hidden edge cases on submit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Timer className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Thinking & Typing Telemetry</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Measures candidate time-to-first-keystroke (reading/thinking phase), active typing duration, pause intervals, code churn, backspaces, and debug iteration progression.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <LineChart className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Sector Scoring & Role-Fit</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Classifies Frontend, Backend, Database, Debugging, and Fundamentals into Strong, Medium, or Low tiers, providing automated verdicts and alternative role suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Stack Matrix Preview */}
      <section className="w-full max-w-6xl px-6 py-12 border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supported Engineering Disciplines</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">25 tailor-made framework blueprints with automated test generation</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {[
            { title: 'Frontend', count: '6 Stacks', desc: 'React, Next, Angular, Vue, Svelte, TS' },
            { title: 'Backend', count: '6 Stacks', desc: 'Node, Python, Java, .NET, Go, PHP' },
            { title: 'Full Stack', count: '6 Stacks', desc: 'MERN, MARN, Next+PG, Java, Python, Android' },
            { title: 'Mobile', count: '4 Stacks', desc: 'Kotlin Native, React Native, Flutter, Swift' },
            { title: 'QA & Test', count: '3 Stacks', desc: 'Playwright, Cypress, Selenium' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 text-left">
              <div className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">{item.title}</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-1">{item.count}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
