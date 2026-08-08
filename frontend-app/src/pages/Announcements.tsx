import React, { useState } from 'react';
import { Layout } from '../components/Layout';

export const Announcements: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  
  const mockPosts = [
    { id: 1, author: 'Dr. Vance', time: '2 hours ago', content: 'Reminder: The first DSP lab report is due this Friday at midnight. Please ensure you upload the generated figures along with your code.' },
    { id: 2, author: 'Dr. Vance', time: 'Yesterday', content: "Great job in today's session. I have uploaded the slides for the IoT Architecture lecture to the course repository." }
  ];

  return (
    <Layout role="faculty">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Announcements
        </h1>
        <p className="font-body-lg text-secondary">Broadcast updates and notices to your students.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        {/* Create Post */}
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
            New Announcement
          </h3>
          <textarea 
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-32 p-4 bg-surface-container rounded-xl border border-border-subtle text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none mb-4"
          />
          <div className="flex justify-between items-center">
            <button className="text-secondary hover:text-primary p-2 rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
            </button>
            <button className="px-6 py-2 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all">
              Post Update
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-label-caps text-label-caps text-primary mb-2">Recent Broadcasts</h3>
          {mockPosts.map((post) => (
            <div key={post.id} className="glass-panel p-6 rounded-3xl border border-white/60 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neural-blue/10 flex items-center justify-center text-neural-blue font-bold">
                    DV
                  </div>
                  <div>
                    <h4 className="font-body-md font-semibold text-primary">{post.author}</h4>
                    <span className="text-xs text-secondary">{post.time}</span>
                  </div>
                </div>
                <button className="text-secondary hover:text-error transition-colors p-1 rounded-md hover:bg-error/10">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <p className="font-body-sm text-primary leading-relaxed">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
