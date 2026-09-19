import React from 'react';
import { Layout } from '../components/Layout';

const Environments: React.FC = () => {
  return (
    <Layout role="student">
      <div className="flex flex-col h-full max-w-6xl mx-auto py-12 fade-in-up stagger-1">
        <div className="mb-12 space-y-4">
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-tight">
            Environment Catalog
          </h1>
          <p className="text-secondary font-body-lg max-w-2xl">
            Explore the specialized engines and simulators available across various experiments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MATLAB Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-neural-blue/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-neural-blue">functions</span>
            </div>
            <h3 className="text-h3 font-semibold text-primary mb-2">MATLAB / Octave</h3>
            <p className="text-secondary font-body-md mb-8 flex-1">
              Advanced mathematical computing environment for signal processing, control systems, and data analysis.
            </p>
            <div className="text-neural-blue font-label-caps text-label-caps font-bold cursor-not-allowed opacity-70 flex items-center">
              View Environment <span className="material-symbols-outlined text-[16px] ml-1">info</span>
            </div>
          </div>

          {/* Python Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-success-emerald/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-success-emerald">code_blocks</span>
            </div>
            <h3 className="text-h3 font-semibold text-primary mb-2">Python Data Science</h3>
            <p className="text-secondary font-body-md mb-8 flex-1">
              Jupyter-style environment preloaded with NumPy, Pandas, and Matplotlib for machine learning and scripting.
            </p>
            <div className="text-success-emerald font-label-caps text-label-caps font-bold cursor-not-allowed opacity-70 flex items-center">
              View Environment <span className="material-symbols-outlined text-[16px] ml-1">info</span>
            </div>
          </div>

          {/* IoT Builder Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-warning-amber/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-warning-amber">memory</span>
            </div>
            <h3 className="text-h3 font-semibold text-primary mb-2">IoT Builder</h3>
            <p className="text-secondary font-body-md mb-8 flex-1">
              Drag-and-drop hardware simulator. Build circuits, wire microcontrollers, and deploy firmware instantly.
            </p>
            <div className="text-warning-amber font-label-caps text-label-caps font-bold cursor-not-allowed opacity-70 flex items-center">
              View Environment <span className="material-symbols-outlined text-[16px] ml-1">info</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Environments;
