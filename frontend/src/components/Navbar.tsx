'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, ShieldCheck, UserCheck, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isTakingTest = pathname.startsWith('/test/');

  // Don't show full navigation when candidate is in the middle of a live test
  if (isTakingTest) {
    return (
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 leading-none">SkillAssessment Pro</h1>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure Proctoring Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Tab switches & timing monitored
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">SkillAssessment</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/register"
            className={`px-3 py-1.5 rounded-md transition ${
              pathname === '/register' || pathname === '/select'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Take Test
          </Link>
          <Link
            href="/admin/dashboard"
            className={`px-3 py-1.5 rounded-md transition ${
              pathname.startsWith('/admin/dashboard')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Admin Dashboard
          </Link>
          <Link
            href="/admin/candidates"
            className={`px-3 py-1.5 rounded-md transition ${
              pathname.startsWith('/admin/candidates')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Candidates & Reports
          </Link>
          <Link
            href="/admin/questions"
            className={`px-3 py-1.5 rounded-md transition ${
              pathname.startsWith('/admin/questions')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Question Bank
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin ? (
          <Link
            href="/admin/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
          >
            Admin Sign In
          </Link>
        ) : (
          <Link
            href="/register"
            className="text-xs font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
          >
            Start Assessment
          </Link>
        )}
      </div>
    </header>
  );
}

