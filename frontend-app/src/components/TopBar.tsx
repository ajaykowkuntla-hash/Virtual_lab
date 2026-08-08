import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  role: 'student' | 'faculty';
  isCollapsed: boolean;
  breadcrumbs?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ role, isCollapsed, breadcrumbs }) => {
  const isFaculty = role === 'faculty';
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`fixed top-0 z-50 flex justify-between items-center px-edge_margin h-[72px] bg-white/25 backdrop-blur-3xl border-b border-border-subtle transition-all duration-300 ${isCollapsed ? 'left-0 md:left-20 w-full md:w-[calc(100%-80px)]' : 'left-0 md:left-72 w-full md:w-[calc(100%-288px)]'}`}>
      <div className="flex items-center gap-4 flex-1">
        <h2 className="md:hidden font-h3 text-h3 font-semibold text-primary">LabCentral</h2>
        {breadcrumbs ? (
          <div className="hidden md:flex items-center text-secondary font-body-md">
            {breadcrumbs}
          </div>
        ) : (
          <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full w-full border border-border-subtle max-w-xs">
            <span className="material-symbols-outlined text-secondary">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 outline-none text-body-md w-full ml-2" 
              placeholder={isFaculty ? "Search students, submissions..." : "Search labs, assignments..."} 
              type="text" 
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={handleLogout}
          className="text-xs bg-error-container text-on-error-container hover:bg-error/20 px-3 py-1 rounded-full transition-colors font-semibold flex items-center gap-1"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[14px]">logout</span>
          Sign Out
        </button>
        <button className="text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <button className="text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-neural-pink rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-border-subtle mx-2 hidden md:block"></div>
        <button className="flex items-center gap-2 hover:bg-surface-container-low p-1 pr-3 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-neural-purple flex items-center justify-center text-white font-bold text-sm uppercase">
            {user?.username ? user.username.charAt(0) : (isFaculty ? 'V' : 'A')}
          </div>
          <span className="hidden md:block font-label-caps text-label-caps">
            {user?.username || (isFaculty ? 'Dr. Vance' : 'Alex')}
          </span>
        </button>
      </div>
    </header>
  );
};
