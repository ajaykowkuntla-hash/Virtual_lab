import React from 'react';
import { Layout } from '../components/Layout';

export const Timetable: React.FC = () => {
  const timetableData = [
    { day: 'Monday', classes: [{ time: '10:00 AM', name: 'Digital Signal Processing', type: 'Lecture' }] },
    { day: 'Tuesday', classes: [{ time: '02:00 PM', name: 'DSP Lab', type: 'Lab' }] },
    { day: 'Wednesday', classes: [{ time: '11:00 AM', name: 'IoT Architecture', type: 'Lecture' }] },
    { day: 'Thursday', classes: [{ time: '09:00 AM', name: 'IoT Lab', type: 'Lab' }, { time: '03:00 PM', name: 'Study Group', type: 'Meeting' }] },
    { day: 'Friday', classes: [] },
  ];

  return (
    <Layout role="student">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          My Timetable
        </h1>
        <p className="font-body-lg text-secondary">View your weekly class schedule and upcoming labs.</p>
      </header>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-2">
        <div className="space-y-6">
          {timetableData.map((dayPlan, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 p-6 bg-surface-container/50 rounded-2xl border border-border-subtle hover:bg-surface-container transition-colors">
              <div className="md:w-32 flex-shrink-0">
                <h3 className="font-label-caps text-label-caps text-primary tracking-wider">{dayPlan.day}</h3>
              </div>
              <div className="flex-1 space-y-4">
                {dayPlan.classes.length > 0 ? (
                  dayPlan.classes.map((cls, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-background p-4 rounded-xl border border-border-subtle shadow-sm">
                      <span className="font-mono-metrics text-sm font-bold text-secondary w-20">{cls.time}</span>
                      <div className="flex-1">
                        <h4 className="font-body-md font-semibold text-primary">{cls.name}</h4>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cls.type === 'Lab' ? 'bg-neural-purple/10 text-neural-purple' : 
                          cls.type === 'Lecture' ? 'bg-neural-blue/10 text-neural-blue' : 'bg-success-emerald/10 text-success-emerald'
                        }`}>
                          {cls.type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full p-4 rounded-xl border border-dashed border-border-subtle text-secondary font-body-sm italic">
                    No classes scheduled. Enjoy your day off!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
