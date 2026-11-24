import Link from 'next/link';
import { ArrowRight, Code2, Cpu, CheckCircle2, ShieldCheck, LineChart, Terminal, Timer, Layers, Zap, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] transition-colors duration-150 min-h-screen">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 pt-20 pb-16 flex flex-col items-center text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-6 shadow-xs">
          <Zap className="h-3.5 w-3.5 fill-[#84CC16]" />
          Technical Skill Assessment Platform 2.0
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#18181B] dark:text-white tracking-tight max-w-3xl leading-tight">
          Role-Based Technical Evaluations with <span className="text-[#84CC16]">Deep Coding Telemetry</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
          Evaluate candidates through randomized blueprints, multi-format challenges, live code execution, and data-driven sector scoring with alternative role recommendations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
          {/* Electric Lime Primary CTA Button */}
          <Link
            href="/register"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#84CC16] text-[#18181B] font-bold hover:bg-[#A3E635] transition shadow-sm text-sm"
          >
            Candidate / Student Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#1E1E22] text-[#18181B] dark:text-zinc-200 font-bold hover:border-[#84CC16] transition shadow-xs text-sm"
          >
            Recruiter & Admin Portal
          </Link>
        </div>
      </section>

      {/* Feature Highlights (Clean White Dashboard Cards) */}
      <section className="w-full max-w-6xl px-6 py-12 border-t border-[#E4E4E7] dark:border-[#2E2E33]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs hover:border-[#84CC16] transition">
            <div className="h-10 w-10 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center mb-4 font-bold shadow-xs">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-[#18181B] dark:text-white text-lg mb-2">In-Browser Code Sandbox</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              In-browser code editor with real-time test case execution for bug-fix and algorithmic questions. Evaluates visible unit tests instantly and verifies hidden edge cases on submit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs hover:border-[#84CC16] transition">
            <div className="h-10 w-10 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center mb-4 font-bold shadow-xs">
              <Timer className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-[#18181B] dark:text-white text-lg mb-2">Thinking & Typing Telemetry</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Measures candidate time-to-first-keystroke (reading/thinking phase), active typing duration, pause intervals, code churn, backspaces, and debug iteration progression.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs hover:border-[#84CC16] transition">
            <div className="h-10 w-10 rounded-xl bg-[#27272A] text-[#84CC16] flex items-center justify-center mb-4 font-bold shadow-xs">
              <LineChart className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-[#18181B] dark:text-white text-lg mb-2">Sector Scoring & Role-Fit</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Classifies Frontend, Backend, Database, Debugging, and Fundamentals into Strong, Medium, or Low tiers, providing automated verdicts and alternative role suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Stack Matrix Preview */}
      <section className="w-full max-w-6xl px-6 py-12 border-t border-[#E4E4E7] dark:border-[#2E2E33]">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-[#18181B] dark:text-white">Supported Engineering Disciplines</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">25 tailor-made framework blueprints with automated test generation</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {[
            { title: 'Frontend', count: '6 Stacks', desc: 'React, Next, Angular, Vue, Svelte, TS' },
            { title: 'Backend', count: '6 Stacks', desc: 'Node, Python, Java, .NET, Go, PHP' },
            { title: 'Full Stack', count: '6 Stacks', desc: 'MERN, MARN, Next+PG, Java, Python, Android' },
            { title: 'Mobile', count: '4 Stacks', desc: 'Kotlin Native, React Native, Flutter, Swift' },
            { title: 'QA & Test', count: '3 Stacks', desc: 'Playwright, Cypress, Selenium' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1E22] border border-[#E4E4E7] dark:border-[#2E2E33] text-left hover:border-[#84CC16] transition">
              <div className="text-[11px] font-extrabold text-[#84CC16] uppercase tracking-wider">{item.title}</div>
              <div className="font-extrabold text-[#18181B] dark:text-white text-sm mt-1">{item.count}</div>
              <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
