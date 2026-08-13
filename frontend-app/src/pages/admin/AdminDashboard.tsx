import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { StatCard } from '../../components/StatCard';
import { apiClient } from '../../api/client';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/admin/analytics');
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
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Admin Dashboard
        </h1>
        <p className="font-body-lg text-secondary">Institution overview and aggregate statistics.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in-up stagger-2">
          <StatCard
            label="Total Students"
            value={stats.total_students}
            icon="school"
            iconColor="text-neural-blue"
            staggerIndex={2}
          />
          <StatCard
            label="Total Faculty"
            value={stats.total_faculty}
            icon="supervisor_account"
            iconColor="text-neural-pink"
            staggerIndex={3}
          />
          <StatCard
            label="Active Labs"
            value={stats.total_labs}
            icon="science"
            iconColor="text-success-emerald"
            staggerIndex={4}
          />
          <StatCard
            label="Total Submissions"
            value={stats.total_submissions}
            icon="assignment_turned_in"
            iconColor="text-neural-purple"
            staggerIndex={5}
          />
        </div>
      ) : null}
      
      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
          </div>
          <div>
            <h3 className="font-body-lg font-bold text-primary">System Status</h3>
            <p className="text-secondary text-sm">All backend services are running normally.</p>
          </div>
        </div>
        
        <p className="text-secondary mb-4">
          Welcome to the Institution Administration Portal. Use the sidebar to manage faculty accounts, student accounts, and laboratory assignments.
        </p>
      </div>
    </Layout>
  );
};
