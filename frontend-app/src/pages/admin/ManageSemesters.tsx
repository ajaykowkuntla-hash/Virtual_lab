import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { apiClient } from '../../api/client';

export const ManageSemesters: React.FC = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSemesters = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/semesters/');
      setSemesters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    try {
      await apiClient.post('/semesters/', {
        name,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString()
      });
      setName('');
      setStartDate('');
      setEndDate('');
      fetchSemesters();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create semester');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await apiClient.post(`/semesters/${id}/activate`);
      fetchSemesters();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to activate semester');
    }
  };

  return (
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Semesters
        </h1>
        <p className="font-body-lg text-secondary">Configure academic cycles and manage active semesters.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            New Semester
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Semester Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fall 2026"
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Start Date</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">End Date</label>
              <input 
                type="date" 
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-6 py-3 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Create Semester
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/60 shadow-md">
          <h3 className="font-label-caps text-label-caps text-primary mb-6">Registered Semesters</h3>
          {isLoading ? (
            <div className="text-center py-12 text-secondary">Loading...</div>
          ) : semesters.length === 0 ? (
            <div className="text-center py-12 text-secondary">No semesters configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-secondary font-label-caps text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Start Date</th>
                    <th className="pb-3">End Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-sm">
                  {semesters.map((sem) => (
                    <tr key={sem.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 font-semibold text-primary">{sem.name}</td>
                      <td className="py-4 text-secondary">{new Date(sem.start_date).toLocaleDateString()}</td>
                      <td className="py-4 text-secondary">{new Date(sem.end_date).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          sem.is_active ? 'bg-success-emerald/10 text-success-emerald' : 'bg-secondary/10 text-secondary'
                        }`}>
                          {sem.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {!sem.is_active && (
                          <button 
                            onClick={() => handleActivate(sem.id)}
                            className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high transition-colors text-primary font-label-caps text-label-caps font-bold rounded-lg border border-border-subtle shadow-sm"
                          >
                            Activate
                          </button>
                        )}
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
