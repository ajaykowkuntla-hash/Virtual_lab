import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role === 'admin' ? 'admin' : (user?.role === 'faculty' ? 'faculty' : 'student');

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout role={role}>
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Settings
        </h1>
        <p className="font-body-lg text-secondary">Manage your application preferences and security.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in-up stagger-2">
        {/* Sidebar Nav for Settings */}
        <div className="glass-panel p-4 rounded-3xl border border-white/60 shadow-lg h-fit">
          <nav className="flex flex-col space-y-2">
            <button onClick={() => alert('Settings saved successfully!')} className="px-6 py-3 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all mb-4">
              Save Changes
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-label-caps text-label-caps">
              <span className="material-symbols-outlined text-[18px]">tune</span> General
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:bg-surface-container-high font-label-caps text-label-caps transition-colors">
              <span className="material-symbols-outlined text-[18px]">lock</span> Security
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:bg-surface-container-high font-label-caps text-label-caps transition-colors">
              <span className="material-symbols-outlined text-[18px]">notifications</span> Notifications
            </button>
            <div className="h-px bg-border-subtle my-2 mx-4"></div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 font-label-caps text-label-caps transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Notifications */}
          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg">
            <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              Notification Preferences
            </h3>
            
            <div className="flex items-center justify-between py-4 border-b border-border-subtle">
              <div>
                <p className="font-body-md font-semibold text-primary">Push Notifications</p>
                <p className="font-body-sm text-secondary">Receive real-time updates for labs and grades.</p>
              </div>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-surface-container-high border border-border-subtle'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-body-md font-semibold text-primary">Email Alerts</p>
                <p className="font-body-sm text-secondary">Get a daily digest of announcements and schedules.</p>
              </div>
              <button 
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${emailAlerts ? 'bg-primary' : 'bg-surface-container-high border border-border-subtle'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
