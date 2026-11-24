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
  ShieldCheck,
  Award
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
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-8 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#84CC16] text-xs font-bold mb-2 shadow-xs">
            <MailCheck className="h-3.5 w-3.5" />
            Candidate Assessment Access
          </div>
          <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
            Generate & Manage Candidate Invitations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create signed assessment invite links with pre-assigned role tracks and expiry windows.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Create Invitation Form (Clean White Card) */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] p-8 shadow-xs">
          <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white mb-4">
            Issue New Candidate Assessment Invitation
          </h2>

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Candidate Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Target Role Track
                </label>
                <select
                  value={selectedRoleId}
                  onChange={e => handleRoleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                >
                  <option value="">Any Role (Candidate chooses)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Specific Framework / Stack
                </label>
                <select
                  disabled={!selectedRole || !selectedRole.stacks?.length}
                  value={selectedStackId}
                  onChange={e => setSelectedStackId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                >
                  <option value="">Any Stack (Candidate chooses)</option>
                  {selectedRole?.stacks?.map((st: any) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Link Validity (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={daysValid}
                  onChange={e => setDaysValid(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#27272A] text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
                />
              </div>
            </div>

            {/* Electric Lime Create Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#84CC16] text-[#18181B] font-bold text-xs hover:bg-[#A3E635] transition disabled:opacity-50 shadow-xs"
              >
                <Send className="h-4 w-4" />
                {creating ? 'Generating Signed Token...' : 'Generate Invitation Link'}
              </button>
            </div>
          </form>

          {createdUrl && (
            <div className="mt-6 p-4 rounded-xl bg-[#27272A] border border-[#3F3F46] text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#84CC16] flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[#84CC16]" />
                  Invitation Successfully Generated:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdUrl)}
                  className="text-xs font-bold text-white hover:text-[#84CC16] flex items-center gap-1 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied Link!' : 'Copy Link'}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18181B] font-mono text-xs text-zinc-300 break-all select-all">
                {createdUrl}
              </div>
            </div>
          )}
        </div>

        {/* Existing Invitations Table (Clean White Card) */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E4E4E7] dark:border-[#2E2E33] flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#18181B] dark:text-white">Active Invitations History</h3>
            <span className="text-xs text-zinc-500">{invites.length} Invitations Generated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAFA] dark:bg-[#27272A]/40 border-b border-[#E4E4E7] dark:border-[#2E2E33] text-zinc-500 uppercase font-bold text-[11px]">
                  <th className="px-6 py-3.5">Candidate Email</th>
                  <th className="px-6 py-3.5">Assigned Track</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Expires</th>
                  <th className="px-6 py-3.5 text-right">Invite Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E33] text-zinc-700 dark:text-zinc-300">
                {invites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">
                      No invitations issued yet.
                    </td>
                  </tr>
                ) : (
                  invites.map(inv => {
                    const isUsed = !!inv.used_at;
                    const isExpired = new Date(inv.expires_at) < new Date();
                    const fullInviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?invite=${inv.token}`;

                    return (
                      <tr key={inv.id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40 transition">
                        <td className="px-6 py-4 font-semibold text-[#18181B] dark:text-white">
                          {inv.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold">{inv.role?.name || 'Any Role'}</span>
                          {inv.stack && <span className="text-[#84CC16] font-bold ml-1">({inv.stack.name})</span>}
                        </td>
                        <td className="px-6 py-4">
                          {isUsed ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#84CC16]/15 text-[#84CC16] border border-[#84CC16]/30">
                              Completed
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-medium">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(fullInviteLink)}
                            className="inline-flex items-center gap-1 text-[#84CC16] hover:underline font-bold"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
