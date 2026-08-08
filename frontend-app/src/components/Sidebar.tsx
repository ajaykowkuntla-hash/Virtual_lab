import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  role: 'student' | 'faculty';
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed, setIsCollapsed }) => {
  const isFaculty = role === 'faculty';

  return (
    <nav className={`hidden md:flex flex-col fixed left-0 top-0 h-screen py-8 z-40 bg-panel-bg border-r border-border-subtle transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className={`px-4 mb-12 flex items-center justify-between ${!isCollapsed && 'px-8'}`}>
        <div className={`flex flex-col gap-2 ${isCollapsed ? 'hidden' : 'block'}`}>
          <h2 className="font-h2-mobile text-h2-mobile font-bold text-primary">DigiLab</h2>
          <span className="font-label-caps text-label-caps text-secondary uppercase">
            {isFaculty ? 'Faculty Portal' : 'Virtual Lab'}
          </span>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-secondary hover:text-primary p-2 rounded-lg hover:bg-surface-container-high transition-colors mx-auto"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span className="material-symbols-outlined">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>
      
      <div className={`flex-1 px-4 space-y-2 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
        <NavLink to={isFaculty ? "/faculty" : "/"} className={({ isActive }) => 
          `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
        } title="Dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Dashboard</span>}
        </NavLink>
        <NavLink to={isFaculty ? "/manage-labs" : "/lab/exp_1_dsp"} className={`flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title={isFaculty ? 'Manage Labs' : 'Virtual Lab'}>
          <span className="material-symbols-outlined">science</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">{isFaculty ? 'Manage Labs' : 'Virtual Lab'}</span>}
        </NavLink>
        <NavLink to={isFaculty ? "/submissions" : "/assignments"} className={({ isActive }) => `flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title={isFaculty ? 'Submissions' : 'Assignments'}>
          <span className="material-symbols-outlined">assignment</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">{isFaculty ? 'Submissions' : 'Assignments'}</span>}
        </NavLink>
        {isFaculty && (
          <NavLink to="/analytics" className={({ isActive }) => `flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title="Analytics">
            <span className="material-symbols-outlined">analytics</span>
            {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Analytics</span>}
          </NavLink>
        )}
        <NavLink to={isFaculty ? "/schedule" : "/timetable"} className={({ isActive }) => `flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title={isFaculty ? 'Schedule' : 'Timetable'}>
          <span className="material-symbols-outlined">calendar_today</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">{isFaculty ? 'Schedule' : 'Timetable'}</span>}
        </NavLink>
        <NavLink to={isFaculty ? "/announcements" : "/updates"} className={({ isActive }) => `flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title={isFaculty ? 'Announcements' : 'Updates'}>
          <span className="material-symbols-outlined">campaign</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">{isFaculty ? 'Announcements' : 'Updates'}</span>}
        </NavLink>
        {!isFaculty && (
          <NavLink to="/helpdesk" className={({ isActive }) => `flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title="Helpdesk">
            <span className="material-symbols-outlined">support_agent</span>
            {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Helpdesk</span>}
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title="Profile">
          <span className="material-symbols-outlined">account_circle</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Profile</span>}
        </NavLink>
      </div>
      <div className={`px-4 space-y-2 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : ''} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`} title="Settings">
          <span className="material-symbols-outlined">settings</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Settings</span>}
        </NavLink>
      </div>
    </nav>
  );
};
