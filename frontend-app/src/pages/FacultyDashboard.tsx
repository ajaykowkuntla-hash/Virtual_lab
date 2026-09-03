import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreateExperimentModal } from '../components/CreateExperimentModal';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    assigned_labs: 0,
    assigned_students: 0,
    pending_submissions: 0,
    upcoming_events: 0,
    recent_activity_count: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExperimentModalOpen, setIsExperimentModalOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get('/faculty/analytics');
      setAnalytics(res.data);
    } catch (error) {
      console.error("Failed to fetch faculty analytics", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/lab/faculty/submissions');
      setSubmissions(response.data);
    } catch (error) {
      console.error("Failed to fetch submissions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchAnalytics();
  }, []);

  return (
    <Layout role="faculty">
      <header className="fade-in-up stagger-1">
        <h1 className="text-[56px] font-semibold text-primary tracking-tight leading-none mb-4">
          Welcome back, {user?.name || user?.username || 'Dr. Vance'}.
        </h1>
        <div className="flex items-center gap-4">
          <p className="font-body-lg text-secondary">Fall Semester 2026 • ECE Department</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="science"
          iconColor="text-neural-blue"
          value={analytics.assigned_labs.toString()}
          label="Assigned Labs"
          badge={<span className="font-mono-metrics text-mono-metrics text-secondary">Active</span>}
          staggerIndex={2}
        />
        <StatCard
          icon="groups"
          iconColor="text-success-emerald"
          value={analytics.assigned_students.toString()}
          label="Assigned Students"
          staggerIndex={3}
        />
        <StatCard
          icon="fact_check"
          iconColor="text-neural-pink"
          value={analytics.pending_submissions.toString()}
          label="Pending Submissions"
          badge={
            <span className="flex items-center gap-1 text-[10px] font-mono-metrics bg-surface-container px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-neural-pink animate-pulse"></span> REVIEW REQUIRED
            </span>
          }
          staggerIndex={4}
        />
        <StatCard
          icon="calendar_month"
          iconColor="text-neural-purple"
          value={analytics.upcoming_events.toString()}
          label="Upcoming Events"
          staggerIndex={5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative group fade-in-up stagger-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-neural-blue to-neural-purple rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-panel rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border border-white/60">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-neural-blue/10 rounded-full font-mono-metrics text-mono-metrics text-neural-blue">LIVE SESSION</span>
                  <span className="px-2 py-1 bg-surface-container-high rounded-full font-mono-metrics text-mono-metrics text-secondary">all_labs</span>
                </div>
                <h3 className="text-h3 font-semibold text-primary">Active Experiments</h3>
                <p className="font-body-md text-secondary max-w-md">Experiments are actively available for online compilation, grading, and automated verification.</p>
              </div>
              <button 
                onClick={() => navigate('/submissions')}
                className="shrink-0 flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-black/10"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span className="font-label-caps text-label-caps font-bold">Monitor Submissions</span>
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 shadow-lg shadow-black/5 flex flex-col gap-6 fade-in-up stagger-7">
            <div className="flex items-center justify-between">
              <h4 className="font-label-caps text-label-caps text-primary">Class Performance Trend</h4>
            </div>
            <div className="h-56 bg-white/40 rounded-2xl border border-white/60 relative overflow-hidden flex items-end justify-between px-8 pb-4">
              <div className="w-8 bg-surface-container-high rounded-full h-[40%]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[60%]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[30%]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[85%]"></div>
              <div className="w-8 bg-neural-blue/80 rounded-full h-[75%] shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[70%]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[50%]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[90%]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[65%]"></div>
              <div className="w-8 bg-surface-container-high rounded-full h-[80%]"></div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel rounded-3xl p-6 shadow-lg shadow-black/5 flex flex-col gap-6 fade-in-up stagger-8">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h4 className="font-label-caps text-label-caps text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span> Upcoming Sessions
              </h4>
            </div>
            <div className="space-y-4">
              <div className="p-4 text-center text-secondary border border-dashed border-border-subtle rounded-2xl">
                No upcoming sessions
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setIsExperimentModalOpen(true)}
              className="flex flex-col items-center gap-2 p-6 glass-panel rounded-3xl hover:bg-white/50 transition-all text-secondary hover:text-primary border border-white/40"
            >
              <span className="material-symbols-outlined text-[24px]">add_circle</span>
              <span className="font-label-caps text-[10px] uppercase">New Lab</span>
            </button>
            <button 
              onClick={() => navigate('/analytics')}
              className="flex flex-col items-center gap-2 p-6 glass-panel rounded-3xl hover:bg-white/50 transition-all text-secondary hover:text-primary border border-white/40"
            >
              <span className="material-symbols-outlined text-[24px]">download</span>
              <span className="font-label-caps text-[10px] uppercase">Export Marks</span>
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-6 fade-in-up stagger-9 pb-12">
        <h4 className="font-label-caps text-label-caps text-primary flex items-center gap-2 uppercase tracking-widest border-b border-border-subtle pb-4">
          <span className="material-symbols-outlined text-[18px]">table_chart</span> Recent Lab Submissions
        </h4>
        
        <div className="border border-border-subtle rounded-[20px] overflow-hidden shadow-sm bg-card-bg">
          {isLoading ? (
            <div className="p-8 text-center text-secondary font-body-md">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-secondary font-body-md">No submissions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-border-subtle">
                  <tr>
                    <th className="py-4 px-6 font-label-caps text-[10px] uppercase text-secondary font-semibold tracking-wider whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 font-label-caps text-[10px] uppercase text-secondary font-semibold tracking-wider whitespace-nowrap">Student</th>
                    <th className="py-4 px-6 font-label-caps text-[10px] uppercase text-secondary font-semibold tracking-wider whitespace-nowrap">Experiment</th>
                    <th className="py-4 px-6 font-label-caps text-[10px] uppercase text-secondary font-semibold tracking-wider whitespace-nowrap">Submitted</th>
                    <th className="py-4 px-6 font-label-caps text-[10px] uppercase text-secondary font-semibold tracking-wider text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {submissions.slice(0, 5).map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${sub.status === 'verified' ? 'bg-success-emerald' : sub.status === 'rejected' ? 'bg-error' : 'bg-neural-blue'}`}></div>
                          <span className="text-xs font-semibold capitalize text-primary">{sub.status === 'PENDING_REVIEW' ? 'Pending Review' : sub.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className="font-body-md font-semibold text-primary">{sub.student_name}</span>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className="font-body-md text-secondary">{sub.experiment_title}</span>
                      </td>
                      <td className="py-4 px-6 align-middle whitespace-nowrap">
                        <span className="font-mono-metrics text-[11px] text-secondary">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-middle text-right whitespace-nowrap">
                        <button 
                          onClick={() => navigate('/submissions')}
                          className="px-3 py-1.5 rounded-lg border border-border-subtle text-secondary hover:bg-surface-container hover:text-primary font-label-caps text-[10px] transition-colors"
                        >
                          View All
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <CreateExperimentModal 
        isOpen={isExperimentModalOpen} 
        onClose={() => setIsExperimentModalOpen(false)} 
        onSuccess={fetchSubmissions} 
      />
    </Layout>
  );
};
