import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { BackgroundOrbs } from '../components/BackgroundOrbs';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(response.data.access_token);
      // App.tsx routing will handle the redirect based on context change
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-canvas-bg">
      <BackgroundOrbs />
      
      <div className="glass-panel w-full max-w-md p-8 md:p-12 rounded-3xl relative z-10 fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-h2-mobile font-h1 font-bold text-primary mb-2">DigiLab</h1>
          <p className="text-secondary font-body-md">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-secondary uppercase block">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-white/50 border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-neural-blue/50 transition-all"
              placeholder="e.g. drvance or student1"
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-secondary uppercase block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/50 border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-neural-blue/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white rounded-xl py-4 font-label-caps text-label-caps uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <>
                Sign In
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-secondary">
          Demo Accounts:<br/>
          Faculty: <span className="font-bold">drvance</span> / <span className="font-bold">securepassword</span><br/>
          Student: <span className="font-bold">student1</span> / <span className="font-bold">password123</span>
        </div>
      </div>
    </div>
  );
};
