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
        <button className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-xl border border-border-subtle hover:bg-surface-container-high transition-colors">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pass Rate Chart Mock */}
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg fade-in-up stagger-5">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">pie_chart</span>
            Lab Pass Rates (Last 4 Labs)
          </h3>
          <div className="h-64 flex items-end justify-around pb-4 border-b border-border-subtle relative mt-8">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-border-subtle w-full h-0"></div>
              <div className="border-b border-border-subtle w-full h-0"></div>
              <div className="border-b border-border-subtle w-full h-0"></div>
              <div className="border-b border-border-subtle w-full h-0"></div>
            </div>
            
            {/* Bars */}
            <div className="flex flex-col items-center gap-2 z-10 w-16">
              <div className="w-full bg-neural-blue/80 rounded-t-lg h-[80%] shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
              <span className="text-xs font-mono-metrics text-secondary mt-2">Lab 1</span>
            </div>
            <div className="flex flex-col items-center gap-2 z-10 w-16">
              <div className="w-full bg-success-emerald/80 rounded-t-lg h-[92%] shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
              <span className="text-xs font-mono-metrics text-secondary mt-2">Lab 2</span>
            </div>
            <div className="flex flex-col items-center gap-2 z-10 w-16">
              <div className="w-full bg-neural-pink/80 rounded-t-lg h-[45%] shadow-[0_0_15px_rgba(236,72,153,0.3)]"></div>
              <span className="text-xs font-mono-metrics text-secondary mt-2">Lab 3</span>
            </div>
            <div className="flex flex-col items-center gap-2 z-10 w-16">
              <div className="w-full bg-neural-purple/80 rounded-t-lg h-[78%] shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
              <span className="text-xs font-mono-metrics text-secondary mt-2">Lab 4</span>
            </div>
          </div>
        </div>

        {/* Top Performers Mock */}
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg fade-in-up stagger-6">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">military_tech</span>
            Top Performing Students
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-surface-container/50 rounded-2xl border border-border-subtle hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    #{idx}
                  </div>
                  <div>
                    <h4 className="font-body-md font-semibold text-primary">Student 00{idx}</h4>
                    <p className="text-xs text-secondary">A+ Average</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success-emerald font-mono-metrics text-sm">98%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
