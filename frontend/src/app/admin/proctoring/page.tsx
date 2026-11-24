'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';

export default function AdminProctoringPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('ALL');

  const loadData = () => {
    setLoading(true);
    api.getProctoringLogs()
      .then(data => {
        setEvents(data.events || []);
        setTelemetry(data.telemetry || []);
      })
      .catch(err => setError(err.message || 'Failed to load proctoring logs'))
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

  const filteredEvents = events.filter(e => {
    const matchSearch =
      !search ||
      (e.session?.candidate?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.session?.candidate?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      e.eventType.toLowerCase().includes(search.toLowerCase());

    const matchType = selectedEventType === 'ALL' || e.eventType === selectedEventType;
    return matchSearch && matchType;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'TAB_SWITCH':
      case 'WINDOW_BLUR':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'PASTE_ATTEMPT':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/60';
      case 'FULLSCREEN_EXIT':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors duration-150">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-2">
              <ShieldAlert className="h-3.5 w-3.5" />
              Automated Integrity & Anti-Cheat Telemetry
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Session Integrity & Proctoring Monitor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time activity logs, tab switch frequency, clipboard telemetry, and typing cadence.
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#1C273C] transition shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stream
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
              <span>Total Logged Incidents</span>
              <Activity className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{events.length}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Audited events recorded</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
              <span>Tab Switches & Focus Loss</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {events.filter(e => e.eventType === 'TAB_SWITCH' || e.eventType === 'WINDOW_BLUR').length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Focus lost during active tests</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
              <span>Clipboard Paste Flags</span>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400">
              {events.filter(e => e.eventType === 'PASTE_ATTEMPT').length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">External code paste triggers</div>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="bg-white dark:bg-[#161F30] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search candidate or email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1422] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-cyan-500/20 focus:border-indigo-600 dark:focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filter Type:</span>
            <select
              value={selectedEventType}
              onChange={e => setSelectedEventType(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1422] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-cyan-500/20"
            >
              <option value="ALL">All Event Types</option>
              <option value="TAB_SWITCH">TAB_SWITCH</option>
              <option value="WINDOW_BLUR">WINDOW_BLUR</option>
              <option value="PASTE_ATTEMPT">PASTE_ATTEMPT</option>
              <option value="FULLSCREEN_EXIT">FULLSCREEN_EXIT</option>
            </select>
          </div>
        </div>

        {/* Audit Events Feed */}
        <div className="bg-white dark:bg-[#161F30] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Security Incident Timeline</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">{filteredEvents.length} records matching</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              No proctoring incidents logged. All candidate sessions clean.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredEvents.map(event => (
                <div key={event.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-[#1C273C]/50 transition">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      <Eye className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getEventBadge(event.eventType)}`}>
                          {event.eventType}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {event.session?.candidate?.name || 'Unknown Candidate'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({event.session?.candidate?.email})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                        <span>Stack: {event.session?.stack?.name || 'General'}</span>
                        <span>•</span>
                        <span>Session: {event.sessionId?.slice(0, 8)}...</span>
                        {event.metadata && typeof event.metadata === 'object' && Object.keys(event.metadata).length > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              meta: {JSON.stringify(event.metadata)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono self-end sm:self-center">
                    {new Date(event.created_at || event.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
