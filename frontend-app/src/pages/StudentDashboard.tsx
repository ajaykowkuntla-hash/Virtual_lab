import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout role="student">
      {/* Header section */}
      <header className="fade-in-up stagger-1">
        <h1 className="text-[56px] font-semibold text-primary tracking-tight leading-none mb-4">Welcome back, {user?.username || user?.id || 'Alex'}.</h1>
        <div className="flex items-center gap-4">
          <p className="font-body-lg text-secondary">Fall Semester 2024 • Engineering Thermodynamics</p>
          <span className="h-4 w-[1px] bg-border-subtle"></span>
          <button className="text-neural-blue font-label-caps text-label-caps flex items-center gap-1 hover:underline">
            Quick Actions <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Summary Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="science"
          iconColor="text-neural-blue"
          value="8/12"
          label="Completed Labs"
          badge={<span className="font-mono-metrics text-mono-metrics text-secondary">8/12</span>}
          staggerIndex={2}
        />
        <StatCard
          icon="assignment_late"
          iconColor="text-neural-pink"
          value="3"
          label="Pending Tasks"
          badge={
            <span className="flex items-center gap-1 text-[10px] font-mono-metrics bg-error-container text-on-error-container px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> DUE SOON
            </span>
          }
          staggerIndex={3}
        />
        <StatCard
          icon="fact_check"
          iconColor="text-success-emerald"
          value="94%"
          label="Attendance"
          staggerIndex={4}
        />
        <StatCard
          icon="star"
          iconColor="text-neural-purple"
          value="A-"
          label="Avg Grade"
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
                  <span className="px-2 py-1 bg-neural-blue/10 rounded-full font-mono-metrics text-mono-metrics text-neural-blue">IN PROGRESS</span>
                  <span className="px-2 py-1 bg-surface-container-high rounded-full font-mono-metrics text-mono-metrics text-secondary">ID: exp_1_dsp</span>
                </div>
                <h3 className="text-h3 font-semibold text-primary">Thermodynamic Cycles: Rankine Simulation</h3>
                <p className="font-body-md text-secondary max-w-md">Last saved 4 hours ago. You have successfully completed the initial parameter setup and are now in the data collection phase.</p>
              </div>
              <button onClick={() => navigate('/lab/exp_1_dsp')} className="shrink-0 flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-black/10">
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span className="font-label-caps text-label-caps font-bold">Resume Lab</span>
              </button>
            </div>
          </div>

          {/* Performance Visualizer */}
          <div className="glass-panel rounded-3xl p-8 shadow-lg shadow-black/5 flex flex-col gap-6 fade-in-up stagger-7">
            <div className="flex items-center justify-between">
              <h4 className="font-label-caps text-label-caps text-primary">Performance Trend (Mock Analytics)</h4>
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
              <div className="w-8 bg-neural-blue/80 rounded-full h-[95%] shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
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
                <span className="material-symbols-outlined text-[18px]">calendar_month</span> Upcoming Schedule
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
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-border-subtle hover:bg-white/40 transition-colors">
                <div className="w-12 h-12 flex flex-col items-center justify-center bg-surface-container-low rounded-xl">
                  <span className="text-[10px] font-bold text-secondary uppercase">Oct</span>
                  <span className="text-body-lg font-bold text-primary">15</span>
                </div>
                <div className="flex-1">
                  <h5 className="text-body-md font-semibold text-primary">Heat Transfer Demo</h5>
                  <p className="text-[12px] text-secondary">02:00 PM - 03:30 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-border-subtle hover:bg-white/40 transition-colors opacity-60">
                <div className="w-12 h-12 flex flex-col items-center justify-center bg-surface-container-low rounded-xl">
                  <span className="text-[10px] font-bold text-secondary uppercase">Oct</span>
                  <span className="text-body-lg font-bold text-primary">18</span>
                </div>
                <div className="flex-1">
                  <h5 className="text-body-md font-semibold text-primary">Materials Midterm</h5>
                  <p className="text-[12px] text-secondary">09:00 AM - 11:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/assignments')} className="flex flex-col items-center gap-2 p-6 glass-panel rounded-3xl hover:bg-white/50 transition-all text-secondary hover:text-primary border border-white/40">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              <span className="font-label-caps text-[10px] uppercase">Upload Report</span>
            </button>
            <button onClick={() => navigate('/timetable')} className="flex flex-col items-center gap-2 p-6 glass-panel rounded-3xl hover:bg-white/50 transition-all text-secondary hover:text-primary border border-white/40">
              <span className="material-symbols-outlined text-[24px]">group</span>
              <span className="font-label-caps text-[10px] uppercase">Join Study</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <section className="space-y-8 fade-in-up stagger-9">
        <h4 className="font-label-caps text-label-caps text-primary flex items-center gap-2 uppercase tracking-widest border-b border-border-subtle pb-4">
          <span className="material-symbols-outlined text-[18px]">history</span> Recent Activity
        </h4>
        <div className="space-y-6 pl-2">
          <div className="relative pl-8 border-l border-border-subtle">
            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-success-emerald ring-4 ring-background"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <h5 className="font-body-md font-semibold text-primary">Experiment Submitted: Kinematics Analysis</h5>
              <span className="font-mono-metrics text-mono-metrics text-secondary">Yesterday, 14:30</span>
            </div>
            <p className="font-body-md text-secondary max-w-3xl">Automated grading complete. Report meets all theoretical requirements and has been archived for grading.</p>
          </div>
          <div className="relative pl-8 border-l border-border-subtle pb-4">
            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-neural-blue ring-4 ring-background"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <h5 className="font-body-md font-semibold text-primary">Feedback Received: Circuit Analysis Lab</h5>
              <span className="font-mono-metrics text-mono-metrics text-secondary">Oct 8, 09:15</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl mt-4 border-l-4 border-neural-blue max-w-2xl">
              <p className="text-on-surface-variant font-body-md italic">"Good methodology, but review your calculation for internal resistance on node C. The KVL approach you took is correct, but check the decimal precision. - Dr. Vance"</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
