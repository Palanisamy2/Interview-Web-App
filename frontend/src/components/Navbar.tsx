'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  ShieldCheck,
  User,
  LayoutDashboard,
  Code2,
  ClipboardList,
  LogOut,
  FileText,
  ShieldAlert,
  Sliders,
  MailCheck,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Check auth & theme state on mount and route changes
  useEffect(() => {
    setMounted(true);
    const candStr = localStorage.getItem('candidateInfo');
    const adminStr = localStorage.getItem('adminUser');
    const token = localStorage.getItem('token');

    // Theme check
    const currentTheme = localStorage.getItem('theme');
    const prefersDark = currentTheme === 'dark' || (!currentTheme && true);
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (candStr) {
      try {
        setStudent(JSON.parse(candStr));
      } catch (e) {
        setStudent(null);
      }
    } else {
      setStudent(null);
    }

    if (adminStr && token) {
      try {
        setAdmin(JSON.parse(adminStr));
      } catch (e) {
        setAdmin(null);
      }
    } else {
      setAdmin(null);
    }
  }, [pathname]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('candidateInfo');
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('presetSelection');
    setStudent(null);
    router.push('/register');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    setAdmin(null);
    router.push('/admin/login');
  };

  const isTakingTest = pathname.startsWith('/test/');
  const isAdminPath = pathname.startsWith('/admin');
  const isStudentPath = pathname.startsWith('/student') || pathname === '/select' || pathname === '/consent';

  // Minimal proctoring header for active test
  if (isTakingTest) {
    return (
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white leading-none">SkillAssessment Pro</h1>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure Proctoring Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            Tab switches & telemetry recorded
          </span>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
    );
  }

  // Determine current active role view
  const showAdminNav = admin && (isAdminPath || !student);
  const showStudentNav = student && (!isAdminPath || !admin);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0B0F19]/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors duration-150">
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Brand Logo */}
        <Link
          href={showAdminNav ? '/admin/dashboard' : showStudentNav ? '/student/dashboard' : '/'}
          className="flex items-center gap-2.5"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base leading-none">
              SkillAssessment
            </span>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider mt-0.5">
              {showAdminNav ? 'Admin Portal' : showStudentNav ? 'Candidate Portal' : 'Platform'}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {/* ADMIN NAVIGATION */}
          {showAdminNav && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/admin/dashboard'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/candidates"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith('/admin/candidates') || pathname.startsWith('/admin/reports')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                Candidates & Reports
              </Link>
              <Link
                href="/admin/questions"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith('/admin/questions')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                Question Bank
              </Link>
              {/* Proctoring & Blueprints & Invites (NO AI SLAP) */}
              <Link
                href="/admin/proctoring"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/proctoring')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Proctoring Logs
              </Link>
              <Link
                href="/admin/blueprints"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/blueprints')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                Blueprints
              </Link>
              <Link
                href="/admin/invites"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/invites')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <MailCheck className="h-3.5 w-3.5" />
                Invites
              </Link>
            </>
          )}

          {/* STUDENT / CANDIDATE NAVIGATION */}
          {showStudentNav && (
            <>
              <Link
                href="/student/dashboard"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/student/dashboard'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                My Home
              </Link>
              <Link
                href="/select"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === '/select' || pathname === '/consent'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="h-4 w-4" />
                Take Test
              </Link>
              <Link
                href="/student/status"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/student/status')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Test Status & Results
              </Link>
              <Link
                href="/student/profile"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/student/profile')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </>
          )}

          {/* GUEST NAVIGATION */}
          {!showAdminNav && !showStudentNav && (
            <>
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                Platform Overview
              </Link>
              <Link
                href="/register"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/register'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                Candidate Portal
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Right Side: Theme Toggle, Account and Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 transition shadow-xs"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600" />
          )}
        </button>

        {/* ADMIN CONTROLS */}
        {showAdminNav && mounted && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{admin.email}</span>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <span className="text-indigo-600 dark:text-cyan-400 font-bold uppercase">{admin.role || 'ADMIN'}</span>
            </div>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900/40 transition"
              title="Sign Out Admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}

        {/* STUDENT CONTROLS */}
        {showStudentNav && mounted && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/student/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-[#161F30] border border-indigo-100 dark:border-slate-800 text-xs hover:bg-indigo-100/70 dark:hover:bg-[#1C273C] transition"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
                {student.name ? student.name[0].toUpperCase() : 'S'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{student.name}</span>
                <span className="text-[10px] text-indigo-700 dark:text-cyan-400 leading-tight">Student</span>
              </div>
            </Link>

            <button
              onClick={handleStudentLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Log Out Student"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        )}

        {/* GUEST CONTROLS */}
        {!showAdminNav && !showStudentNav && (
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/admin/login"
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Admin Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-500/20 transition"
            >
              Student Portal
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
