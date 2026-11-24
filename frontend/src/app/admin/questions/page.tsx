'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, PlusCircle, Upload, CheckCircle, Tag, Code2, AlertCircle, Award } from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await api.listQuestions();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus('');
    setImportLoading(true);

    try {
      const parsed = JSON.parse(importJson);
      const res = await api.importQuestions(parsed);
      setImportStatus(`Success: ${res.message || 'Questions imported'}`);
      setShowImportModal(false);
      setImportJson('');
      loadQuestions();
    } catch (err: any) {
      setImportStatus(`Error: ${err.message || 'Invalid JSON format'}`);
    } finally {
      setImportLoading(false);
    }
  };

  const loadSampleJson = () => {
    const sample = [
      {
        type: 'MCQ_SINGLE',
        sector: 'frontend',
        stack: 'react',
        language: 'javascript',
        difficulty: 'MEDIUM',
        title: 'React useMemo Hook Purpose',
        body: 'What is the primary purpose of the `useMemo` hook in React?',
        options: [
          { label: 'A', text: 'To cache the result of an expensive calculation between renders', correct: true },
          { label: 'B', text: 'To persist values across page reloads in local storage', correct: false },
          { label: 'C', text: 'To trigger side-effects after state mutations', correct: false },
          { label: 'D', text: 'To replace the need for Redux or Zustand state stores', correct: false }
        ],
        points: 2
      }
    ];
    setImportJson(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#121214] text-[#18181B] dark:text-[#FAFAFA] py-8 px-4 sm:px-8 transition-colors duration-150">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link href="/admin/dashboard" className="text-xs text-[#84CC16] font-bold hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Question Bank Repository
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Curate technical challenges, MCQ questions, and bug-fix sandbox problems.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#84CC16] text-[#18181B] rounded-xl text-xs font-bold hover:bg-[#A3E635] transition shadow-xs"
            >
              <Upload className="h-4 w-4" />
              Bulk JSON Import
            </button>
          </div>
        </div>

        {/* Clean White Table Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAFA] dark:bg-[#27272A]/40 border-b border-[#E4E4E7] dark:border-[#2E2E33] text-zinc-500 uppercase font-bold text-[11px]">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Question Title</th>
                  <th className="px-6 py-3.5">Sector</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Points</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#2E2E33] text-zinc-700 dark:text-zinc-300">
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                      No questions found. Use Bulk JSON Import to add questions.
                    </td>
                  </tr>
                ) : (
                  questions.map(q => (
                    <tr key={q.id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40 transition">
                      <td className="px-6 py-4 font-mono text-zinc-400">#{q.id}</td>
                      <td className="px-6 py-4 font-semibold text-[#18181B] dark:text-white">
                        <div>{q.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {q.tags?.join(', ') || 'general'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#18181B] dark:text-zinc-200">{q.sector?.name || 'Sector'}</span>
                        {q.stack && <div className="text-[#84CC16] font-bold">{q.stack.name}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#F4F4F5] dark:bg-[#27272A] border border-[#E4E4E7] dark:border-[#3F3F46] text-zinc-700 dark:text-zinc-300">
                          {q.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          q.difficulty === 'HARD'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 border-red-200'
                            : q.difficulty === 'MEDIUM'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-200'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#18181B] dark:text-white">{q.points} pt</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#84CC16]/15 text-[#84CC16] border border-[#84CC16]/30">
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFFFF] dark:bg-[#1E1E22] rounded-2xl max-w-2xl w-full p-6 border border-[#E4E4E7] dark:border-[#2E2E33] shadow-xl max-h-[90vh] flex flex-col text-[#18181B] dark:text-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#2E2E33] mb-4">
                <h3 className="font-extrabold text-base">Bulk JSON Question Import</h3>
                <button
                  type="button"
                  onClick={loadSampleJson}
                  className="text-xs text-[#84CC16] hover:underline font-bold"
                >
                  + Fill with Sample Questions
                </button>
              </div>

              {importStatus && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                  importStatus.startsWith('Success') ? 'bg-[#84CC16]/20 text-[#84CC16]' : 'bg-red-100 text-red-700'
                }`}>
                  {importStatus}
                </div>
              )}

              <form onSubmit={handleImport} className="flex-1 flex flex-col space-y-4">
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold uppercase mb-1 text-zinc-600 dark:text-zinc-400">
                    Paste JSON Array:
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={importJson}
                    onChange={e => setImportJson(e.target.value)}
                    placeholder={`[
  {
    "type": "MCQ_SINGLE",
    "sector": "frontend",
    "stack": "react",
    "difficulty": "MEDIUM",
    "title": "Question Title",
    "body": "Question text...",
    "options": [
      { "label": "A", "text": "Option A", "correct": true },
      { "label": "B", "text": "Option B", "correct": false }
    ]
  }
]`}
                    className="w-full flex-1 p-3.5 font-mono text-xs rounded-xl border border-[#3F3F46] focus:outline-none focus:ring-2 focus:ring-[#84CC16] bg-[#27272A] text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E4E7] dark:border-[#2E2E33]">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importLoading || !importJson.trim()}
                    className="px-5 py-2.5 bg-[#84CC16] text-[#18181B] rounded-xl text-xs font-bold hover:bg-[#A3E635] transition disabled:opacity-50 shadow-xs"
                  >
                    {importLoading ? 'Importing...' : 'Upload & Validate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
