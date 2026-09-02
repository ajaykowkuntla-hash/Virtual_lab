import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const Profile: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const role = user?.role === 'admin' ? 'admin' : (user?.role === 'faculty' ? 'faculty' : 'student');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    program: user?.program || '',
    email: user?.email || '',
    contact_number: user?.contact_number || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshUser();
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout role={role}>
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          My Profile
        </h1>
        <p className="font-body-lg text-secondary">Manage your personal information and academic credentials.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        {/* Profile Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-neural-blue to-neural-purple p-1 mb-6 shadow-lg">
            <div className="w-full h-full bg-surface-container rounded-full flex items-center justify-center border-4 border-background overflow-hidden">
              <span className="material-symbols-outlined text-[64px] text-secondary">account_circle</span>
            </div>
          </div>
          <h2 className="text-h2 font-semibold text-primary">{user?.name || user?.username || 'User'}</h2>
          <span className="px-3 py-1 bg-neural-blue/10 text-neural-blue rounded-full font-label-caps text-label-caps uppercase mt-3">
            {role}
          </span>

          <div className="w-full mt-8 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border-subtle">
              <span className="text-secondary font-body-sm">RFID Tag ID</span>
              <span className="font-mono-metrics text-mono-metrics text-primary bg-surface-container px-2 py-1 rounded">{user?.rfid_tag_id || 'NOT LINKED'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-subtle">
              <span className="text-secondary font-body-sm">Username</span>
              <span className="font-body-sm text-primary">{user?.username}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-subtle">
              <span className="text-secondary font-body-sm">Status</span>
              <span className="flex items-center gap-2 font-body-sm text-success-emerald">
                <span className="w-2 h-2 rounded-full bg-success-emerald animate-pulse"></span> Active
              </span>
            </div>
          </div>
        </div>

        {/* Details & Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-lg">
            <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">school</span>
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Department</label>
                <div className="bg-surface-container px-4 py-3 rounded-xl border border-border-subtle text-primary">{user?.department || 'Not specified'}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Program</label>
                <div className="bg-surface-container px-4 py-3 rounded-xl border border-border-subtle text-primary">{user?.program || 'Not specified'}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Email Address</label>
                <div className="bg-surface-container px-4 py-3 rounded-xl border border-border-subtle text-primary">{user?.email || `${user?.username || 'user'}@university.edu`}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Contact Number</label>
                <div className="bg-surface-container px-4 py-3 rounded-xl border border-border-subtle text-primary">{user?.contact_number || 'Not specified'}</div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => {
                  setFormData({
                    name: user?.name || '',
                    department: user?.department || '',
                    program: user?.program || '',
                    email: user?.email || '',
                    contact_number: user?.contact_number || ''
                  });
                  setIsEditing(true);
                }}
                className="px-6 py-3 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all"
              >
                Edit Details
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Edit Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-white/60 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-h3 font-semibold text-primary tracking-tight">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-secondary hover:text-primary transition-colors p-2 hover:bg-surface-container-high rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-container px-4 py-3 rounded-xl border border-border-subtle focus:border-neural-blue focus:ring-1 focus:ring-neural-blue outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Department</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-surface-container px-4 py-3 rounded-xl border border-border-subtle focus:border-neural-blue focus:ring-1 focus:ring-neural-blue outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Program</label>
                <input 
                  type="text" 
                  value={formData.program}
                  onChange={e => setFormData({...formData, program: e.target.value})}
                  className="w-full bg-surface-container px-4 py-3 rounded-xl border border-border-subtle focus:border-neural-blue focus:ring-1 focus:ring-neural-blue outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-surface-container px-4 py-3 rounded-xl border border-border-subtle focus:border-neural-blue focus:ring-1 focus:ring-neural-blue outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Contact Number</label>
                <input 
                  type="text" 
                  value={formData.contact_number}
                  onChange={e => setFormData({...formData, contact_number: e.target.value})}
                  className="w-full bg-surface-container px-4 py-3 rounded-xl border border-border-subtle focus:border-neural-blue focus:ring-1 focus:ring-neural-blue outline-none transition-all"
                />
              </div>
              
              <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-border-subtle">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-surface-container text-primary rounded-xl font-label-caps font-bold hover:bg-border-subtle transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-label-caps font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
