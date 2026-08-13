import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { CreateExperimentModal } from '../../components/CreateExperimentModal';
import { apiClient } from '../../api/client';

export const AdminManageLabs: React.FC = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track assigning state for individual labs
  const [assigningLabId, setAssigningLabId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [labsRes, facultyRes] = await Promise.all([
        apiClient.get('/lab/experiments'),
        apiClient.get('/admin/faculty')
      ]);
      setExperiments(labsRes.data);
      setFacultyList(facultyRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignFaculty = async (labId: string, facultyId: string) => {
    if (!facultyId) return;
    
    setAssigningLabId(labId);
    try {
      await apiClient.post(`/admin/labs/${labId}/assign-faculty?faculty_id=${facultyId}`);
      // Refresh to get updated assignment
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to assign faculty');
    } finally {
      setAssigningLabId(null);
    }
  };

  return (
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Labs & Assignments
          </h1>
          <p className="font-body-lg text-secondary">Manage experiments and assign them to faculty members.</p>
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
            <p className="text-secondary mb-6">No experiments have been created yet.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-surface-container hover:bg-surface-container-high transition-colors text-primary font-label-caps text-label-caps rounded-xl border border-border-subtle"
            >
              Create Your First Lab
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map(exp => {
              // The backend might return 'experiment_id' or 'id' based on the endpoint, standardizing here
              const labId = exp.experiment_id || exp.id;
              
              return (
                <div key={labId} className="bg-surface-container p-6 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-neural-blue/10 text-neural-blue text-[10px] font-bold uppercase tracking-wider rounded-full">Active</span>

                  </div>
                  <h3 className="font-body-lg font-semibold text-primary mb-1">{exp.title}</h3>
                  <p className="text-xs font-mono-metrics text-secondary mb-4">ID: {labId}</p>
                  
                  <div className="mt-auto pt-4 border-t border-border-subtle">
                    <label className="block text-xs font-label-caps text-label-caps text-secondary uppercase mb-2">Assigned Faculty</label>
                    <div className="relative">
                      {assigningLabId === labId && (
                        <div className="absolute right-2 top-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <select 
                        className="w-full bg-panel-bg text-primary px-3 py-2 rounded-lg border border-border-subtle focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none cursor-pointer"
                        value={exp.assigned_faculty_id || ""}
                        onChange={(e) => handleAssignFaculty(labId, e.target.value)}
                        disabled={assigningLabId === labId}
                      >
                        <option value="" disabled>Select Faculty</option>
                        {facultyList.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.username})</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
                        arrow_drop_down
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateExperimentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
      />
    </Layout>
  );
};
