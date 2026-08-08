import React from 'react';
import { Layout } from '../components/Layout';

export const Updates: React.FC = () => {
  const mockUpdates = [
    { id: 1, author: 'Dr. Vance', time: '2 hours ago', content: 'Reminder: The first DSP lab report is due this Friday at midnight. Please ensure you upload the generated figures along with your code.', unread: true },
    { id: 2, author: 'Dr. Vance', time: 'Yesterday', content: "Great job in today's session. I have uploaded the slides for the IoT Architecture lecture to the course repository.", unread: false },
    { id: 3, author: 'System', time: 'Oct 10', content: 'Scheduled maintenance for the Virtual Lab platform on Saturday from 2AM to 4AM EST.', unread: false }
  ];

  return (
    <Layout role="student">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Updates
        </h1>
        <p className="font-body-lg text-secondary">Stay informed with announcements from your professors.</p>
      </header>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-2 max-w-4xl">
        <div className="space-y-4">
          {mockUpdates.map((update) => (
            <div key={update.id} className={`p-6 rounded-2xl border transition-colors ${update.unread ? 'bg-primary/5 border-primary/20 shadow-md' : 'bg-surface-container/50 border-border-subtle shadow-sm'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${update.author === 'System' ? 'bg-error/10 text-error' : 'bg-neural-blue/10 text-neural-blue'}`}>
                    {update.author === 'System' ? <span className="material-symbols-outlined text-[20px]">warning</span> : 'DV'}
                  </div>
                  <div>
                    <h4 className="font-body-md font-semibold text-primary flex items-center gap-2">
                      {update.author}
                      {update.unread && <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>}
                    </h4>
                    <span className="text-xs text-secondary">{update.time}</span>
                  </div>
                </div>
              </div>
              <p className="font-body-sm text-primary leading-relaxed ml-13 pl-13">
                {update.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
