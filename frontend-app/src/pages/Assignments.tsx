import React from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export const Assignments: React.FC = () => {
  const navigate = useNavigate();
  
  const assignmentsData = [
    { id: 'LAB-1', title: 'DSP Lab 1: Signal Generation', course: 'Digital Signal Processing', dueDate: 'Oct 14, 11:59 PM', status: 'Pending', type: 'Lab' },
    { id: 'LAB-2', title: 'IoT Basics: Sensor Reading', course: 'IoT Architecture', dueDate: 'Oct 16, 11:59 PM', status: 'In Progress', type: 'Lab' },
    { id: 'HW-1', title: 'Filter Design Theory', course: 'Digital Signal Processing', dueDate: 'Oct 10, 11:59 PM', status: 'Completed', type: 'Assignment' }
  ];

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
            {assignmentsData.filter(a => a.status === 'Pending').map(task => (
              <div key={task.id} className="bg-surface-container p-4 rounded-2xl border border-border-subtle shadow-sm hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate('/lab/exp_1_dsp')}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono-metrics font-bold text-secondary">{task.id}</span>
                  <span className="px-2 py-1 rounded bg-neural-blue/10 text-neural-blue text-[10px] font-bold uppercase tracking-wider">{task.type}</span>
                </div>
                <h4 className="font-body-md font-semibold text-primary mb-1">{task.title}</h4>
                <p className="text-xs text-secondary mb-4">{task.course}</p>
                <div className="flex items-center gap-1 text-warning-amber text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">timer</span>
                  Due {task.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-lg h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-neural-blue animate-pulse"></span>
            In Progress
          </h3>
          <div className="space-y-4">
            {assignmentsData.filter(a => a.status === 'In Progress').map(task => (
              <div key={task.id} className="bg-surface-container p-4 rounded-2xl border border-border-subtle shadow-sm hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate('/lab/exp_1_dsp')}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono-metrics font-bold text-secondary">{task.id}</span>
                  <span className="px-2 py-1 rounded bg-neural-blue/10 text-neural-blue text-[10px] font-bold uppercase tracking-wider">{task.type}</span>
                </div>
                <h4 className="font-body-md font-semibold text-primary mb-1">{task.title}</h4>
                <p className="text-xs text-secondary mb-4">{task.course}</p>
                <div className="w-full h-2 bg-background rounded-full mb-2 overflow-hidden border border-border-subtle">
                  <div className="h-full bg-neural-blue rounded-full w-[45%]"></div>
                </div>
                <div className="flex justify-between items-center text-xs text-secondary">
                  <span>45% Complete</span>
                  <span>Due {task.dueDate.split(',')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-lg opacity-75 h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success-emerald"></span>
            Completed
          </h3>
          <div className="space-y-4">
            {assignmentsData.filter(a => a.status === 'Completed').map(task => (
              <div key={task.id} className="bg-surface-container/50 p-4 rounded-2xl border border-border-subtle shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono-metrics font-bold text-secondary">{task.id}</span>
                  <span className="px-2 py-1 rounded bg-success-emerald/10 text-success-emerald text-[10px] font-bold uppercase tracking-wider">Done</span>
                </div>
                <h4 className="font-body-md font-semibold text-primary/70 mb-1 line-through">{task.title}</h4>
                <p className="text-xs text-secondary/70">{task.course}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
