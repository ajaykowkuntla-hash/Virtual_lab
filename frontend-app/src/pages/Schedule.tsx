import React from 'react';
import { Layout } from '../components/Layout';

export const Schedule: React.FC = () => {
  const scheduleData = [
    { time: '09:00 AM', event: 'DSP Lab Session (Group A)', location: 'Virtual Lab 1' },
    { time: '11:30 AM', event: 'Office Hours', location: 'Room 304' },
    { time: '02:00 PM', event: 'IoT Basics (Group C)', location: 'Virtual Lab 2' },
    { time: '04:00 PM', event: 'Faculty Meeting', location: 'Conference Room' },
  ];

  return (
    <Layout role="faculty">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Schedule
          </h1>
          <p className="font-body-lg text-secondary">Manage your upcoming classes and lab sessions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all font-label-caps text-label-caps font-bold">
          <span className="material-symbols-outlined text-[18px]">event</span>
          New Event
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Mock */}
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg fade-in-up stagger-2 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label-caps text-label-caps text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              October 2024
            </h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-secondary">chevron_left</span></button>
              <button className="p-2 rounded-lg hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-secondary">chevron_right</span></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-label-caps text-xs text-secondary uppercase tracking-wider">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {/* Empty days before 1st */}
            <div className="h-24"></div>
            <div className="h-24"></div>
            
            {/* Days mock */}
            {[...Array(31)].map((_, i) => (
              <div key={i} className={`h-24 rounded-xl p-2 border ${i + 1 === 15 ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-border-subtle hover:bg-surface-container/50 text-secondary'} transition-colors relative`}>
                <span className={`font-mono-metrics text-sm ${i + 1 === 15 ? 'font-bold' : ''}`}>{i + 1}</span>
                {i % 4 === 0 && <div className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-neural-blue/50"></div>}
                {i % 7 === 0 && <div className="absolute bottom-4 left-2 right-2 h-1 rounded-full bg-neural-pink/50"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Agenda View */}
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg fade-in-up stagger-3 h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">view_agenda</span>
            Today's Agenda
          </h3>
          
          <div className="space-y-6 relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border-subtle z-0"></div>
            
            {scheduleData.map((item, index) => (
              <div key={index} className="relative z-10 pl-8">
                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-surface border-4 border-neural-blue z-20"></div>
                <p className="font-mono-metrics text-xs text-neural-blue font-bold mb-1">{item.time}</p>
                <div className="bg-surface-container p-4 rounded-2xl border border-border-subtle">
                  <h4 className="font-body-md font-semibold text-primary">{item.event}</h4>
                  <p className="text-sm text-secondary flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
