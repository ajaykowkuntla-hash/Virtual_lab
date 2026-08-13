import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { apiClient } from '../api/client';

interface MultiLangIDEProps {
  onReturn: () => void;
}

const languageConfigs: Record<string, { name: string; defaultCode: string; ext: string }> = {
  python: {
    name: 'Python',
    ext: 'main.py',
    defaultCode: `# Python IDE\n\ndef main():\n    print("Hello from Python!")\n\nif __name__ == "__main__":\n    main()\n`
  },
  c: {
    name: 'C',
    ext: 'main.c',
    defaultCode: `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n`
  },
  cpp: {
    name: 'C++',
    ext: 'main.cpp',
    defaultCode: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n`
  },
  java: {
    name: 'Java',
    ext: 'Main.java',
    defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n`
  }
};

export const MultiLangIDE: React.FC<MultiLangIDEProps> = ({ onReturn }) => {
  const [activeFilename, setActiveFilename] = useState<string>('main.py');
  const [language, setLanguage] = useState<string>('python');
  const [fileCodes, setFileCodes] = useState<Record<string, string>>({
    'main.py': languageConfigs['python'].defaultCode
  });
  const [openFiles, setOpenFiles] = useState<{name: string, lang: string}[]>([{name: 'main.py', lang: 'python'}]);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [stdin, setStdin] = useState<string>('');
  const [activeFile, setActiveFile] = useState<'code' | 'input'>('code');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'output'>('terminal');
  const [output, setOutput] = useState<{ type: 'system' | 'stdout' | 'stderr' | 'error'; text: string }[]>([
    { type: 'system', text: '> IDE initialized. Ready.' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAITutor, setShowAITutor] = useState(true); // Keep AI Tutor as placeholder

  const switchFile = (name: string, lang: string) => {
    setActiveFilename(name);
    setLanguage(lang);
    setActiveFile('code');
  };

  const switchLanguage = (lang: string) => {
    setLanguage(lang);
    const newFileName = languageConfigs[lang].ext;
    if (!openFiles.some(f => f.name === newFileName)) {
      setOpenFiles(prev => [...prev, { name: newFileName, lang }]);
      setFileCodes(prev => ({ ...prev, [newFileName]: languageConfigs[lang].defaultCode }));
    }
    setActiveFilename(newFileName);
    setActiveFile('code');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchLanguage(e.target.value);
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(prev => [...prev, { type: 'system', text: `> Running ${activeFilename}...` }]);

    try {
      const response = await apiClient.post<{ 
        stdout: string | null; 
        stderr: string | null; 
        compile_output: string | null;
        exit_status: number;
        execution_time: number;
      }>('/lab/code/execute', {
        language,
        source_code: fileCodes[activeFilename],
        stdin: stdin,
        filename: activeFilename
      });

      const { stdout, stderr, compile_output, exit_status, execution_time } = response.data;

      if (compile_output) {
        setOutput(prev => [...prev, { type: 'stderr', text: compile_output }]);
      }
      if (stderr) {
        setOutput(prev => [...prev, { type: 'stderr', text: stderr }]);
      }
      if (stdout) {
        setOutput(prev => [...prev, { type: 'stdout', text: stdout }]);
      }

      const statusColor = exit_status === 0 ? 'system' : 'error';
      setOutput(prev => [...prev, { 
        type: statusColor, 
        text: `> Execution completed with code ${exit_status} (${execution_time}s)` 
      }]);

    } catch (err: any) {
      setOutput(prev => [...prev, { 
        type: 'error', 
        text: `Error connecting to execution engine: ${err.message || 'Unknown error'}` 
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const activeConfig = languageConfigs[language];

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas-bg overflow-hidden relative font-body-md rounded-2xl border border-white/60 shadow-2xl glass-panel">
      {/* IDE Toolbar */}
      <div className="h-[64px] bg-white/40 flex items-center justify-between px-6 shrink-0 border-b border-border-subtle z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-h3 font-semibold text-primary">
            <div className="w-10 h-10 rounded-xl bg-neural-blue/10 text-neural-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">code</span>
            </div>
            Multi-Language IDE
          </div>
          <div className="h-6 w-px bg-border-subtle mx-2"></div>
          
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="bg-surface-container hover:bg-surface-container-high border border-border-subtle text-primary font-label-caps text-label-caps rounded-full px-4 py-2 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-neural-blue/50"
          >
            {Object.entries(languageConfigs).map(([key, conf]) => (
              <option key={key} value={key}>{conf.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`bg-neural-blue text-white hover:brightness-105 px-8 py-2.5 rounded-full font-label-caps font-bold text-label-caps flex items-center gap-2 transition-all shadow-lg ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isRunning ? 'hourglass_empty' : 'play_arrow'}
            </span>
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          
          <button onClick={onReturn} className="w-10 h-10 rounded-full flex items-center justify-center border border-border-subtle text-secondary hover:bg-surface-container-low transition-colors" title="Exit IDE">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Internal Layout Grid */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Left Sidebar (File Explorer) */}
        <div className="w-[240px] bg-white/60 rounded-2xl shrink-0 border border-border-subtle flex flex-col shadow-sm relative overflow-hidden hidden md:flex">
          <div className="p-4 flex justify-between items-center border-b border-border-subtle bg-surface-container-low/50">
            <span className="font-label-caps text-label-caps font-bold text-primary">Explorer</span>
            <button 
              onClick={() => setIsAddingFile(!isAddingFile)} 
              className="w-6 h-6 rounded-md hover:bg-border-subtle flex items-center justify-center transition-colors text-secondary"
              title="Add File"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          {isAddingFile && (
            <div className="p-2 border-b border-border-subtle bg-surface-container flex flex-col gap-2">
              <input 
                autoFocus
                type="text"
                placeholder="Filename (e.g. app.py)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFileName) {
                    const ext = newFileName.split('.').pop()?.toLowerCase();
                    let lang = 'python';
                    if (ext === 'c') lang = 'c';
                    else if (ext === 'cpp') lang = 'cpp';
                    else if (ext === 'java') lang = 'java';
                    
                    if (!openFiles.some(f => f.name === newFileName)) {
                      setOpenFiles(prev => [...prev, { name: newFileName, lang }]);
                      if (!fileCodes[newFileName]) {
                        setFileCodes(prev => ({ ...prev, [newFileName]: languageConfigs[lang]?.defaultCode || '' }));
                      }
                    }
                    switchFile(newFileName, lang);
                    setNewFileName('');
                    setIsAddingFile(false);
                  } else if (e.key === 'Escape') {
                    setIsAddingFile(false);
                    setNewFileName('');
                  }
                }}
                className="w-full bg-white border border-border-subtle rounded-md px-2 py-1 text-sm outline-none text-primary"
              />
              <span className="text-[10px] text-secondary px-1">Press Enter to save</span>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-2 font-body-md text-[14px]">
            {openFiles.map(fileObj => {
              const isActiveLanguage = activeFilename === fileObj.name;
              const isEditingThisCode = isActiveLanguage && activeFile === 'code';
              return (
                <div 
                  key={fileObj.name} 
                  onClick={() => switchFile(fileObj.name, fileObj.lang)}
                  className={`flex items-center gap-2 py-2 px-3 mb-1 cursor-pointer rounded-xl font-medium transition-colors ${isEditingThisCode ? 'bg-neural-blue/10 text-neural-blue' : 'hover:bg-surface-container-low text-secondary'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isEditingThisCode ? 'description' : 'article'}
                  </span>
                  <span>{fileObj.name}</span>
                </div>
              );
            })}
            <div className="h-px bg-border-subtle my-2 mx-2"></div>
            <div 
              onClick={() => setActiveFile('input')}
              className={`flex items-center gap-2 py-2 px-3 mb-1 cursor-pointer rounded-xl font-medium transition-colors ${activeFile === 'input' ? 'bg-neural-blue/10 text-neural-blue' : 'hover:bg-surface-container-low text-secondary'}`}
            >
              <span className="material-symbols-outlined text-[20px]">input</span>
              <span>input.txt</span>
            </div>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] rounded-2xl border border-border-subtle shadow-inner relative overflow-hidden">
          
          {/* Editor Tabs */}
          <div className="flex bg-[#252526] border-b border-[#333] overflow-x-auto shrink-0 select-none pt-2 px-2 gap-1">
            <div 
              onClick={() => setActiveFile('code')}
              className={`flex items-center px-4 py-2 bg-[#1e1e1e] rounded-t-xl min-w-[120px] max-w-[200px] cursor-pointer ${activeFile === 'code' ? 'text-[#d4d4d4] border-t-2 border-neural-blue' : 'text-[#666] hover:text-[#d4d4d4] hover:bg-[#2a2a2b]'}`}
            >
              <span className={`material-symbols-outlined text-[16px] mr-2 ${activeFile === 'code' ? 'text-neural-blue' : ''}`}>code</span>
              <span className="font-mono-metrics text-[13px] truncate font-bold">{activeFilename}</span>
            </div>
            <div 
              onClick={() => setActiveFile('input')}
              className={`flex items-center px-4 py-2 bg-[#1e1e1e] rounded-t-xl min-w-[120px] max-w-[200px] cursor-pointer ${activeFile === 'input' ? 'text-[#d4d4d4] border-t-2 border-neural-blue' : 'text-[#666] hover:text-[#d4d4d4] hover:bg-[#2a2a2b]'}`}
            >
              <span className={`material-symbols-outlined text-[16px] mr-2 ${activeFile === 'input' ? 'text-neural-blue' : ''}`}>input</span>
              <span className="font-mono-metrics text-[13px] truncate font-bold">input.txt</span>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={activeFile === 'input' ? 'text' : (language === 'c' ? 'c' : language === 'cpp' ? 'cpp' : language)}
              theme="vs-dark"
              value={activeFile === 'input' ? stdin : fileCodes[activeFilename]}
              onChange={(val) => {
                if (activeFile === 'input') {
                  setStdin(val || '');
                } else {
                  setFileCodes(prev => ({ ...prev, [activeFilename]: val || '' }));
                }
              }}
              options={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                padding: { top: 16 }
              }}
            />
          </div>

          {/* Bottom Panel (Terminal) */}
          <div className="h-[220px] shrink-0 border-t border-[#333] flex flex-col bg-[#18181b] relative">
            <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-[#333] shrink-0 font-label-caps text-label-caps gap-6">
              <button 
                onClick={() => setBottomTab('terminal')}
                className={`pb-1 ${bottomTab === 'terminal' ? 'text-[#d4d4d4] font-bold border-b-2 border-neural-blue' : 'text-[#666] hover:text-[#d4d4d4] transition-colors'}`}
              >Terminal</button>
              <button 
                onClick={() => setBottomTab('output')}
                className={`pb-1 ${bottomTab === 'output' ? 'text-[#d4d4d4] font-bold border-b-2 border-neural-blue' : 'text-[#666] hover:text-[#d4d4d4] transition-colors'}`}
              >Output</button>
              <div className="ml-auto flex gap-2">
                <button onClick={() => setOutput([])} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#333] text-[#666]" title="Clear Terminal">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 text-[#d4d4d4] font-mono-metrics text-[13px] p-4 overflow-auto whitespace-pre-wrap leading-relaxed">
              {output
                .filter(line => bottomTab === 'terminal' || (line.type === 'stdout' || line.type === 'stderr'))
                .map((line, i) => (
                <div key={i} className={`mb-1 ${
                  line.type === 'system' ? 'text-success-emerald' : 
                  line.type === 'error' || line.type === 'stderr' ? 'text-error' : 
                  'text-[#d4d4d4]'
                }`}>
                  {line.type === 'stdout' || line.type === 'stderr' ? line.text : line.text}
                </div>
              ))}
              <div className="flex items-center mt-2 text-neural-blue font-bold">
                <span className="mr-2">LAB-402 $</span>
                <span className="w-[6px] h-[1em] bg-neural-blue inline-block animate-pulse align-middle"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (AI Tutor) */}
        {showAITutor && (
          <div className="w-[280px] bg-white/60 rounded-2xl shrink-0 border border-border-subtle flex flex-col shadow-sm relative overflow-hidden hidden lg:flex">
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface-container-low/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neural-purple/10 text-neural-purple flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <span className="font-label-caps text-label-caps font-bold text-primary">AI Tutor</span>
              </div>
              <button onClick={() => setShowAITutor(false)} className="w-6 h-6 rounded-full hover:bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              <div className="bg-white rounded-xl p-3 font-body-md text-[14px] text-secondary shadow-sm border border-border-subtle leading-relaxed">
                Hello! I'm your AI tutor. I notice you're working on `{activeConfig.ext}`. Let me know if you need help understanding compiler errors or optimizing your code!
              </div>
            </div>
            <div className="p-3 border-t border-border-subtle bg-surface-container-low/30">
              <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 border border-border-subtle shadow-sm">
                <input className="bg-transparent border-none outline-none text-sm w-full placeholder:text-secondary/50 text-primary" placeholder="Ask AI..." type="text" disabled />
                <button className="text-neural-purple hover:text-neural-purple/80 cursor-not-allowed"><span className="material-symbols-outlined text-[20px]">send</span></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
