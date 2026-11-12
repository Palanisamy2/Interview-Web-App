'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, PlusCircle, Upload, CheckCircle, Tag, Code2, AlertCircle } from 'lucide-react';

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
          { label: 'A', text: 'To trigger side-effects like network calls', correct: false },
          { label: 'B', text: 'To cache the result of an expensive calculation between renders', correct: true },
          { label: 'C', text: 'To bind DOM event listeners directly', correct: false },
          { label: 'D', text: 'To replace Redux state stores', correct: false }
        ],
        explanation: 'useMemo returns a memoized value and recomputes only when dependencies change.',
        tags: ['react', 'hooks', 'optimization']
      },
      {
        type: 'BUGFIX',
        sector: 'debugging',
        language: 'javascript',
        difficulty: 'HARD',
        title: 'Fix Array Chunking Helper',
        body: 'The function `chunk(arr, size)` should split an array into groups of length `size`. Fix the implementation.',
        starter_code: 'function chunk(arr, size) {\n  let res = [];\n  // Fix chunking slice step\n  for (let i = 0; i < arr.length; i += 1) {\n    res.push(arr.slice(i, i + size));\n  }\n  return res;\n}',
        tests: [
          { input: '[1, 2, 3, 4], 2', expected: '[[1,2],[3,4]]', hidden: false },
          { input: '[1, 2, 3], 2', expected: '[[1,2],[3]]', hidden: false },
          { input: '[], 3', expected: '[]', hidden: true }
        ]
      }
    ];
    setImportJson(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/dashboard" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank & Blueprint Pool</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage assessment questions, code test cases, and difficulty distributions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-xs"
        >
          <Upload className="h-4 w-4" />
          Bulk JSON Question Import
        </button>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Sector</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Difficulty</th>
                <th className="px-6 py-3">Points</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No questions found. Use Bulk JSON Import to add questions.
                  </td>
                </tr>
              ) : (
                questions.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-3.5 font-mono text-slate-400">#{q.id}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      <div>{q.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {q.tags?.join(', ') || 'general'}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-800">{q.sector?.name || 'Sector'}</span>
                      {q.stack && <div className="text-slate-400">{q.stack.name}</div>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                        {q.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.difficulty === 'HARD'
                          ? 'bg-red-50 text-red-700'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold">{q.points} pt</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Bulk JSON Question Import (Section 6.2 Format)</h3>
              <button
                type="button"
                onClick={loadSampleJson}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                + Fill with Sample Questions
              </button>
            </div>

            {importStatus && (
              <div className={`p-3 rounded-xl mb-4 text-xs ${
                importStatus.startsWith('Success') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
              }`}>
                {importStatus}
              </div>
            )}

            <form onSubmit={handleImport} className="flex-1 flex flex-col space-y-4">
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
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
                  className="w-full flex-1 p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-900 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading || !importJson.trim()}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {importLoading ? 'Importing...' : 'Upload & Validate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

