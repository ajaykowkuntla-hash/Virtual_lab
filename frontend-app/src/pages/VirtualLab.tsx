import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MultiLangIDE } from '../components/MultiLangIDE';

export const VirtualLab: React.FC = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { user } = useAuth();
  
  const defaultScript = `% Generate and analyze a mixed signal
fs = 1000; % Sampling frequency
L = 1000; % Length of signal
t = (0:L-1)*(1/fs); % Time vector

% Signal components
f1 = 50; % Hz
f2 = 120; % Hz
x = 0.7*sin(2*pi*f1*t) + sin(2*pi*f2*t);

% Add some noise
y = x + 2*randn(size(t));

% Compute FFT
Y = fft(y);
P2 = abs(Y/L);

% Generate plot
figure('visible', 'off');
plot(t, y);
title('Noisy Time Domain Signal');
xlabel('t (seconds)');
ylabel('X(t)');
print('output_plot.png', '-dpng');`;
  
  const [scriptText, setScriptText] = useState(() => {
    const saved = localStorage.getItem(`lab_draft_v2_${experimentId}`);
    return saved !== null ? saved : defaultScript;
  });

  useEffect(() => {
    localStorage.setItem(`lab_draft_v2_${experimentId}`, scriptText);
  }, [scriptText, experimentId]);

  const [logs, setLogs] = useState<string>('> System initialized. Ready.\n');
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verified' | 'unverified' | 'failed'>('verified');
  const [environment, setEnvironment] = useState<'selection' | 'matlab' | 'python' | 'iot'>('selection');

  const handleRun = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setLogs('> Running main.m...\n');
    setPlotImage(null);
    setStatus('idle');
    
    try {
      const response = await apiClient.post('/lab/submit', {
        user_id: parseInt(user.id),
        experiment_id: experimentId || 'exp_1_dsp',
        script_text: scriptText
      });
      
      let newLogs = `> Running main.m...\n`;
      if (response.data.status === 'failed') {
        newLogs += `> Execution failed!\n\n${response.data.logs || ''}`;
      } else {
        newLogs += `> Execution completed successfully (0.042s)\n\n${response.data.logs || ''}`;
      }
      setLogs(newLogs);
      
      if (response.data.status !== 'failed' && response.data.plot_b64) {
        setPlotImage(`data:image/png;base64,${response.data.plot_b64}`);
        setIsPlotModalOpen(true);
      }
      setStatus(response.data.status);
    } catch (error: any) {
      console.error(error);
      setLogs(`> Error during execution:\n${error.response?.data?.detail || 'An error occurred.'}`);
      setStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Render Line numbers based on textarea lines
  const lineCount = scriptText.split('\n').length;
  const lines = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  const breadcrumbs = (
    <div className="flex items-center gap-2">
      <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <Link to="/assignments" className="hover:text-primary transition-colors">Assignments</Link>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <span className="text-primary font-medium">{experimentId}</span>
    </div>
  );

  return (
    <Layout role="student" fullWidth={true} breadcrumbs={breadcrumbs}>
      {environment === 'selection' && (
        <div className="flex flex-col h-full max-w-6xl mx-auto py-12 fade-in-up stagger-1">
          <div className="mb-12 text-center space-y-4">
            <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-tight">
              Select Your Environment
            </h1>
            <p className="text-secondary font-body-lg max-w-2xl mx-auto">
              Choose the appropriate engine to run this experiment. Your workspace will automatically adapt to your selection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* MATLAB Card */}
            <div 
              onClick={() => setEnvironment('matlab')}
              className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl hover:border-neural-blue/30 transition-all cursor-pointer group flex flex-col"
            >
              <div className="w-16 h-16 rounded-2xl bg-neural-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] text-neural-blue">functions</span>
              </div>
              <h3 className="text-h3 font-semibold text-primary mb-2">MATLAB / Octave</h3>
              <p className="text-secondary font-body-md mb-8 flex-1">
                Advanced mathematical computing environment for signal processing, control systems, and data analysis.
              </p>
              <div className="flex items-center text-neural-blue font-label-caps text-label-caps font-bold">
                Launch IDE <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* Python Card */}
            <div 
              onClick={() => setEnvironment('python')}
              className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl hover:border-success-emerald/30 transition-all cursor-pointer group flex flex-col"
            >
              <div className="w-16 h-16 rounded-2xl bg-success-emerald/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] text-success-emerald">code_blocks</span>
              </div>
              <h3 className="text-h3 font-semibold text-primary mb-2">Python Data Science</h3>
              <p className="text-secondary font-body-md mb-8 flex-1">
                Jupyter-style environment preloaded with NumPy, Pandas, and Matplotlib for machine learning and scripting.
              </p>
              <div className="flex items-center text-success-emerald font-label-caps text-label-caps font-bold">
                Launch IDE <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* IoT Builder Card */}
            <div 
              onClick={() => setEnvironment('iot')}
              className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl hover:border-warning-amber/30 transition-all cursor-pointer group flex flex-col"
            >
              <div className="w-16 h-16 rounded-2xl bg-warning-amber/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] text-warning-amber">memory</span>
              </div>
              <h3 className="text-h3 font-semibold text-primary mb-2">IoT Builder</h3>
              <p className="text-secondary font-body-md mb-8 flex-1">
                Drag-and-drop hardware simulator. Build circuits, wire microcontrollers, and deploy firmware instantly.
              </p>
              <div className="flex items-center text-warning-amber font-label-caps text-label-caps font-bold">
                Launch Simulator <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {environment === 'matlab' && (
        <>
          <div className="flex flex-col h-full fade-in-up stagger-1">
        
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 bg-[#f8f9fa] p-4 rounded-2xl border border-[#e5e7eb] shadow-sm">
          <button onClick={() => setEnvironment('selection')} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label-caps text-label-caps font-bold">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Change Environment
          </button>
          <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
            <span className="px-3 py-1 bg-[#e5e7eb] rounded-full font-sans text-xs text-[#4b5563] font-medium">
              ID:402
            </span>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-subtle bg-white hover:bg-surface-container transition-colors shadow-sm text-black">
              <span className="material-symbols-outlined text-[18px]">format_align_justify</span>
              <span className="font-sans text-xs font-bold">Generate</span>
            </button>
            <button 
              onClick={handleRun}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#10b981] text-white hover:bg-[#059669] transition-all shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">{isLoading ? 'refresh' : 'play_arrow'}</span>
              <span className="font-sans text-xs font-bold">Run</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white hover:bg-black/80 transition-all shadow-md">
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span className="font-sans text-xs font-bold">Submit</span>
            </button>
            
            {/* Icon Buttons */}
            <div className="flex gap-2 ml-2">
              <button className="w-10 h-10 rounded-full border border-border-subtle bg-white hover:bg-surface-container flex items-center justify-center transition-colors shadow-sm">
                <div className="w-3 h-3 bg-[#ef4444] rounded-sm"></div>
              </button>
              <button className="w-10 h-10 rounded-full border border-border-subtle bg-white hover:bg-surface-container flex items-center justify-center transition-colors shadow-sm text-secondary">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>
          </div>
        </header>

        {/* IDE Container */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[#2d2d2d] bg-[#1e1e1e] min-h-[700px]">
          
          {/* IDE Toolbar */}
          <div className="h-12 bg-[#18181b] border-b border-[#2d2d2d] flex items-center justify-between px-4">
            {/* Left: Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-success-emerald">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="font-label-caps text-[10px] font-bold">VERIFIED</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#888]">Output match: 99.8%</span>
                <span className="text-[8px] text-[#666]">(RMS Error: 0.002)</span>
              </div>
            </div>

            {/* Center: Tabs */}
            <div className="flex items-center gap-2 h-full">
              <div className="h-full flex items-center gap-2 px-4 border-b-2 border-neural-blue bg-[#252526] text-[#d4d4d4] text-xs font-mono-metrics cursor-pointer">
                <span className="text-neural-blue font-bold">&lt;&gt;</span> main.m
              </div>
              <div className="h-full flex items-center px-4 text-[#888] hover:text-[#d4d4d4] text-xs font-mono-metrics cursor-pointer transition-colors">
                utils.m
              </div>
              <div className="h-full flex items-center px-4 text-[#888] hover:text-[#d4d4d4] text-xs font-body-sm cursor-pointer transition-colors">
                Instructions
              </div>
              {plotImage && (
                <div 
                  onClick={() => setIsPlotModalOpen(true)}
                  className="h-full flex items-center gap-1 px-4 text-neural-blue hover:text-[#d4d4d4] text-xs font-mono-metrics cursor-pointer transition-colors ml-2 bg-neural-blue/10 border-b-2 border-neural-blue"
                >
                  <span className="material-symbols-outlined text-[14px]">insights</span>
                  View Waveform
                </div>
              )}
              <div className="h-full flex items-center gap-1 px-4 text-[#888] hover:text-[#d4d4d4] text-[10px] font-label-caps uppercase cursor-pointer transition-colors ml-4">
                <span className="material-symbols-outlined text-[14px]">fullscreen_exit</span> MINIMIZE
              </div>
            </div>

            {/* Right: Saved Indicator */}
            <div className="flex items-center gap-1 text-[#666] text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#666]"></div> Saved
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Gutter */}
            <div className="w-12 bg-[#1e1e1e] border-r border-[#2d2d2d] py-4 flex flex-col items-end pr-3 text-[#666] font-mono-metrics text-[13px] select-none overflow-hidden leading-relaxed">
              {lines.map(line => (
                <div key={line}>{line}</div>
              ))}
            </div>
            
            {/* Code Textarea */}
            <div className="flex-1 relative overflow-auto">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="absolute inset-0 w-full h-full bg-transparent text-[#9cdcfe] font-mono-metrics text-[13px] p-4 pt-4 leading-relaxed resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Integrated Terminal */}
          <div className="h-48 bg-[#18181b] border-t border-[#2d2d2d] flex flex-col">
            <div className="h-8 bg-[#1e1e1e] flex items-center px-4 border-b border-[#2d2d2d]">
              <span className="text-[#d4d4d4] text-[10px] font-label-caps uppercase font-bold tracking-wider">Terminal</span>
            </div>
            <div className="flex-1 p-4 font-mono-metrics text-[12px] overflow-y-auto">
              <pre className={`whitespace-pre-wrap font-inherit m-0 ${status === 'failed' ? 'text-error' : 'text-success-emerald'}`}>
                {logs}
              </pre>
              <div className="flex items-center mt-2 text-neural-blue font-bold">
                <span>LAB-402 $</span>
                <span className="w-2 h-4 bg-neural-blue ml-2 animate-pulse"></span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Plot Modal Popup */}
      {isPlotModalOpen && plotImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white p-6 rounded-3xl w-full max-w-4xl shadow-2xl border border-white/60 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-h3 font-semibold text-primary tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-neural-blue">insights</span>
                Simulation Waveform
              </h2>
              <button onClick={() => setIsPlotModalOpen(false)} className="text-secondary hover:text-primary transition-colors p-2 hover:bg-surface-container-high rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="w-full bg-[#f8f9fa] rounded-2xl border border-[#e5e7eb] flex items-center justify-center p-4 min-h-[400px]">
              <img src={plotImage} alt="Simulation Graph" className="max-h-[600px] max-w-full object-contain mix-blend-multiply" />
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsPlotModalOpen(false)} className="px-6 py-2 bg-primary text-white rounded-xl font-label-caps font-bold hover:bg-primary/90 transition-colors shadow-lg">
                Close Graph
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {environment === 'python' && (
        <MultiLangIDE onReturn={() => setEnvironment('selection')} />
      )}

      {environment === 'iot' && (
        <div className="flex flex-col items-center justify-center h-full fade-in-up stagger-1 space-y-6">
          <span className="material-symbols-outlined text-[64px] text-warning-amber">memory</span>
          <h2 className="text-h2 font-semibold text-primary">IoT Hardware Builder</h2>
          <p className="text-secondary font-body-lg">The Drag-and-Drop Hardware Simulator is currently under construction.</p>
          <button onClick={() => setEnvironment('selection')} className="px-6 py-3 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-subtle text-primary font-label-caps text-label-caps font-bold transition-all">
            Return to Selection
          </button>
        </div>
      )}
    </Layout>
  );
};
