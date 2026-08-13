import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { apiClient } from '../../api/client';

export const ManageDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/departments');
      setDepartments(res.data);
    } catch (err: any) {
      setError('Failed to fetch departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiClient.post('/admin/departments', { name: name.trim() });
      setName('');
      fetchDepts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create department');
    }
  };

  return (
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Departments
        </h1>
        <p className="font-body-lg text-secondary">Manage academic departments and organizational scope.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            Create Department
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Department Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CSE or ECE"
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/50"
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-6 py-3 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Add Department
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/60 shadow-md">
          <h3 className="font-label-caps text-label-caps text-primary mb-6">Registered Departments</h3>
          {isLoading ? (
            <div className="text-center py-12 text-secondary">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-error">{error}</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12 text-secondary">No departments registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-secondary font-label-caps text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 w-20">ID</th>
                    <th className="pb-3">Department Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-sm">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 font-mono-metrics text-secondary">{dept.id}</td>
                      <td className="py-4 font-semibold text-primary">{dept.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
