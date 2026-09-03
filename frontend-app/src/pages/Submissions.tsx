import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

interface FacultySubmission {
  id: number;
  student_name: string;
  experiment_id: string;
  experiment_title: string;
  lab_name: string;
  status: string;
  submitted_at: string;
  numeric_grade: number | null;
}

export const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<FacultySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Grading Modal State
  const [gradingSubId, setGradingSubId] = useState<number | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await apiClient.get('/lab/faculty/submissions');
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGradeSubmit = async () => {
    if (!gradingSubId) return;
    const grade = parseInt(gradeInput);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert("Grade must be a number between 0 and 100");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post(`/lab/submissions/${gradingSubId}/verify`, {
        status: 'verified',
        numeric_grade: parseInt(gradeInput),
        faculty_remarks: remarksInput
      });
      setGradingSubId(null);
      setGradeInput('');
      setRemarksInput('');
      fetchSubmissions();
    } catch (err) {
      console.error("Failed to submit grade", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'verified') return 'Graded';
    if (status === 'rejected') return 'Rejected';
    if (status === 'PENDING_REVIEW') return 'Pending Review';
    return status;
  };

  const filteredSubmissions = filter === 'All' 
    ? submissions 
    : submissions.filter(sub => getStatusLabel(sub.status) === filter);

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
              {filteredSubmissions.map((sub, index) => {
                const label = getStatusLabel(sub.status);
                const isGraded = label === 'Graded';
                return (
                  <tr key={sub.id} className={`border-b border-border-subtle hover:bg-surface-container/50 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-surface-container/20'}`}>
                    <td className="p-4 font-mono-metrics text-sm text-secondary">SUB-{sub.id}</td>
                    <td className="p-4 font-body-sm font-semibold text-primary">{sub.student_name}</td>
                    <td className="p-4 font-body-sm text-primary">{sub.lab_name} - {sub.experiment_title}</td>
                    <td className="p-4 font-body-sm text-secondary">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isGraded ? 'bg-success-emerald/10 text-success-emerald' : 'bg-warning-amber/10 text-warning-amber'}`}>
                        {label}
                      </span>
                    </td>
                    <td className="p-4 font-mono-metrics text-sm text-primary">{sub.numeric_grade !== null ? `${sub.numeric_grade}/100` : '-'}</td>
                    <td className="p-4 text-right">
                      {!isGraded ? (
                        <button 
                          onClick={() => setGradingSubId(sub.id)}
                          className="px-4 py-2 bg-neural-blue/10 text-neural-blue hover:bg-neural-blue hover:text-white transition-colors rounded-lg font-label-caps text-[10px] font-bold uppercase"
                        >
                          Grade Now
                        </button>
                      ) : (
                        <button 
                          onClick={() => alert('View details not fully implemented yet')}
                          className="px-4 py-2 bg-surface-container text-secondary hover:bg-surface-container-high transition-colors rounded-lg font-label-caps text-[10px] font-bold uppercase border border-border-subtle"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredSubmissions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-secondary font-body-lg">
                    No submissions found for the selected filter.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-secondary font-body-lg">
                    Loading submissions...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Modal */}
      {gradingSubId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl border border-border-subtle mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Grade Submission</h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-secondary mb-1">Numeric Grade (0-100)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={gradeInput}
                onChange={e => setGradeInput(e.target.value)}
                className="w-full bg-surface-container border border-border-subtle rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neural-blue/50"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-secondary mb-1">Remarks</label>
              <textarea 
                value={remarksInput}
                onChange={e => setRemarksInput(e.target.value)}
                className="w-full bg-surface-container border border-border-subtle rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neural-blue/50 resize-none h-24"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setGradingSubId(null)} className="px-4 py-2 rounded-lg text-secondary border border-border-subtle hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleGradeSubmit}
                disabled={isSubmitting || !gradeInput || parseInt(gradeInput) < 0 || parseInt(gradeInput) > 100}
                className="px-4 py-2 rounded-lg bg-neural-blue text-white font-bold hover:bg-neural-blue/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
