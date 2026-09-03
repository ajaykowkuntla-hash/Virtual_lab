import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { apiClient } from '../../api/client';

export const ManageExperiments: React.FC = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theory, setTheory] = useState('');
  const [instructions, setInstructions] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [language, setLanguage] = useState('');
  const [labType, setLabType] = useState('matlab_execution');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [tolerance, setTolerance] = useState(0.01);
  const [labId, setLabId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLabs = async () => {
    try {
      const res = await apiClient.get('/labs');
      setLabs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExperiments = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/lab/experiments');
      setExperiments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
    fetchExperiments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title || !labType || !labId) return;
    try {
      await apiClient.post('/lab/experiments', {
        id,
        title,
        description: description || undefined,
        theory: theory || undefined,
        instructions: instructions || undefined,
        starter_code: starterCode || undefined,
        language: language || undefined,
        lab_type: labType,
        expected_output: expectedOutput || undefined,
        tolerance,
        lab_id: labId
      });
      setId('');
      setTitle('');
      setDescription('');
      setTheory('');
      setInstructions('');
      setStarterCode('');
      setLanguage('');
      setExpectedOutput('');
      setTolerance(0.01);
      setLabId('');
      fetchExperiments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create experiment');
    }
  };

  const getLabName = (id: number) => labs.find(l => l.id === id)?.name || id;

  return (
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Experiments
        </h1>
        <p className="font-body-lg text-secondary">Manage virtual lab experiment templates and grading parameter profiles.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl h-fit max-h-[85vh] overflow-y-auto space-y-4">
          <h3 className="font-label-caps text-label-caps text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">science</span>
            New Experiment
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Experiment Unique ID</label>
              <input 
                type="text" 
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. exp_2_dsp"
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Experiment Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Convolution Analysis"
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Problem statement details..."
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm h-16 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Theory (Markdown)</label>
              <textarea 
                value={theory}
                onChange={(e) => setTheory(e.target.value)}
                placeholder="Educational context..."
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Instructions</label>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Step-by-step instructions..."
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm h-24 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Language</label>
                <input 
                  type="text" 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. octave, python"
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Starter Code</label>
              <textarea 
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                placeholder="Initial code template..."
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-mono-metrics h-32 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Lab Group Assignment</label>
              <select 
                required
                value={labId}
                onChange={(e) => setLabId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              >
                <option value="">Select Lab</option>
                {labs.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Execution Engine</label>
                <select 
                  value={labType}
                  onChange={(e) => setLabType(e.target.value)}
                  className="w-full bg-surface-container rounded-xl px-3 py-2 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-xs"
                >
                  <option value="matlab_execution">Matlab/Octave</option>
                  <option value="multilang_execution">Multi-Language</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Tolerance Tolerance</label>
                <input 
                  type="number" 
                  step="0.001"
                  required
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full bg-surface-container rounded-xl px-3 py-2 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Expected Output (JSON Array or String)</label>
              <input 
                type="text" 
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder='e.g. [1.0, 2.0, 3.0]'
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-6 py-2.5 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Create Template
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/60 shadow-md">
          <h3 className="font-label-caps text-label-caps text-primary mb-6">Experiment Configurations</h3>
          {isLoading ? (
            <div className="text-center py-12 text-secondary">Loading...</div>
          ) : experiments.length === 0 ? (
            <div className="text-center py-12 text-secondary">No experiments configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-secondary font-label-caps text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3">Title / ID</th>
                    <th className="pb-3">Execution</th>
                    <th className="pb-3">Lab Group</th>
                    <th className="pb-3">Expected Output</th>
                    <th className="pb-3">Tolerance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-sm">
                  {experiments.map((exp) => (
                    <tr key={exp.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4">
                        <div className="font-semibold text-primary">{exp.title}</div>
                        <div className="text-xs font-mono-metrics text-secondary mt-0.5">ID: {exp.id}</div>
                      </td>
                      <td className="py-4 text-xs font-mono-metrics text-secondary capitalize">{exp.lab_type.replace('_', ' ')}</td>
                      <td className="py-4 text-secondary font-semibold">{getLabName(exp.lab_id)}</td>
                      <td className="py-4 font-mono-metrics text-secondary text-xs truncate max-w-xs">{exp.expected_output || 'N/A'}</td>
                      <td className="py-4 font-mono-metrics text-secondary">{exp.tolerance}</td>
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
