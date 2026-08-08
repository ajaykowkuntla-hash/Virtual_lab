import React from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export const PlaceholderPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Format the path into a readable title (e.g., /assignments -> Assignments)
  const path = location.pathname.substring(1);
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <Layout role={user?.role === 'faculty' ? 'faculty' : 'student'}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in-up stagger-1">
        <div className="glass-panel p-12 rounded-3xl border border-white/60 shadow-xl max-w-lg w-full">
          <span className="material-symbols-outlined text-[64px] text-neural-blue mb-6">
            construction
          </span>
          <h1 className="text-h2 font-semibold text-primary tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-body-lg text-secondary">
            This module is currently under development. Check back later for updates!
          </p>
        </div>
      </div>
    </Layout>
  );
};
