import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

interface Announcement {
  id: number;
  title: string | null;
  content: string;
  author_id: number;
  timestamp: string;
}

export const Updates: React.FC = () => {
  const [updates, setUpdates] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await apiClient.get('/announcements');
        setUpdates(res.data);
      } catch (err) {
        console.error("Failed to fetch updates:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  return (
    <Layout role="student">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Updates
        </h1>
        <p className="font-body-lg text-secondary">Stay informed with announcements from your professors.</p>
      </header>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-2 max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center p-12">
            <span className="material-symbols-outlined text-[48px] text-secondary mb-4">inbox</span>
            <p className="text-secondary font-body-lg">No updates available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className={`p-6 rounded-2xl border transition-colors bg-surface-container/50 border-border-subtle shadow-sm`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-neural-blue/10 text-neural-blue`}>
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div>
                      <h4 className="font-body-md font-semibold text-primary flex items-center gap-2">
                        {update.title || `Author ID: ${update.author_id}`}
                      </h4>
                      <span className="text-xs text-secondary">{new Date(update.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <p className="font-body-sm text-primary leading-relaxed ml-13 pl-13">
                  {update.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
