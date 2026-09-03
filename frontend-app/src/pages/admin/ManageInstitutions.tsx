import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { apiClient } from '../../api/client';

export const ManageInstitutions: React.FC = () => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchInsts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/institutions');
      setInstitutions(res.data);
    } catch (err: any) {
      setError('Failed to fetch institutions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsts();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    try {
      if (editingId) {
        await apiClient.put(`/admin/institutions/${editingId}`, {
          name: name.trim(),
          code: code.trim(),
          description: description.trim() || undefined
        });
      } else {
        await apiClient.post('/admin/institutions', { 
          name: name.trim(),
          code: code.trim(),
          description: description.trim() || undefined,
          status: 'Active'
        });
      }
      setName('');
      setCode('');
      setDescription('');
      setEditingId(null);
      fetchInsts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save institution');
    }
  };

  const handleEdit = (inst: any) => {
    setName(inst.name);
    setCode(inst.code);
    setDescription(inst.description || '');
    setEditingId(inst.id);
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this institution?')) return;
    try {
      await apiClient.delete(`/admin/institutions/${id}`);
      fetchInsts();
    } catch (err: any) {
      alert('Failed to deactivate institution');
    }
  };

  const handleCancel = () => {
    setName('');
    setCode('');
    setDescription('');
    setEditingId(null);
  };

  return (
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Institutions
        </h1>
        <p className="font-body-lg text-secondary">Manage institutions acting as the root of the academic hierarchy.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">{editingId ? 'edit' : 'add_box'}</span>
            {editingId ? 'Edit Institution' : 'Create Institution'}
          </h3>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Institution Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. KG Reddy College"
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Institution Code</label>
              <input 
                type="text" 
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. KGRCE"
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Institution details..."
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/50"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-1 px-6 py-3 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all"
              >
                {editingId ? 'Save' : 'Add Institution'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-6 py-3 bg-surface-container-low text-secondary font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/60 shadow-md">
          <h3 className="font-label-caps text-label-caps text-primary mb-6">Registered Institutions</h3>
          {isLoading ? (
            <div className="text-center py-12 text-secondary">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-error">{error}</div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-12 text-secondary">No institutions registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-secondary font-label-caps text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 w-20">ID</th>
                    <th className="pb-3">Institution Name</th>
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-sm">
                  {institutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 font-mono-metrics text-secondary">{inst.id}</td>
                      <td className="py-4 font-semibold text-primary">{inst.name}</td>
                      <td className="py-4 font-mono-metrics text-secondary">{inst.code}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${inst.status === 'Active' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(inst)}
                            className="p-1.5 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {inst.status === 'Active' && (
                            <button 
                              onClick={() => handleDeactivate(inst.id)}
                              className="p-1.5 text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                              title="Deactivate"
                            >
                              <span className="material-symbols-outlined text-[18px]">block</span>
                            </button>
                          )}
                        </div>
                      </td>
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
