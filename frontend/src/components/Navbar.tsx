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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const candStr = localStorage.getItem('candidateInfo');
    const adminStr = localStorage.getItem('adminUser');
    const token = localStorage.getItem('token');

    const currentTheme = localStorage.getItem('theme');
    const prefersDark = currentTheme === 'dark';
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
  const showAdminNav = admin && (isAdminPath || !student);
  const showStudentNav = student && (!isAdminPath || !admin);

  // When student or admin is logged in and not taking a test, navigation is handled by the Graphite Sidebar
  if (!isTakingTest && (showAdminNav || showStudentNav)) {
    return null;
  }

  // Live test header
  if (isTakingTest) {
    return (
      <header className="h-16 bg-[#27272A] border-b border-[#3F3F46] text-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#84CC16] text-[#18181B] flex items-center justify-center font-black shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-none">SkillAssessment Pro</h1>
            <span className="text-[11px] text-[#84CC16] font-semibold flex items-center gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16] animate-pulse" />
              Proctoring Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-300">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#84CC16]" />
            Integrity Monitored
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#3F3F46] transition"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-[#84CC16]" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-[#27272A] border-b border-[#3F3F46] text-white sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-colors duration-150">
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Brand Logo with Electric Lime Accent */}
        <Link
          href={showAdminNav ? '/admin/dashboard' : showStudentNav ? '/student/dashboard' : '/'}
          className="flex items-center gap-2.5 group"
        >
          <div className="h-9 w-9 rounded-xl bg-[#84CC16] text-[#18181B] flex items-center justify-center font-black shadow-sm group-hover:bg-[#A3E635] transition">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-tight text-base leading-none">
              SkillAssessment
            </span>
            <span className="text-[10px] font-bold text-[#84CC16] uppercase tracking-wider mt-0.5">
              {showAdminNav ? 'Admin Portal' : showStudentNav ? 'Candidate Portal' : 'Assessment Platform'}
            </span>
          </div>
        </Link>

        {/* Navigation Links with Lime-Green Active Indicator */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {/* ADMIN NAVIGATION */}
          {showAdminNav && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === '/admin/dashboard'
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <Link
                href="/admin/candidates"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/candidates') || pathname.startsWith('/admin/reports')
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Candidates & Reports
              </Link>
              <Link
                href="/admin/questions"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/questions')
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Question Bank
              </Link>
              <Link
                href="/admin/proctoring"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/proctoring')
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Proctoring Logs
              </Link>
              <Link
                href="/admin/blueprints"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/blueprints')
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                Blueprints
              </Link>
              <Link
                href="/admin/invites"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin/invites')
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
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
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === '/student/dashboard'
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                My Dashboard
              </Link>
              <Link
                href="/select"
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === '/select' || pathname === '/consent'
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Take Test
              </Link>
              <Link
                href="/student/status"
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/student/status')
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Test Status & Results
              </Link>
              <Link
                href="/student/profile"
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/student/profile')
                    ? 'bg-[#3F3F46] text-[#84CC16] shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                <User className="h-3.5 w-3.5" />
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
                    ? 'bg-[#3F3F46] text-[#84CC16]'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                Platform Overview
              </Link>
              <Link
                href="/register"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/register'
                    ? 'bg-[#3F3F46] text-[#84CC16]'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/60'
                }`}
              >
                Candidate Portal
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Right Side: Theme Toggle, User Badges & Logout */}
      <div className="flex items-center gap-2.5">
        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-300 hover:text-white bg-[#3F3F46] hover:bg-[#52525B] transition shadow-xs"
          title={isDark ? 'Switch to Clean Light Theme' : 'Switch to Graphite Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-[#84CC16]" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-200" />
          )}
        </button>

        {/* ADMIN CONTROLS */}
        {showAdminNav && mounted && (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#3F3F46] text-xs">
              <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
              <span className="font-semibold text-zinc-200">{admin.email}</span>
              <span className="text-zinc-500">|</span>
              <span className="text-[#84CC16] font-bold uppercase">{admin.role || 'ADMIN'}</span>
            </div>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#18181B] border border-[#3F3F46] text-zinc-300 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/60 transition"
              title="Sign Out Admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}

        {/* STUDENT CONTROLS */}
        {showStudentNav && mounted && (
          <div className="flex items-center gap-2.5">
            <Link
              href="/student/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#3F3F46] text-xs hover:border-[#84CC16] transition"
            >
              <div className="h-6 w-6 rounded-full bg-[#84CC16] text-[#18181B] font-black flex items-center justify-center text-[11px]">
                {student.name ? student.name[0].toUpperCase() : 'S'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-white leading-tight">{student.name}</span>
                <span className="text-[10px] text-[#84CC16] leading-tight">Candidate</span>
              </div>
            </Link>

            <button
              onClick={handleStudentLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#18181B] border border-[#3F3F46] text-zinc-300 hover:bg-[#3F3F46] hover:text-white transition"
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
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#18181B] border border-[#3F3F46] text-zinc-200 hover:bg-[#3F3F46] transition"
            >
              Admin Portal
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#84CC16] text-[#18181B] hover:bg-[#65A30D] hover:text-white transition shadow-sm"
            >
              Candidate Portal
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
