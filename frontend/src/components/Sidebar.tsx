'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  LayoutDashboard,
  Code2,
  ClipboardList,
  User,
  LogOut,
  FileText,
  ShieldAlert,
  Sliders,
  MailCheck,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const candStr = localStorage.getItem('candidateInfo');
    const adminStr = localStorage.getItem('adminUser');
    const token = localStorage.getItem('token');

    const currentTheme = localStorage.getItem('theme');
    const prefersDark = currentTheme === 'dark';
    setIsDark(prefersDark);

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

  // Do not show sidebar during live assessment for focused distraction-free UI
  if (pathname.startsWith('/test/')) {
    return null;
  }

  const isAdminPath = pathname.startsWith('/admin');
  const showAdminNav = admin && (isAdminPath || !student);
  const showStudentNav = student && (!isAdminPath || !admin);

  // If user is guest and not on admin / student section, do not show sidebar
  if (!showAdminNav && !showStudentNav) {
    return null;
  }

  const studentLinks = [
    {
      label: 'My Dashboard',
      href: '/student/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/student/dashboard'
    },
    {
      label: 'Take Assessment',
      href: '/select',
      icon: Code2,
      active: pathname === '/select' || pathname === '/consent'
    },
    {
      label: 'Test Status & Reports',
      href: '/student/status',
      icon: ClipboardList,
      active: pathname.startsWith('/student/status')
    },
    {
      label: 'Candidate Profile',
      href: '/student/profile',
      icon: User,
      active: pathname.startsWith('/student/profile')
    }
  ];

  const adminLinks = [
    {
      label: 'Analytics Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard'
    },
    {
      label: 'Candidates & Reports',
      href: '/admin/candidates',
      icon: FileText,
      active: pathname.startsWith('/admin/candidates') || pathname.startsWith('/admin/reports')
    },
    {
      label: 'Question Bank',
      href: '/admin/questions',
      icon: Code2,
      active: pathname.startsWith('/admin/questions')
    },
    {
      label: 'Proctoring Logs',
      href: '/admin/proctoring',
      icon: ShieldAlert,
      active: pathname.startsWith('/admin/proctoring')
    },
    {
      label: 'Test Blueprints',
      href: '/admin/blueprints',
      icon: Sliders,
      active: pathname.startsWith('/admin/blueprints')
    },
    {
      label: 'Invites & Access',
      href: '/admin/invites',
      icon: MailCheck,
      active: pathname.startsWith('/admin/invites')
    }
  ];

  const navLinks = showAdminNav ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Bar for small screens */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#27272A] border-b border-[#3F3F46] text-white sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#84CC16] text-[#18181B] flex items-center justify-center font-black">
            <Award className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">SkillAssessment</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg bg-[#3F3F46] text-zinc-200 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
        />
      )}

      {/* Graphite Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-[#27272A] border-r border-[#3F3F46] text-[#FAFAFA] flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[#3F3F46]">
          <Link
            href={showAdminNav ? '/admin/dashboard' : '/student/dashboard'}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-[#84CC16] text-[#18181B] flex items-center justify-center font-black shadow-sm group-hover:bg-[#A3E635] transition">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-tight text-base leading-tight">
                SkillAssessment
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#84CC16] uppercase tracking-wider mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16] animate-pulse" />
                {showAdminNav ? 'Recruiter Admin' : 'Candidate Portal'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items with Lime-Green Active Indicator */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {showAdminNav ? 'Administration' : 'Assessment Space'}
          </div>

          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = link.active;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#84CC16] text-[#18181B] font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-[#3F3F46]/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-[#18181B]' : 'text-zinc-400 group-hover:text-[#84CC16]'
                    } transition-colors`}
                  />
                  <span>{link.label}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#18181B]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section: Profile Summary, Theme Toggle & Logout */}
        <div className="p-4 border-t border-[#3F3F46] space-y-3 bg-[#18181B]/40">
          {/* User Profile Snippet */}
          {showStudentNav && student && (
            <Link
              href="/student/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#3F3F46]/60 transition border border-transparent hover:border-[#3F3F46]"
            >
              <div className="h-9 w-9 rounded-xl bg-[#84CC16] text-[#18181B] font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                {student.name ? student.name[0].toUpperCase() : 'S'}
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="font-bold text-xs text-white truncate">{student.name}</span>
                <span className="text-[10px] text-[#84CC16] font-medium truncate">Candidate Profile</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          )}

          {showAdminNav && admin && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#18181B] border border-[#3F3F46]">
              <div className="h-8 w-8 rounded-lg bg-[#3F3F46] text-[#84CC16] font-bold flex items-center justify-center text-xs">
                A
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="font-semibold text-xs text-zinc-200 truncate">{admin.email}</span>
                <span className="text-[10px] text-[#84CC16] font-bold uppercase">{admin.role || 'ADMIN'}</span>
              </div>
            </div>
          )}

          {/* Theme Toggle & Sign Out Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#3F3F46] hover:bg-[#52525B] text-xs font-semibold text-zinc-200 transition"
              title={isDark ? 'Switch to Clean Light Theme' : 'Switch to Graphite Dark Theme'}
            >
              {isDark ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-[#84CC16]" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-zinc-200" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={showAdminNav ? handleAdminLogout : handleStudentLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#18181B] border border-[#3F3F46] text-xs font-semibold text-zinc-300 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/60 transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
