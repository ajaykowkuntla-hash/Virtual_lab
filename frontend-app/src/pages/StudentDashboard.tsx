import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>({
    my_labs_count: 0,
    pending_assignments_count: 0,
    attendance_rate: '0%',
    average_grade: 'N/A',
    recent_grades: [],
    upcoming_events: [],
    experiments: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/lab/student/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load student dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      <header className="fade-in-up stagger-1">
        <h1 className="text-[56px] font-semibold text-primary tracking-tight leading-none mb-4">
          Welcome back, {user?.name || user?.username || 'Alex'}.
        </h1>
        <div className="flex items-center gap-4">
          <p className="font-body-lg text-secondary">Fall Semester 2026 • ECE Department</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="science"
          iconColor="text-neural-blue"
          value={dashboardData.my_labs_count.toString()}
          label="My Labs"
          badge={<span className="font-mono-metrics text-mono-metrics text-secondary">Enrolled</span>}
          staggerIndex={2}
        />
        <StatCard
          icon="assignment_late"
          iconColor="text-neural-pink"
          value={dashboardData.pending_assignments_count.toString()}
          label="Pending Tasks"
          badge={
            dashboardData.pending_assignments_count > 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-mono-metrics bg-error-container text-on-error-container px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> DUE SOON
              </span>
            ) : (
              <span className="text-[10px] font-mono-metrics bg-success-emerald/10 text-success-emerald px-2 py-1 rounded-full">
                COMPLETE
              </span>
            )
          }
          staggerIndex={3}
        />
        <StatCard
          icon="fact_check"
          iconColor="text-success-emerald"
          value={dashboardData.attendance_rate}
          label="Attendance"
          staggerIndex={4}
        />
        <StatCard
          icon="star"
          iconColor="text-neural-purple"
          value={dashboardData.average_grade}
          label="Avg Grade"
          staggerIndex={5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative group fade-in-up stagger-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-neural-blue to-neural-purple rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-panel rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border border-white/60">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-neural-blue/10 rounded-full font-mono-metrics text-mono-metrics text-neural-blue">ASSIGNED LABS</span>
                </div>
                {dashboardData.experiments.length > 0 ? (
                  <div>
                    <h3 className="text-h3 font-semibold text-primary">{dashboardData.experiments[0].title}</h3>
                    <p className="font-body-md text-secondary mt-2">{dashboardData.experiments[0].description}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-h3 font-semibold text-primary">No Active Labs</h3>
                    <p className="font-body-md text-secondary mt-2">You have no active lab experiments assigned at this moment.</p>
                  </div>
                )}
              </div>
              {dashboardData.experiments.length > 0 && (
                <button 
                  onClick={() => navigate(`/lab/${dashboardData.experiments[0].id}`)} 
                  className="shrink-0 flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-black/10"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span className="font-label-caps text-label-caps font-bold">Start Lab</span>
                </button>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 shadow-lg shadow-black/5 flex flex-col gap-6 fade-in-up stagger-7">
            <div className="flex items-center justify-between">
              <h4 className="font-label-caps text-label-caps text-primary">Performance Trend</h4>
            </div>
            <div className="h-56 bg-white/40 rounded-2xl border border-white/60 relative overflow-hidden flex items-center justify-center p-4">
              <p className="text-secondary italic text-sm text-center">Historical data will appear here once sufficient grades are verified.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel rounded-3xl p-6 shadow-lg shadow-black/5 flex flex-col gap-6 fade-in-up stagger-8">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h4 className="font-label-caps text-label-caps text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span> Upcoming Schedule
              </h4>
            </div>
            <div className="space-y-4">
              {dashboardData.upcoming_events.length === 0 ? (
                <div className="text-center py-6 text-xs text-secondary italic">No upcoming events.</div>
              ) : (
                dashboardData.upcoming_events.map((e: any, idx: number) => {
                  const dateParts = e.date.split('-');
                  const monthName = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]))
                    .toLocaleDateString('en-US', { month: 'short' });
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-border-subtle hover:bg-white/40 transition-colors">
                      <div className="w-12 h-12 flex flex-col items-center justify-center bg-surface-container-low rounded-xl">
                        <span className="text-[10px] font-bold text-secondary uppercase">{monthName}</span>
                        <span className="text-body-lg font-bold text-primary">{dateParts[2]}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-body-md font-semibold text-primary">{e.title}</h5>
                        <p className="text-[12px] text-secondary">{e.time} • {e.location}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => navigate('/assignments')} className="flex flex-col items-center gap-2 p-6 glass-panel rounded-3xl hover:bg-white/50 transition-all text-secondary hover:text-primary border border-white/40">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              <span className="font-label-caps text-[10px] uppercase">Upload Report</span>
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-8 fade-in-up stagger-9">
        <h4 className="font-label-caps text-label-caps text-primary flex items-center gap-2 uppercase tracking-widest border-b border-border-subtle pb-4">
          <span className="material-symbols-outlined text-[18px]">history</span> Recent Activity
        </h4>
        <div className="space-y-6 pl-2">
          {dashboardData.recent_grades.length === 0 ? (
            <div className="text-secondary italic text-sm">No recent submissions found.</div>
          ) : (
            dashboardData.recent_grades.map((g: any, idx: number) => (
              <div key={idx} className="relative pl-8 border-l border-border-subtle">
                <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-background ${
                  g.status === 'verified' ? 'bg-success-emerald' : 'bg-neural-blue'
                }`}></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h5 className="font-body-md font-semibold text-primary">Submission for {g.experiment_title}</h5>
                  <span className="font-mono-metrics text-mono-metrics text-secondary">{g.submitted_at}</span>
                </div>
                <p className="font-body-md text-secondary">
                  Submission Status: <span className="font-semibold capitalize text-primary">{g.status}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
};
