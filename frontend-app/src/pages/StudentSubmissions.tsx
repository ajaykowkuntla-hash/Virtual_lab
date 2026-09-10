import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

export const StudentSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/lab/student/submissions');
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleAction = (sub: any) => {
    alert(`Script:\n\n${sub.script_text}\n\nFaculty Remarks: ${sub.faculty_remarks || 'None'}`);
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = sub.experiment_title?.toLowerCase().includes(q);
    const matchesType = sub.lab_type?.toLowerCase().includes(q);
    const matchesStatus = sub.status?.toLowerCase().includes(q);
    return matchesTitle || matchesType || matchesStatus;
  });

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="student">
      <header className="fade-in-up stagger-1 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-semibold text-primary tracking-tight leading-none mb-4">
            My Submissions & Drafts
          </h1>
          <p className="font-body-lg text-secondary">View and manage your saved work and past assignments.</p>
        </div>
        <div className="relative fade-in-up stagger-2">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments..." 
            className="pl-10 pr-4 py-2 bg-surface-container border border-border-subtle rounded-xl text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-full md:w-64"
          />
        </div>
      </header>

      <div className="glass-panel rounded-2xl p-8 border border-white/60 shadow-xl fade-in-up stagger-3">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">folder_off</span>
            <h3 className="text-h3 font-semibold text-primary mb-2">No Submissions Found</h3>
            <p>You haven't saved any drafts or submitted any experiments matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary">Experiment</th>
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary">Lab</th>
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary">Type</th>
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary">Date</th>
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary">Status</th>
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary">Grade</th>
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary">Remarks</th>
                  <th className="py-4 px-4 font-label-caps text-label-caps font-bold text-secondary text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-primary">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-border-subtle hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4 font-semibold">{sub.experiment_title}</td>
                    <td className="py-4 px-4 text-secondary">{sub.lab_name}</td>
                    <td className="py-4 px-4">
                      {sub.lab_type ? (
                        <span className="px-2 py-1 bg-surface-container-high rounded-md text-xs font-mono-metrics uppercase">{sub.lab_type}</span>
                      ) : (
                        <span className="text-secondary">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-secondary">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        sub.status === 'GRADED' ? 'bg-success-emerald/10 text-success-emerald' :
                        'bg-neural-blue/10 text-neural-blue'
                      }`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {sub.numeric_grade !== null ? <span className="font-mono-metrics font-bold">{sub.numeric_grade}</span> : <span className="text-secondary italic">Not Graded</span>}
                    </td>
                    <td className="py-4 px-4 text-secondary text-sm">
                      {sub.faculty_remarks ? sub.faculty_remarks : '-'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleAction(sub)}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors border border-border-subtle text-secondary hover:bg-surface-container-high"
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};
