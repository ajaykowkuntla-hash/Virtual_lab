import React, { useState } from 'react';
import { Layout } from '../components/Layout';

export const Submissions: React.FC = () => {
  // Mock Data
  const mockSubmissions = [
    { id: 'SUB-001', student: 'Alice Smith', lab: 'DSP Lab 1', status: 'Pending Review', score: '-', date: 'Oct 14, 2024' },
    { id: 'SUB-002', student: 'Bob Johnson', lab: 'IoT Basics', status: 'Graded', score: '95/100', date: 'Oct 13, 2024' },
    { id: 'SUB-003', student: 'Charlie Davis', lab: 'DSP Lab 1', status: 'Pending Review', score: '-', date: 'Oct 13, 2024' },
    { id: 'SUB-004', student: 'Diana Miller', lab: 'Advanced Routing', status: 'Graded', score: '88/100', date: 'Oct 12, 2024' },
    { id: 'SUB-005', student: 'Ethan Wilson', lab: 'IoT Basics', status: 'Graded', score: '100/100', date: 'Oct 10, 2024' },
  ];

  const [filter, setFilter] = useState('All');

  const filteredSubmissions = filter === 'All' 
    ? mockSubmissions 
    : mockSubmissions.filter(sub => sub.status === filter);

  return (
    <Layout role="faculty">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Submissions
          </h1>
          <p className="font-body-lg text-secondary">Review and grade student lab reports and code.</p>
        </div>
      </header>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-2">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['All', 'Pending Review', 'Graded'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-label-caps text-label-caps transition-colors ${filter === status ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-secondary hover:bg-surface-container-high border border-border-subtle'}`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search students or labs..." 
              className="pl-10 pr-4 py-2 bg-surface-container border border-border-subtle rounded-lg text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-border-subtle">
                <th className="p-4 font-label-caps text-xs text-secondary uppercase tracking-wider">ID</th>
                <th className="p-4 font-label-caps text-xs text-secondary uppercase tracking-wider">Student</th>
                <th className="p-4 font-label-caps text-xs text-secondary uppercase tracking-wider">Lab</th>
                <th className="p-4 font-label-caps text-xs text-secondary uppercase tracking-wider">Date</th>
                <th className="p-4 font-label-caps text-xs text-secondary uppercase tracking-wider">Status</th>
                <th className="p-4 font-label-caps text-xs text-secondary uppercase tracking-wider">Score</th>
                <th className="p-4 font-label-caps text-xs text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub, index) => (
                <tr key={sub.id} className={`border-b border-border-subtle hover:bg-surface-container/50 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-surface-container/20'}`}>
                  <td className="p-4 font-mono-metrics text-sm text-secondary">{sub.id}</td>
                  <td className="p-4 font-body-sm font-semibold text-primary">{sub.student}</td>
                  <td className="p-4 font-body-sm text-primary">{sub.lab}</td>
                  <td className="p-4 font-body-sm text-secondary">{sub.date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === 'Graded' ? 'bg-success-emerald/10 text-success-emerald' : 'bg-warning-amber/10 text-warning-amber'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono-metrics text-sm text-primary">{sub.score}</td>
                  <td className="p-4 text-right">
                    <button className="px-4 py-2 bg-neural-blue/10 text-neural-blue hover:bg-neural-blue hover:text-white transition-colors rounded-lg font-label-caps text-[10px] font-bold uppercase">
                      {sub.status === 'Pending Review' ? 'Grade Now' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-secondary font-body-lg">
                    No submissions found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
