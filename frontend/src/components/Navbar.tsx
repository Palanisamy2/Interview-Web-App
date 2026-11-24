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
  UserCheck,
  LogOut,
  FileText,
  ShieldAlert,
  Sliders,
  MailCheck,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Check auth state on mount and route changes
  useEffect(() => {
    setMounted(true);
    const candStr = localStorage.getItem('candidateInfo');
    const adminStr = localStorage.getItem('adminUser');
    const token = localStorage.getItem('token');

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
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
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
            Tab switches & telemetry recorded
          </span>
        </div>
      </header>
    );
  }

  // Determine current active role view
  // 1. If currently in admin routes or logged in as admin
  const showAdminNav = admin && (isAdminPath || !student);
  // 2. If student is logged in and not on admin pages
  const showStudentNav = student && (!isAdminPath || !admin);

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Brand Logo */}
        <Link
          href={showAdminNav ? '/admin/dashboard' : showStudentNav ? '/student/dashboard' : '/'}
          className="flex items-center gap-2.5"
        >
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
              SkillAssessment
            </span>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
              {showAdminNav ? 'Admin Portal' : showStudentNav ? 'Candidate Portal' : 'Pro Platform'}
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
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/candidates"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith('/admin/candidates') || pathname.startsWith('/admin/reports')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Candidates & Reports
              </Link>
              <Link
                href="/admin/questions"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith('/admin/questions')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Question Bank
              </Link>
              {/* Trending Admin Modules */}
              <Link
                href="/admin/proctoring"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  pathname.startsWith('/admin/proctoring')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                AI Proctoring
              </Link>
              <Link
                href="/admin/blueprints"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  pathname.startsWith('/admin/blueprints')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                Blueprints
              </Link>
              <Link
                href="/admin/invites"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  pathname.startsWith('/admin/invites')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Home
              </Link>
              <Link
                href="/select"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === '/select' || pathname === '/consent'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Code2 className="h-4 w-4" />
                Take Test
              </Link>
              <Link
                href="/student/status"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/student/status')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Test Status & Results
              </Link>
              <Link
                href="/student/profile"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/student/profile')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Platform Overview
              </Link>
              <Link
                href="/register"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/register'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Candidate Portal
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Right Side: Account and Action Controls */}
      <div className="flex items-center gap-3">
        {/* ADMIN CONTROLS */}
        {showAdminNav && mounted && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">{admin.email}</span>
              <span className="text-slate-400">|</span>
              <span className="text-indigo-600 font-bold uppercase">{admin.role || 'ADMIN'}</span>
            </div>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
              title="Sign Out Admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}

        {/* STUDENT CONTROLS */}
        {showStudentNav && mounted && (
          <div className="flex items-center gap-3">
            <Link
              href="/student/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs hover:bg-indigo-100/70 transition"
            >
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                {student.name ? student.name[0].toUpperCase() : 'S'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-slate-900 leading-tight">{student.name}</span>
                <span className="text-[10px] text-indigo-700 leading-tight">Student</span>
              </div>
            </Link>

            <button
              onClick={handleStudentLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Log Out Student"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        )}

        {/* GUEST CONTROLS */}
        {!showAdminNav && !showStudentNav && (
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/login"
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              Admin Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              Student Portal
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
