import React, { useState } from 'react';
import { Layout } from '../components/Layout';

export const Helpdesk: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  const faqs = [
    { q: 'How do I submit my lab report?', a: 'Go to the Virtual Lab page and click the "Upload Report" button on the right side of the screen once you have successfully validated your code.' },
    { q: 'My code is failing validation but looks correct. What do I do?', a: 'Make sure your output exactly matches the expected format, including spacing and array dimensions. You can check the expected output structure in the lab instructions.' },
    { q: 'How do I connect the IoT hardware?', a: 'If you are in the physical lab, use the provided USB cable to connect the ESP32 to your workstation. Select the COM port in the Virtual Lab interface.' }
  ];

  return (
    <Layout role="student">
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Helpdesk Support
        </h1>
        <p className="font-body-lg text-secondary">Get assistance with labs, hardware, and platform issues.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-in-up stagger-2">
        {/* Support Ticket Form */}
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            Create a Support Ticket
          </h3>
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Subject</label>
              <input 
                type="text" 
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Brief summary of your issue..."
                className="w-full p-3 bg-surface-container rounded-xl border border-border-subtle text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Description</label>
              <textarea 
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder="Describe your issue in detail. Include any error messages you see."
                className="w-full h-40 p-3 bg-surface-container rounded-xl border border-border-subtle text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-3 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">send</span>
                Submit Ticket
              </button>
            </div>
          </form>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg">
            <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">help</span>
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group bg-surface-container rounded-2xl border border-border-subtle overflow-hidden">
                  <summary className="font-body-md font-semibold text-primary p-4 cursor-pointer hover:bg-surface-container-high transition-colors list-none flex justify-between items-center">
                    {faq.q}
                    <span className="material-symbols-outlined text-secondary group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="p-4 pt-0 text-secondary font-body-sm bg-surface-container border-t border-border-subtle mt-1">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-sm flex items-center gap-4 bg-neural-blue/5 border-neural-blue/20">
            <div className="w-12 h-12 rounded-full bg-neural-blue/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-neural-blue text-[24px]">contact_support</span>
            </div>
            <div>
              <p className="font-body-md font-semibold text-primary">Need urgent help?</p>
              <p className="text-sm text-secondary">Contact the lab admin directly at <a href="#" className="text-neural-blue hover:underline">admin@virtuallab.edu</a></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
