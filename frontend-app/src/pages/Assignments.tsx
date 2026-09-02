import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

interface Experiment {
  id: string;
  title: string;
  description: string;
  lab_id: number;
}

interface Submission {
  id: number;
  experiment_id: string;
  status: string;
  submitted_at: string;
  numeric_grade: number | null;
  faculty_remarks: string | null;
}

export const Assignments: React.FC = () => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, subRes] = await Promise.all([
          apiClient.get('/lab/experiments'),
          apiClient.get('/lab/student/submissions')
        ]);
        setExperiments(expRes.data);
        setSubmissions(subRes.data);
      } catch (error) {
        console.error("Failed to load assignments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatus = (expId: string) => {
    const sub = submissions.find(s => s.experiment_id === expId);
    if (!sub) return 'Pending';
    return sub.status;
  };

  const pending = experiments.filter(e => getStatus(e.id) === 'Pending');
  // Submissions with PENDING_REVIEW or anything else that is not completely graded (though verified/rejected might be considered done)
  const inProgress = experiments.filter(e => getStatus(e.id) === 'PENDING_REVIEW');
  const completed = experiments.filter(e => ['verified', 'rejected'].includes(getStatus(e.id)));

  return (
    <Layout role="student">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Assignments
        </h1>
        <p className="font-body-lg text-secondary">Track your upcoming lab reports and course homework.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in-up stagger-2">
        {/* Pending Column */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-lg h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning-amber animate-pulse"></span>
            To Do
          </h3>
          <div className="space-y-4">
            {pending.map(task => (
              <div key={task.id} className="bg-surface-container p-4 rounded-2xl border border-border-subtle shadow-sm hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/virtual-lab/${task.id}`)}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono-metrics font-bold text-secondary">{task.id}</span>
                  <span className="px-2 py-1 rounded bg-neural-blue/10 text-neural-blue text-[10px] font-bold uppercase tracking-wider">Lab</span>
                </div>
                <h4 className="font-body-md font-semibold text-primary mb-1">{task.title}</h4>
                <p className="text-xs text-secondary mb-4">{task.description}</p>
                <div className="flex items-center gap-1 text-warning-amber text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">timer</span>
                  Action Required
                </div>
              </div>
            ))}
            {pending.length === 0 && !isLoading && (
              <p className="text-sm text-secondary">No pending assignments.</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-lg h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-neural-blue animate-pulse"></span>
            In Progress
          </h3>
          <div className="space-y-4">
            {inProgress.map(task => {
              const sub = submissions.find(s => s.experiment_id === task.id);
              return (
                <div key={task.id} className="bg-surface-container p-4 rounded-2xl border border-border-subtle shadow-sm hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/virtual-lab/${task.id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono-metrics font-bold text-secondary">{task.id}</span>
                    <span className="px-2 py-1 rounded bg-neural-blue/10 text-neural-blue text-[10px] font-bold uppercase tracking-wider">Submitted</span>
                  </div>
                  <h4 className="font-body-md font-semibold text-primary mb-1">{task.title}</h4>
                  <p className="text-xs text-secondary mb-4">{task.description}</p>
                  <div className="flex justify-between items-center text-xs text-secondary">
                    <span className="text-neural-blue font-semibold">Pending Faculty Review</span>
                    <span>{new Date(sub?.submitted_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
            {inProgress.length === 0 && !isLoading && (
              <p className="text-sm text-secondary">No assignments pending review.</p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-lg opacity-75 h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success-emerald"></span>
            Completed
          </h3>
          <div className="space-y-4">
            {completed.map(task => {
              const sub = submissions.find(s => s.experiment_id === task.id);
              const isVerified = sub?.status === 'verified';
              return (
                <div key={task.id} className="bg-surface-container/50 p-4 rounded-2xl border border-border-subtle shadow-sm cursor-pointer hover:bg-surface-container transition-colors" onClick={() => navigate(`/virtual-lab/${task.id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono-metrics font-bold text-secondary">{task.id}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isVerified ? 'bg-success-emerald/10 text-success-emerald' : 'bg-error/10 text-error'}`}>
                      {isVerified ? 'Verified' : 'Rejected'}
                    </span>
                  </div>
                  <h4 className="font-body-md font-semibold text-primary/70 mb-1">{task.title}</h4>
                  <div className="mt-3 text-sm">
                    {sub?.numeric_grade !== null && <div className="font-bold">Grade: <span className={isVerified ? 'text-success-emerald' : 'text-error'}>{sub?.numeric_grade}/100</span></div>}
                  </div>
                </div>
              );
            })}
            {completed.length === 0 && !isLoading && (
              <p className="text-sm text-secondary">No completed assignments.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
