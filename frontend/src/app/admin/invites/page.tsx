'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  MailCheck,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function AdminInvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [selectedStackId, setSelectedStackId] = useState<number | ''>('');
  const [daysValid, setDaysValid] = useState('7');
  const [creating, setCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    Promise.all([api.listInvitations(), api.getRoles()])
      .then(([invitesData, rolesData]) => {
        setInvites(invitesData || []);
        setRoles(rolesData || []);
      })
      .catch(err => setError(err.message || 'Failed to load invites'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [router]);

  const handleRoleChange = (roleIdStr: string) => {
    const rId = roleIdStr ? parseInt(roleIdStr, 10) : '';
    setSelectedRoleId(rId);
    setSelectedStackId('');
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setCreatedUrl('');
    setCreating(true);

    try {
      const res = await api.createInvitation({
        email: email.trim(),
        roleId: selectedRoleId || undefined,
        stackId: selectedStackId || undefined,
        daysValid: parseInt(daysValid, 10) || 7
      });

      const fullUrl = `${window.location.origin}${res.inviteUrl}`;
      setCreatedUrl(fullUrl);
      setEmail('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors duration-150">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-2 shadow-xs">
            <MailCheck className="h-3.5 w-3.5" />
            Candidate Assessment Access
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assessment Invites & Candidate Pipeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate secure single-use test invitation tokens with preset roles and stacks.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2 shadow-xs">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Invitation Form */}
        <div className="bg-white dark:bg-[#161F30] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Create Candidate Invitation</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Send personalized assessment links with preselected engineering blueprints.</p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Candidate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1422] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-cyan-500/20 focus:border-indigo-600 dark:focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Preset Discipline</label>
                <select
                  value={selectedRoleId}
                  onChange={e => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1422] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-cyan-500/20"
                >
                  <option value="">(Optional - Candidate chooses)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Preset Stack</label>
                <select
                  value={selectedStackId}
                  disabled={!selectedRole || !selectedRole.stacks?.length}
                  onChange={e => setSelectedStackId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1422] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-cyan-500/20 disabled:bg-slate-50 dark:disabled:bg-[#0e1422]/50 disabled:text-slate-400 dark:disabled:text-slate-600"
                >
                  <option value="">(Optional - Candidate chooses)</option>
                  {selectedRole?.stacks?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Valid For (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={daysValid}
                  onChange={e => setDaysValid(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1422] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-cyan-500/20 focus:border-indigo-600 dark:focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs transition disabled:opacity-50 shadow-md shadow-indigo-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              {creating ? 'Generating Token...' : 'Generate Invite Link'}
            </button>
          </form>

          {createdUrl && (
            <div className="mt-5 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="truncate w-full sm:w-auto">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-cyan-400 uppercase block">Generated Assessment Link:</span>
                <span className="text-xs font-mono text-slate-800 dark:text-slate-200 break-all">{createdUrl}</span>
              </div>
              <button
                onClick={() => copyToClipboard(createdUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold shrink-0 shadow-xs transition"
              >
                {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>

        {/* Invitations Table */}
        <div className="bg-white dark:bg-[#161F30] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active & Past Invitations</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">{invites.length} total invitations</span>
          </div>

          {invites.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              No candidate invitations generated yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {invites.map(inv => {
                const isUsed = !!inv.usedAt;
                const isExpired = new Date(inv.expiresAt) < new Date();
                const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?token=${inv.token}`;

                return (
                  <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-[#1C273C]/50 transition">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{inv.candidateEmail}</span>
                        {isUsed ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            Used
                          </span>
                        ) : isExpired ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60">
                            Expired
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-cyan-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-800/60">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                        <span>Role: {inv.role?.name || 'Any'}</span>
                        <span>•</span>
                        <span>Stack: {inv.stack?.name || 'Any'}</span>
                        <span>•</span>
                        <span>Expires: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => copyToClipboard(inviteUrl)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-cyan-400 transition"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy URL
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
