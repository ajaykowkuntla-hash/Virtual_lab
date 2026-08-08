import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { CreateExperimentModal } from '../components/CreateExperimentModal';
import { apiClient } from '../api/client';

export const ManageLabs: React.FC = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiments = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/lab/experiments');
      setExperiments(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch experiments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  return (
    <Layout role="faculty">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Manage Labs
          </h1>
          <p className="font-body-lg text-secondary">Create and manage your virtual experiments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all font-label-caps text-label-caps font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Lab
        </button>
      </header>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[64px] text-secondary mb-4">science</span>
            <h3 className="text-h3 font-semibold text-primary mb-2">No Labs Found</h3>
            <p className="text-secondary mb-6">You haven't created any experiments yet.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-surface-container hover:bg-surface-container-high transition-colors text-primary font-label-caps text-label-caps rounded-xl border border-border-subtle"
            >
              Create Your First Lab
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map(exp => (
              <div key={exp.experiment_id} className="bg-surface-container p-6 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-neural-blue/10 text-neural-blue text-[10px] font-bold uppercase tracking-wider rounded-full">Active</span>
                  <button className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>
                <h3 className="font-body-lg font-semibold text-primary mb-1">{exp.title}</h3>
                <p className="text-xs font-mono-metrics text-secondary mb-4">ID: {exp.experiment_id}</p>
                <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
                  <span className="text-xs text-secondary">Created: {new Date(exp.created_at).toLocaleDateString()}</span>
                  <span className="text-xs font-mono-metrics bg-background px-2 py-1 rounded text-primary">Tol: {exp.tolerance}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateExperimentModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchExperiments();
        }} 
      />
    </Layout>
  );
};
