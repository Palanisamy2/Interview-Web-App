'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Code,
  Server,
  Layers,
  Smartphone,
  CheckSquare,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Search,
  Sparkles,
  Clock,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface Stack {
  id: number;
  code: string;
  name: string;
  roleId: number;
  isActive?: boolean;
}

interface Role {
  id: number;
  code: string;
  name: string;
  stacks?: Stack[];
}

export default function SelectRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedStackId, setSelectedStackId] = useState<number | null>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const candStr = localStorage.getItem('candidateInfo');
    if (!candStr) {
      router.push('/register');
      return;
    }
    setCandidate(JSON.parse(candStr));

    api.getRoles()
      .then((data: Role[]) => {
        setRoles(data);
        // Check if preset
        const presetStr = localStorage.getItem('presetSelection');
        if (presetStr) {
          const preset = JSON.parse(presetStr);
          if (preset.roleId) setSelectedRoleId(preset.roleId);
          if (preset.stackId) setSelectedStackId(preset.stackId);
        } else if (data.length > 0) {
          setSelectedRoleId(data[0].id);
          if (data[0].stacks && data[0].stacks.length > 0) {
            setSelectedStackId(data[0].stacks[0].id);
          }
        }
      })
      .catch((err: any) => setError(err.message || 'Failed to load roles'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRoleId(role.id);
    setSearchQuery('');
    if (role.stacks && role.stacks.length > 0) {
      setSelectedStackId(role.stacks[0].id);
    } else {
      setSelectedStackId(null);
    }
  };

  const handleProceed = async () => {
    if (!selectedRoleId || !selectedStackId || !candidate) return;
    setError('');
    setCreating(true);

    try {
      const session = await api.createSession({
        roleId: selectedRoleId,
        stackId: selectedStackId,
        candidateId: candidate.id
      });

      router.push(`/consent?sessionId=${session.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create test session');
      setCreating(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Filter stacks by search
  const filteredStacks = useMemo(() => {
    if (!selectedRole || !selectedRole.stacks) return [];
    if (!searchQuery.trim()) return selectedRole.stacks;
    const query = searchQuery.toLowerCase();
    return selectedRole.stacks.filter(st =>
      st.name.toLowerCase().includes(query) || st.code.toLowerCase().includes(query)
    );
  }, [selectedRole, searchQuery]);

  const selectedStack = selectedRole?.stacks?.find(s => s.id === selectedStackId);

  // Helpers for role badge & icon
  const getRoleIcon = (code: string) => {
    switch (code) {
      case 'frontend':
        return Code;
      case 'backend':
        return Server;
      case 'fullstack':
        return Layers;
      case 'mobile':
        return Smartphone;
      case 'qa':
        return CheckSquare;
      default:
        return Terminal;
    }
  };

  const getRoleDescription = (code: string) => {
    switch (code) {
      case 'frontend':
        return 'UI architecture, rendering engines, state management & DOM performance.';
      case 'backend':
        return 'APIs, concurrency, asynchronous pipelines, databases & system design.';
      case 'fullstack':
        return 'End-to-end web architectures, full client-server integration & data layers.';
      case 'mobile':
        return 'Mobile native application lifecycles, memory optimization & reactive UIs.';
      case 'qa':
        return 'Automated testing frameworks, end-to-end integration & regression suites.';
      default:
        return 'Core engineering principles and specialized framework evaluations.';
    }
  };

  const getStackPills = (stackName: string) => {
    const lower = stackName.toLowerCase();
    if (lower.includes('react')) return ['React 18', 'JSX / TSX'];
    if (lower.includes('next')) return ['Next.js App Router', 'RSC / SSR'];
    if (lower.includes('angular')) return ['Angular', 'TypeScript / RxJS'];
    if (lower.includes('vue')) return ['Vue 3', 'Composition API'];
    if (lower.includes('svelte')) return ['SvelteKit', 'Reactivity'];
    if (lower.includes('typescript')) return ['Strict Typing', 'Generics'];
    if (lower.includes('node')) return ['Node.js', 'Express / Nest'];
    if (lower.includes('python')) return ['FastAPI / Django', 'AsyncIO'];
    if (lower.includes('java full')) return ['Spring Boot', 'React / Angular'];
    if (lower.includes('java')) return ['Spring Boot', 'JVM'];
    if (lower.includes('dotnet') || lower.includes('.net')) return ['C#', 'ASP.NET Core'];
    if (lower.includes('go')) return ['Go (Golang)', 'Goroutines'];
    if (lower.includes('php')) return ['PHP', 'Laravel'];
    if (lower.includes('mern')) return ['MongoDB', 'Express', 'React', 'Node'];
    if (lower.includes('mean') || lower.includes('marn')) return ['Node.js', 'Angular / React'];
    if (lower.includes('android full')) return ['Android Kotlin', 'REST / GraphQL'];
    if (lower.includes('android')) return ['Kotlin Native', 'Jetpack Compose'];
    if (lower.includes('flutter')) return ['Flutter', 'Dart'];
    if (lower.includes('ios')) return ['Swift', 'SwiftUI'];
    if (lower.includes('playwright')) return ['Playwright', 'End-to-End'];
    if (lower.includes('cypress')) return ['Cypress', 'Component & E2E'];
    if (lower.includes('selenium')) return ['Selenium WebDriver', 'Automation'];
    return ['Framework', 'Modern'];
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading assessment frameworks and stacks...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Step Indicator & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Step 2 of 4 • Customized Assessment Setup
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your Target Role & Tech Stack
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
            Blueprints, questions, and coding challenges will be generated specifically for your selected role, frameworks, and programming languages.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Target Role Selection */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Choose Target Discipline
            </h2>
            <span className="text-xs text-slate-500">
              {roles.length} Disciplines Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {roles.map(role => {
              const isSelected = selectedRoleId === role.id;
              const Icon = getRoleIcon(role.code);

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-indigo-600 fill-indigo-100" />
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {role.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{role.stacks ? role.stacks.length : 0} Stacks</span>
                    <span className={isSelected ? 'text-indigo-600 font-semibold' : ''}>
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRole && (
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-700">{selectedRole.name}:</span>
              <span>{getRoleDescription(selectedRole.code)}</span>
            </div>
          )}
        </div>

        {/* 2. Primary Stack Selection */}
        {selectedRole && selectedRole.stacks && selectedRole.stacks.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Choose Specific Framework / Language Stack
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your primary framework or language dialect for this evaluation.
                </p>
              </div>

              {/* Search / Filter Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter frameworks..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                />
              </div>
            </div>

            {filteredStacks.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-white text-slate-500 text-xs">
                No stacks matching "{searchQuery}" found in {selectedRole.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredStacks.map(stack => {
                  const isSelected = selectedStackId === stack.id;
                  const pills = getStackPills(stack.name);

                  return (
                    <button
                      key={stack.id}
                      type="button"
                      onClick={() => setSelectedStackId(stack.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-indigo-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Verified Blueprint
                          </span>
                          {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>

                        <div className="font-bold text-sm leading-snug">
                          {stack.name}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100/20 flex flex-wrap gap-1.5">
                        {pills.map((pill, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                              isSelected
                                ? 'bg-indigo-700/80 text-indigo-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Selection Confirmation Bar */}
        {selectedRole && selectedStack && (
          <div className="mb-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                  Configured Test Session
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedRole.name} • <span className="text-indigo-700">{selectedStack.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                45 Minutes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-slate-400" />
                Interactive Runner
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-3 py-2 rounded-lg hover:bg-slate-100"
          >
            ← Back to Registration
          </button>

          <button
            type="button"
            disabled={!selectedRoleId || !selectedStackId || creating}
            onClick={handleProceed}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 shadow-sm"
          >
            {creating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Personalized Test...
              </>
            ) : (
              <>
                Confirm & Proceed to Instructions
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
