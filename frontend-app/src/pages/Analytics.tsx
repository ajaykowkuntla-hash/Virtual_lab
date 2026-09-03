import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { apiClient } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        // We fetch faculty analytics here.
        const response = await apiClient.get('/analytics/faculty');
        setStats(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <Layout role="faculty">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Analytics Overview
          </h1>
          <p className="font-body-lg text-secondary">Class performance metrics and lab completion rates.</p>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error flex items-center gap-3 fade-in-up stagger-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-48 fade-in-up stagger-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8 fade-in-up stagger-2">
            <StatCard
              icon="school"
              iconColor="text-neural-blue"
              value={stats.summary.assigned_students || 0}
              label="Assigned Students"
              staggerIndex={2}
            />
            <StatCard
              icon="science"
              iconColor="text-neural-pink"
              value={stats.summary.assigned_labs || 0}
              label="Assigned Labs"
              staggerIndex={3}
            />
            <StatCard
              icon="assignment"
              iconColor="text-success-emerald"
              value={stats.summary.total_submissions || 0}
              label="Total Submissions"
              staggerIndex={4}
            />
            <StatCard
              icon="grade"
              iconColor="text-warning"
              value={stats.performance.average_grade !== null ? `${stats.performance.average_grade}%` : '-'}
              label="Avg. Grade"
              staggerIndex={5}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 fade-in-up stagger-3">
            {/* Grade Distribution */}
            <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg flex flex-col h-[400px]">
              <h3 className="font-h3 text-primary mb-6">Grade Distribution</h3>
              {stats.grade_distribution && stats.grade_distribution.length > 0 && stats.grade_distribution.some((d: any) => d.count > 0) ? (
                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.grade_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="range" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <span className="material-symbols-outlined text-[48px] text-secondary mb-2">bar_chart</span>
                  <p className="text-secondary font-body-md">No graded submissions available yet.</p>
                </div>
              )}
            </div>

            {/* Submissions Over Time */}
            <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg flex flex-col h-[400px]">
              <h3 className="font-h3 text-primary mb-6">Submissions Over Time</h3>
              {stats.submissions_over_time && stats.submissions_over_time.length > 0 ? (
                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.submissions_over_time}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <span className="material-symbols-outlined text-[48px] text-secondary mb-2">trending_up</span>
                  <p className="text-secondary font-body-md">No historical submission data available.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </Layout>
  );
};
