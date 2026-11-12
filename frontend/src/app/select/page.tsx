'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Code, Server, Layers, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedStackId, setSelectedStackId] = useState<number | null>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const candStr = localStorage.getItem('candidateInfo');
    if (!candStr) {
      router.push('/register');
      return;
    }
    setCandidate(JSON.parse(candStr));

    api.getRoles()
      .then(data => {
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
      .catch(err => setError(err.message || 'Failed to load roles'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleRoleSelect = (role: any) => {
    setSelectedRoleId(role.id);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading roles and stacks...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step 2 of 4</span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Select Role and Primary Stack</h1>
        <p className="text-sm text-slate-500 mt-2">
          Questions and scoring blueprints will be tailored specifically to your chosen combination.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection Cards */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">1. Choose Your Target Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map(role => {
            const isSelected = selectedRoleId === role.id;
            const Icon = role.code === 'frontend' ? Code : role.code === 'backend' ? Server : Layers;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && <CheckCircle className="h-5 w-5 text-indigo-600" />}
                </div>
                <h4 className="font-bold text-slate-900">{role.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates {role.name} core sectors, design patterns, and engineering edge cases.
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stack Selection Cards */}
      {selectedRole && selectedRole.stacks && selectedRole.stacks.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">2. Choose Stack Implementation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedRole.stacks.map((stack: any) => {
              const isSelected = selectedStackId === stack.id;
              return (
                <button
                  key={stack.id}
                  type="button"
                  onClick={() => setSelectedStackId(stack.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm">{stack.name}</div>
                  <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    Active Blueprint
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.push('/register')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Details
        </button>

        <button
          type="button"
          disabled={!selectedRoleId || !selectedStackId || creating}
          onClick={handleProceed}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
        >
          {creating ? 'Preparing Assessment...' : 'Proceed to Instructions'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

