import React from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';

export const Analytics: React.FC = () => {
  return (
    <Layout role="faculty">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Analytics Overview
          </h1>
          <p className="font-body-lg text-secondary">Class performance metrics and lab completion rates.</p>
        </div>
        <button onClick={() => alert('Generating CSV export of class analytics...')} className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-xl border border-border-subtle hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span className="font-label-caps text-label-caps text-primary">Export Data</span>
        </button>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="group"
          iconColor="text-neural-blue"
          value="92%"
          label="Overall Pass Rate"
          staggerIndex={2}
        />
        <StatCard
          icon="timer"
          iconColor="text-neural-pink"
          value="45m"
          label="Avg. Completion Time"
          staggerIndex={3}
        />
        <StatCard
          icon="trending_up"
          iconColor="text-success-emerald"
          value="+12%"
          label="Engagement Score"
          staggerIndex={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-panel p-12 rounded-3xl border border-white/60 shadow-lg fade-in-up stagger-5 text-center">
          <span className="material-symbols-outlined text-[48px] text-secondary mb-4 opacity-50">query_stats</span>
          <h3 className="font-h3 text-primary mb-2">Historical Data Unavailable</h3>
          <p className="text-secondary font-body-md max-w-md mx-auto">
            Not enough verified historical data is available to generate lab pass rates and top performer charts. This dashboard will populate as students complete their labs.
          </p>
        </div>
      </div>
    </Layout>
  );
};
