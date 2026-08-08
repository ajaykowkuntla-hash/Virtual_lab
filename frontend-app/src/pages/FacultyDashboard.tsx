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
  const [isLoading, setIsLoading] = useState(true);
  const [isExperimentModalOpen, setIsExperimentModalOpen] = useState(false);

  const handleVerify = async (submissionId: number, status: 'verified' | 'rejected') => {
    try {
      await apiClient.post(`/lab/submissions/${submissionId}/verify`, { status });
      setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status } : s));
    } catch (error) {
      console.error("Failed to verify submission", error);
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await apiClient.get('/lab/submissions/exp_1_dsp');
        setSubmissions(response.data);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <Layout role="faculty">
      {/* Header section */}
      <header className="fade-in-up stagger-1">
        <h1 className="text-[56px] font-semibold text-primary tracking-tight leading-none mb-4">
          Welcome back, {user?.username || user?.id || 'Dr. Vance'}.
        </h1>
        <div className="flex items-center gap-4">
          <p className="font-body-lg text-secondary">Fall Semester 2024 • Engineering Thermodynamics</p>
          <span className="h-4 w-[1px] bg-border-subtle"></span>
          <button className="text-neural-blue font-label-caps text-label-caps flex items-center gap-1 hover:underline">
            Faculty Controls <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Summary Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="science"
          iconColor="text-neural-blue"
          value="12"
          label="Total Labs Created"
          badge={<span className="font-mono-metrics text-mono-metrics text-secondary">2 Active</span>}
          staggerIndex={2}
        />
        <StatCard
          icon="fact_check"
          iconColor="text-neural-pink"
          value={submissions.filter(s => s.status === 'unverified' || !s.status).length.toString()}
          label="Pending Submissions"
          badge={
            <span className="flex items-center gap-1 text-[10px] font-mono-metrics bg-surface-container px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-neural-pink animate-pulse"></span> NEEDS REVIEW
            </span>
          }
          staggerIndex={3}
        />
        <StatCard
          icon="groups"
          iconColor="text-success-emerald"
          value="89%"
          label="Class Attendance"
          staggerIndex={4}
        />
        <StatCard
          icon="bar_chart"
          iconColor="text-neural-purple"
          value="B+"
          label="Class Average"
          staggerIndex={5}
        />
      </div>

      {/* Asymmetrical Grid: Main Focus Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative group fade-in-up stagger-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-neural-blue to-neural-purple rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-panel rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border border-white/60">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-neural-blue/10 rounded-full font-mono-metrics text-mono-metrics text-neural-blue">LIVE SESSION</span>
                  <span className="px-2 py-1 bg-surface-container-high rounded-full font-mono-metrics text-mono-metrics text-secondary">exp_1_dsp</span>
                </div>
                <h3 className="text-h3 font-semibold text-primary">Thermodynamic Cycles: Rankine</h3>
                <p className="font-body-md text-secondary max-w-md">24 out of 30 students are currently connected. 18 are in the data collection phase.</p>
              </div>
              <button className="shrink-0 flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-black/10">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span className="font-label-caps text-label-caps font-bold">Monitor Session</span>
              </button>
            </div>
          </div>

          {/* Performance Visualizer */}
          <div className="glass-panel rounded-3xl p-8 shadow-lg shadow-black/5 flex flex-col gap-6 fade-in-up stagger-7">
            <div className="flex items-center justify-between">
              <h4 className="font-label-caps text-label-caps text-primary">Class Performance Trend</h4>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-[16px]">show_chart</span>
                </button>
              </div>
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

        {/* Right Sidebar: Schedule & Activity */}
        <div className="space-y-8">
          <div className="glass-panel rounded-3xl p-6 shadow-lg shadow-black/5 flex flex-col gap-6 fade-in-up stagger-8">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h4 className="font-label-caps text-label-caps text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span> Upcoming Sessions
              </h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-border-subtle hover:bg-white/40 transition-colors">
                <div className="w-12 h-12 flex flex-col items-center justify-center bg-surface-container-low rounded-xl">
                  <span className="text-[10px] font-bold text-secondary uppercase">Oct</span>
                  <span className="text-body-lg font-bold text-primary">12</span>
                </div>
                <div className="flex-1">
                  <h5 className="text-body-md font-semibold text-primary">Fluid Mechanics Lab</h5>
                  <p className="text-[12px] text-secondary">10:00 AM - 12:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
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

      {/* Recent Activity Timeline */}
      <section className="space-y-8 fade-in-up stagger-9">
        <h4 className="font-label-caps text-label-caps text-primary flex items-center gap-2 uppercase tracking-widest border-b border-border-subtle pb-4">
          <span className="material-symbols-outlined text-[18px]">history</span> Live Lab Submissions (exp_1_dsp)
        </h4>
        <div className="space-y-6 pl-2">
          {isLoading ? (
            <div className="p-4 text-secondary">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-4 text-secondary">No submissions yet for this experiment.</div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="relative pl-8 border-l border-border-subtle pb-4">
                <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-background ${sub.status === 'verified' ? 'bg-success-emerald' : sub.status === 'failed' ? 'bg-error' : 'bg-neural-blue'}`}></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h5 className="font-body-md font-semibold text-primary">Student {sub.user_id} submitted run</h5>
                  <span className="font-mono-metrics text-mono-metrics text-secondary">
                    {new Date(sub.submitted_at).toLocaleString()}
                  </span>
                </div>
                <div className="glass-panel p-5 rounded-2xl mt-4 border-l-4 border-neural-blue max-w-2xl overflow-hidden">
                  <p className="text-on-surface-variant font-mono-metrics text-xs whitespace-pre-wrap">{sub.output || 'No output'}</p>
                </div>
                {sub.status === 'unverified' && (
                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={() => handleVerify(sub.id, 'verified')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success-emerald text-white font-label-caps text-label-caps hover:bg-success-emerald/90 transition-colors shadow-md"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span> Approve
                    </button>
                    <button 
                      onClick={() => handleVerify(sub.id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error text-white font-label-caps text-label-caps hover:bg-error/90 transition-colors shadow-md"
                    >
                      <span className="material-symbols-outlined text-[16px]">cancel</span> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
      <CreateExperimentModal 
        isOpen={isExperimentModalOpen} 
        onClose={() => setIsExperimentModalOpen(false)} 
        onSuccess={() => {}} 
      />
    </Layout>
  );
};
