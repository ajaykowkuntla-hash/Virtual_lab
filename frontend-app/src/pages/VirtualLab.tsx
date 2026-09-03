import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MultiLangIDE } from '../components/MultiLangIDE';
import Editor, { type OnMount } from '@monaco-editor/react';

// Types for structured execution response
interface OctaveError {
  line: number | null;
  message: string;
}

interface ExecutionResult {
  success: boolean;
  status: string;
  stdout: string | null;
  stderr: string | null;
  logs: string;
  figures: string[];
  errors: OctaveError[];
  plot_b64: string | null;
  execution_time: number;
  exit_code: number;
}

type ExecutionStatus = 'ready' | 'running' | 'completed' | 'failed' | 'timeout' | 'verified' | 'pending';
type BottomTab = 'terminal' | 'output' | 'errors' | 'input';

// Download helper: base64 data URI → blob → browser download
function downloadBase64Image(dataUri: string, filename: string) {
  const base64 = dataUri.replace(/^data:image\/png;base64,/, '');
  const byteChars = atob(base64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNums);
  const blob = new Blob([byteArray], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ExperimentMetadata {
  id: string;
  title: string;
  description?: string;
  theory?: string;
  instructions?: string;
  starter_code?: string;
  language?: string;
  lab_type: string;
}

export const VirtualLab: React.FC = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { user } = useAuth();
  
  const [scriptText, setScriptText] = useState("");
  const [experiment, setExperiment] = useState<ExperimentMetadata | null>(null);
  const [isExperimentLoading, setIsExperimentLoading] = useState(true);

  useEffect(() => {
    const fetchExperiment = async () => {
      if (!experimentId) return;
      try {
        const response = await apiClient.get(`/lab/experiments/${experimentId}`);
        setExperiment(response.data);
        
        // Load saved draft or starter code
        const saved = localStorage.getItem(`lab_draft_v2_${experimentId}`);
        if (saved !== null) {
          setScriptText(saved);
        } else if (response.data.starter_code) {
          setScriptText(response.data.starter_code);
        }
        
        if (response.data.language === 'octave') {
          setEnvironment('matlab');
        } else if (response.data.language === 'python' || response.data.language === 'cpp' || response.data.language === 'c' || response.data.language === 'java') {
          setEnvironment('python');
        } else if (response.data.language === 'circuit') {
          setEnvironment('iot');
        }
      } catch (err) {
        console.error("Failed to load experiment:", err);
      } finally {
        setIsExperimentLoading(false);
      }
    };
    fetchExperiment();
  }, [experimentId]);

  useEffect(() => {
    if (scriptText && !isExperimentLoading) {
      localStorage.setItem(`lab_draft_v2_${experimentId}`, scriptText);
    }
  }, [scriptText, experimentId, isExperimentLoading]);

  // Execution state
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('ready');
  const [terminalLines, setTerminalLines] = useState<string[]>(['> System initialized. Ready.']);
  const [figures, setFigures] = useState<string[]>([]);
  const [errors, setErrors] = useState<OctaveError[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stdinText, setStdinText] = useState("");
  
  // UI state
  const [bottomTab, setBottomTab] = useState<BottomTab>('terminal');
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<'selection' | 'matlab' | 'python' | 'iot'>('selection');
  
  // Monaco editor ref
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Navigate Monaco to a specific line and highlight it
  const goToLine = (lineNumber: number) => {
    const editor = editorRef.current;
    if (!editor || !lineNumber) return;
    
    editor.revealLineInCenter(lineNumber);
    editor.setPosition({ lineNumber, column: 1 });
    editor.focus();
  };

  // Set error decorations in Monaco
  const setErrorDecorations = (errs: OctaveError[]) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    // Clear previous decorations
    if (decorationsRef.current.length > 0) {
      editor.removeDecorations(decorationsRef.current);
    }
    
    const newDecorations = errs
      .filter(e => e.line !== null)
      .map(e => ({
        range: {
          startLineNumber: e.line!,
          startColumn: 1,
          endLineNumber: e.line!,
          endColumn: 1000,
        },
        options: {
          isWholeLine: true,
          className: 'error-line-decoration',
          glyphMarginClassName: 'error-glyph-margin',
          hoverMessage: { value: `⚠ ${e.message}` },
          overviewRuler: {
            color: '#ef4444',
            position: 4, // OverviewRulerLane.Full
          },
        },
      }));
    
    decorationsRef.current = editor.deltaDecorations([], newDecorations);
  };

  // Clear all execution state for a new run
  const clearExecutionState = () => {
    setFigures([]);
    setErrors([]);
    setExecutionTime(0);
    setExecutionStatus('running');
    setTerminalLines(['> Running main.m...', '> Executing Octave...']);
    
    // Clear Monaco error decorations
    const editor = editorRef.current;
    if (editor && decorationsRef.current.length > 0) {
      editor.removeDecorations(decorationsRef.current);
      decorationsRef.current = [];
    }
  };

  const handleRun = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    clearExecutionState();
    
    try {
      const response = await apiClient.post<ExecutionResult>('/lab/submit', {
        user_id: parseInt(user.id),
        experiment_id: experimentId || '',
        script_text: scriptText,
        stdin: stdinText
      });
      
      const data = response.data;
      
      // Update execution time
      setExecutionTime(data.execution_time);
      
      // Update terminal
      const newLines: string[] = ['> Running main.m...'];
      
      if (data.status === 'timeout') {
        setExecutionStatus('timeout');
        newLines.push('> ⚠ Execution timed out.');
        newLines.push(`> Time elapsed: ${data.execution_time}s`);
      } else if (data.status === 'failed') {
        setExecutionStatus('failed');
        newLines.push(`> ✗ Execution failed.`);
        newLines.push(`> Completed in ${data.execution_time}s`);
        if (data.stdout) {
          newLines.push('', '--- stdout ---', data.stdout);
        }
      } else if (data.status === 'verified') {
        setExecutionStatus('verified');
        newLines.push(`> ✓ Execution completed and verified.`);
        newLines.push(`> Completed in ${data.execution_time}s`);
        if (data.stdout) {
          newLines.push('', '--- stdout ---', data.stdout);
        }
      } else {
        // completed / pending
        setExecutionStatus(data.status === 'pending' ? 'pending' : 'completed');
        newLines.push(`> ✓ Execution completed successfully.`);
        newLines.push(`> Completed in ${data.execution_time}s`);
        if (data.stdout) {
          newLines.push('', '--- stdout ---', data.stdout);
        }
      }
      
      setTerminalLines(newLines);
      
      // Update figures
      if (data.figures && data.figures.length > 0) {
        setFigures(data.figures);
        setBottomTab('output');
      }
      
      // Update errors
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
        setErrorDecorations(data.errors);
        if (!data.figures || data.figures.length === 0) {
          setBottomTab('errors');
        }
      } else {
        setErrors([]);
      }
      
    } catch (error: any) {
      console.error(error);
      setExecutionStatus('failed');
      setTerminalLines([
        '> Running main.m...',
        `> ✗ Error: ${error.response?.data?.detail || error.message || 'Connection failed.'}`
      ]);
      setErrors([{ line: null, message: error.response?.data?.detail || 'Connection to execution engine failed.' }]);
      setBottomTab('errors');
    } finally {
      setIsLoading(false);
    }
  };

  // Open fullscreen modal for a specific figure
  const openFullscreen = (figureUri: string) => {
    setModalImage(figureUri);
    setIsPlotModalOpen(true);
  };

  // Status bar helpers
  const getStatusConfig = () => {
    switch (executionStatus) {
      case 'ready': return { label: 'Ready', icon: 'radio_button_unchecked', color: 'text-[#888]', bg: 'bg-[#888]/10' };
      case 'running': return { label: 'Running', icon: 'sync', color: 'text-neural-blue', bg: 'bg-neural-blue/10' };
      case 'completed': return { label: 'Completed', icon: 'check_circle', color: 'text-success-emerald', bg: 'bg-success-emerald/10' };
      case 'verified': return { label: 'Verified', icon: 'verified', color: 'text-success-emerald', bg: 'bg-success-emerald/10' };
      case 'pending': return { label: 'Completed', icon: 'check_circle', color: 'text-success-emerald', bg: 'bg-success-emerald/10' };
      case 'failed': return { label: 'Failed', icon: 'error', color: 'text-error', bg: 'bg-error/10' };
      case 'timeout': return { label: 'Timed Out', icon: 'timer_off', color: 'text-warning-amber', bg: 'bg-warning-amber/10' };
      default: return { label: 'Ready', icon: 'radio_button_unchecked', color: 'text-[#888]', bg: 'bg-[#888]/10' };
    }
  };
  const statusCfg = getStatusConfig();

  const breadcrumbs = (
    <div className="flex items-center gap-2">
      <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <Link to="/assignments" className="hover:text-primary transition-colors">Assignments</Link>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <span className="text-primary font-medium">{experiment?.title || experimentId}</span>
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
                  MATLAB / Octave
                </span>
                <button 
                  onClick={handleRun}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#10b981] text-white hover:bg-[#059669] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
                    {isLoading ? 'sync' : 'play_arrow'}
                  </span>
                  <span className="font-sans text-xs font-bold">{isLoading ? 'Running...' : 'Run Code'}</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white hover:bg-black/80 transition-all shadow-md">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span className="font-sans text-xs font-bold">Submit</span>
                </button>
              </div>
            </header>

            {/* IDE Container */}
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[#2d2d2d] bg-[#1e1e1e] min-h-[700px]">
              
              {/* IDE Toolbar */}
              <div className="h-12 bg-[#18181b] border-b border-[#2d2d2d] flex items-center justify-between px-4">
                {/* Left: File Tab */}
                <div className="flex items-center gap-2 h-full">
                  <div className="h-full flex items-center gap-2 px-4 border-b-2 border-neural-blue bg-[#252526] text-[#d4d4d4] text-xs font-mono cursor-pointer">
                    <span className="text-neural-blue font-bold">&lt;&gt;</span> main.m
                  </div>
                  <div className="h-full flex items-center px-4 text-[#888] hover:text-[#d4d4d4] text-xs font-mono cursor-pointer transition-colors relative group">
                    Instructions
                    {(experiment?.instructions || experiment?.theory) && (
                      <div className="absolute top-full left-0 mt-1 w-96 bg-[#252526] border border-[#333] shadow-2xl rounded-lg p-4 z-50 hidden group-hover:block max-h-[400px] overflow-y-auto">
                        {experiment.theory && (
                          <div className="mb-4">
                            <h4 className="text-neural-blue font-bold mb-2">Theory</h4>
                            <p className="text-xs text-[#d4d4d4] whitespace-pre-wrap">{experiment.theory}</p>
                          </div>
                        )}
                        {experiment.instructions && (
                          <div>
                            <h4 className="text-neural-blue font-bold mb-2">Instructions</h4>
                            <p className="text-xs text-[#d4d4d4] whitespace-pre-wrap">{experiment.instructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Saved Indicator */}
                <div className="flex items-center gap-1 text-[#666] text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-success-emerald"></div> Auto-saved
                </div>
              </div>

              {/* Monaco Editor Area */}
              <div className="flex-1 relative min-h-[350px]">
                <div className="absolute inset-0">
                  <Editor
                    height="100%"
                    width="100%"
                    language="matlab"
                    theme="vs-dark"
                    value={scriptText}
                    onChange={(val) => setScriptText(val || '')}
                    onMount={handleEditorMount}
                    options={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbersMinChars: 3,
                      padding: { top: 16 },
                      glyphMargin: true,
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </div>

              {/* Status Bar */}
              <div className="h-8 bg-[#1a1a1d] border-t border-[#2d2d2d] flex items-center px-4 gap-4 text-[10px] font-mono select-none shrink-0">
                {/* Status Pill */}
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${statusCfg.bg}`}>
                  <span className={`material-symbols-outlined text-[12px] ${statusCfg.color} ${executionStatus === 'running' ? 'animate-spin' : ''}`}>
                    {statusCfg.icon}
                  </span>
                  <span className={`font-bold uppercase tracking-wider ${statusCfg.color}`}>{statusCfg.label}</span>
                </div>

                {/* Execution Time */}
                {executionTime > 0 && executionStatus !== 'ready' && (
                  <div className="flex items-center gap-1 text-[#888]">
                    <span className="material-symbols-outlined text-[12px]">timer</span>
                    <span>{executionTime}s</span>
                  </div>
                )}

                {/* Error Count */}
                {errors.length > 0 && (
                  <button
                    onClick={() => setBottomTab('errors')}
                    className="flex items-center gap-1 text-error hover:text-error/80 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[12px]">error</span>
                    <span>{errors.length} error{errors.length !== 1 ? 's' : ''}</span>
                  </button>
                )}

                {/* Figure Count */}
                {figures.length > 0 && (
                  <button
                    onClick={() => setBottomTab('output')}
                    className="flex items-center gap-1 text-neural-blue hover:text-neural-blue/80 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[12px]">image</span>
                    <span>{figures.length} figure{figures.length !== 1 ? 's' : ''}</span>
                  </button>
                )}

                {/* Spacer + Line/Col info */}
                <div className="ml-auto text-[#666]">
                  MATLAB / Octave
                </div>
              </div>

              {/* Bottom Panel — Three Tabs */}
              <div className="h-[260px] bg-[#18181b] border-t border-[#2d2d2d] flex flex-col shrink-0">
                
                {/* Tab Headers */}
                <div className="h-9 bg-[#1e1e1e] flex items-center px-4 border-b border-[#2d2d2d] shrink-0 gap-1">
                  {(['terminal', 'output', 'errors', 'input'] as BottomTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBottomTab(tab)}
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
                        bottomTab === tab
                          ? 'text-[#d4d4d4] bg-[#18181b] border-b-2 border-neural-blue'
                          : 'text-[#666] hover:text-[#999] hover:bg-[#252526]'
                      }`}
                    >
                      {tab === 'errors' && errors.length > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-error text-white text-[8px] font-bold mr-1.5">{errors.length}</span>
                      )}
                      {tab === 'output' && figures.length > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-neural-blue text-white text-[8px] font-bold mr-1.5">{figures.length}</span>
                      )}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                  
                  <div className="ml-auto">
                    <button 
                      onClick={() => { setTerminalLines(['> System initialized. Ready.']); setFigures([]); setErrors([]); }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#333] text-[#666] transition-colors" 
                      title="Clear All"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>
                
                {/* Tab Content */}
                <div className="flex-1 overflow-auto">
                  
                  {/* INPUT TAB */}
                  {bottomTab === 'input' && (
                    <div className="p-4 h-full flex flex-col font-mono text-sm">
                      <p className="text-[#999] mb-3 text-xs uppercase tracking-wider font-bold">Standard Input (STDIN)</p>
                      <p className="text-[#666] mb-3 text-xs">If your script uses input(), type all required values here (one per line) before running.</p>
                      <textarea
                        value={stdinText}
                        onChange={(e) => setStdinText(e.target.value)}
                        placeholder="e.g.&#10;5&#10;10"
                        className="flex-1 w-full bg-[#18181b] text-[#d4d4d4] p-3 rounded-lg border border-[#333] focus:outline-none focus:border-neural-blue/50 resize-none font-mono text-[12px]"
                      />
                    </div>
                  )}

                  {/* TERMINAL TAB */}
                  {bottomTab === 'terminal' && (
                    <div className="p-4 font-mono text-[12px] leading-relaxed">
                      {terminalLines.map((line, i) => (
                        <div key={i} className={`mb-0.5 ${
                          line.startsWith('> ✓') ? 'text-success-emerald' :
                          line.startsWith('> ✗') || line.startsWith('> ⚠') ? 'text-error' :
                          line.startsWith('>') ? 'text-neural-blue' :
                          line.startsWith('---') ? 'text-[#666]' :
                          'text-[#d4d4d4]'
                        }`}>
                          {line}
                        </div>
                      ))}
                      <div className="flex items-center mt-2 text-neural-blue font-bold">
                        <span>LAB $</span>
                        <span className="w-[6px] h-[1em] bg-neural-blue ml-2 inline-block animate-pulse align-middle"></span>
                      </div>
                    </div>
                  )}
                  
                  {/* OUTPUT TAB */}
                  {bottomTab === 'output' && (
                    <div className="p-4">
                      {figures.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[16px] text-neural-blue">image</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4d4d4]">Generated Figures</span>
                          </div>
                          {figures.map((fig, i) => (
                            <div key={i} className="bg-[#252526] rounded-xl border border-[#333] p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] text-[#999] font-mono">Figure {i + 1}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => downloadBase64Image(fig, `figure-${i + 1}.png`)}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-neural-blue/10 text-neural-blue text-[10px] font-bold hover:bg-neural-blue/20 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">download</span>
                                    Download PNG
                                  </button>
                                  <button
                                    onClick={() => openFullscreen(fig)}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#333] text-[#ccc] text-[10px] font-bold hover:bg-[#444] transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">fullscreen</span>
                                    Full Screen
                                  </button>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg flex items-center justify-center p-2 max-h-[150px] overflow-hidden">
                                <img 
                                  src={fig} 
                                  alt={`Figure ${i + 1}`} 
                                  className="max-h-[140px] max-w-full object-contain cursor-pointer mix-blend-multiply"
                                  onClick={() => openFullscreen(fig)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                          {executionStatus === 'ready' ? (
                            <>
                              <span className="material-symbols-outlined text-[32px] text-[#555] mb-2">image</span>
                              <span className="text-[12px] text-[#666]">Run your code to see generated output here.</span>
                            </>
                          ) : executionStatus === 'completed' || executionStatus === 'verified' || executionStatus === 'pending' ? (
                            <>
                              <span className="material-symbols-outlined text-[32px] text-success-emerald mb-2">check_circle</span>
                              <span className="text-[12px] text-[#ccc]">Execution completed successfully.</span>
                              <span className="text-[11px] text-[#888] mt-1">No graphical output was generated.</span>
                            </>
                          ) : executionStatus === 'failed' || executionStatus === 'timeout' ? (
                            <>
                              <span className="material-symbols-outlined text-[32px] text-error mb-2">error</span>
                              <span className="text-[12px] text-[#ccc]">Execution {executionStatus === 'timeout' ? 'timed out' : 'failed'}.</span>
                              <span className="text-[11px] text-[#888] mt-1">Check the Errors tab for details.</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[32px] text-[#555] mb-2 animate-spin">sync</span>
                              <span className="text-[12px] text-[#888]">Executing...</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* ERRORS TAB */}
                  {bottomTab === 'errors' && (
                    <div className="p-4">
                      {errors.length === 0 ? (
                        <div className="flex items-center gap-2 py-6 justify-center">
                          <span className="material-symbols-outlined text-[20px] text-success-emerald">check_circle</span>
                          <span className="text-[12px] text-success-emerald font-medium">No errors</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {errors.map((err, i) => (
                            <div key={i} className="bg-[#2a1515] border border-error/20 rounded-lg p-3 flex items-start gap-3">
                              <span className="material-symbols-outlined text-[16px] text-error mt-0.5 shrink-0">warning</span>
                              <div className="flex-1 min-w-0">
                                {err.line !== null && (
                                  <span className="text-[10px] font-bold text-error/80 uppercase tracking-wider">Line {err.line}</span>
                                )}
                                <p className="text-[12px] text-[#e0b0b0] mt-0.5 break-words">{err.message}</p>
                              </div>
                              {err.line !== null && (
                                <button
                                  onClick={() => goToLine(err.line!)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold hover:bg-error/20 transition-colors shrink-0"
                                >
                                  <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                                  Go to Line
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Fullscreen Plot Modal */}
          {isPlotModalOpen && modalImage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
              <div className="bg-white p-6 rounded-3xl w-full max-w-4xl shadow-2xl border border-white/60 mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-h3 font-semibold text-primary tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-neural-blue">insights</span>
                    Generated Output
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => downloadBase64Image(modalImage, 'figure.png')}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-neural-blue/10 text-neural-blue font-label-caps text-label-caps font-bold hover:bg-neural-blue/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Download PNG
                    </button>
                    <button onClick={() => setIsPlotModalOpen(false)} className="text-secondary hover:text-primary transition-colors p-2 hover:bg-surface-container-high rounded-full">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
                <div className="w-full bg-[#f8f9fa] rounded-2xl border border-[#e5e7eb] flex items-center justify-center p-4 min-h-[400px]">
                  <img src={modalImage} alt="Generated Output" className="max-h-[600px] max-w-full object-contain mix-blend-multiply" />
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setIsPlotModalOpen(false)} className="px-6 py-2 bg-primary text-white rounded-xl font-label-caps font-bold hover:bg-primary/90 transition-colors shadow-lg">
                    Close
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
