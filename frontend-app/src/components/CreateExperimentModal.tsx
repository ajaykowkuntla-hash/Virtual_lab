import React, { useState } from 'react';
import { apiClient } from '../api/client';

interface CreateExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateExperimentModal: React.FC<CreateExperimentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [tolerance, setTolerance] = useState('0.01');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = '/lab/experiments';
      await apiClient.post(endpoint, {
        id,
        title,
        expected_output: expectedOutput,
        tolerance: parseFloat(tolerance),
      });
      onSuccess();
      onClose();
      // Reset form
      setId('');
      setTitle('');
      setExpectedOutput('');
      setTolerance('0.01');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create experiment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
      <div className="glass-panel p-8 rounded-3xl w-full max-w-lg shadow-2xl shadow-black/50 border border-white/60">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-h2 font-semibold text-primary tracking-tight">Create New Lab</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error font-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-label-caps text-label-caps text-secondary uppercase mb-2">Experiment ID</label>
            <input
              type="text"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g., exp_2_thermo"
              className="w-full bg-surface-container text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-neural-blue/50 border border-border-subtle"
            />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-secondary uppercase mb-2">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Thermodynamic Cycles: Rankine"
              className="w-full bg-surface-container text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-neural-blue/50 border border-border-subtle"
            />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-secondary uppercase mb-2">Expected Output (JSON Array)</label>
            <textarea
              required
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              placeholder="e.g., [0.0, 0.30902, 0.58779]"
              className="w-full bg-surface-container font-mono-metrics text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-neural-blue/50 border border-border-subtle h-24 resize-none"
            />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-secondary uppercase mb-2">Tolerance</label>
            <input
              type="number"
              step="0.00001"
              required
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              className="w-full bg-surface-container text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-neural-blue/50 border border-border-subtle"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-label-caps text-label-caps font-bold text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-black/5 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
              )}
              <span className="font-label-caps text-label-caps font-bold">Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
