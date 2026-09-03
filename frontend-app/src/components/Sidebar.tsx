import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  role: 'student' | 'faculty' | 'admin';
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed, setIsCollapsed }) => {
  const isFaculty = role === 'faculty';
  const isAdmin = role === 'admin';

  return (
    <nav className={`hidden md:flex flex-col fixed left-0 top-0 h-screen py-8 z-40 bg-panel-bg border-r border-border-subtle transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className={`px-4 mb-12 flex items-center justify-between ${!isCollapsed && 'px-8'}`}>
        <div className={`flex flex-col gap-2 ${isCollapsed ? 'hidden' : 'block'}`}>
          <h2 className="font-h2-mobile text-h2-mobile font-bold text-primary">DigiLab</h2>
          <span className="font-label-caps text-label-caps text-secondary uppercase">
            {isAdmin ? 'Admin Portal' : isFaculty ? 'Faculty Portal' : 'Virtual Lab'}
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
        <NavLink 
          end 
          to={isAdmin ? "/admin" : isFaculty ? "/faculty" : "/"} 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
          } 
          title="Dashboard"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Dashboard</span>}
        </NavLink>
        
        {isAdmin && (
          <div className="space-y-4">
            {/* OVERVIEW */}


            {/* PEOPLE */}
            <div>
              {!isCollapsed && <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-4 mb-2">People</span>}
              <div className="space-y-1">
                <NavLink 
                  to="/admin/faculty" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Faculty Management"
                >
                  <span className="material-symbols-outlined">supervisor_account</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Faculty</span>}
                </NavLink>
                <NavLink 
                  to="/admin/students" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Student Management"
                >
                  <span className="material-symbols-outlined">school</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Students</span>}
                </NavLink>
              </div>
            </div>

            {/* ACADEMICS */}
            <div>
              {!isCollapsed && <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-4 mb-2">Academics</span>}
              <div className="space-y-1">
                <NavLink 
                  to="/admin/departments" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Departments"
                >
                  <span className="material-symbols-outlined">domain</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Departments</span>}
                </NavLink>
                <NavLink 
                  to="/admin/semesters" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Semesters"
                >
                  <span className="material-symbols-outlined">date_range</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Semesters</span>}
                </NavLink>
                <NavLink 
                  to="/admin/courses" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Courses"
                >
                  <span className="material-symbols-outlined">menu_book</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Courses</span>}
                </NavLink>
                <NavLink 
                  to="/admin/labs" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Labs"
                >
                  <span className="material-symbols-outlined">biotech</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Labs</span>}
                </NavLink>
                <NavLink 
                  to="/admin/experiments" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Experiments"
                >
                  <span className="material-symbols-outlined">science</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Experiments</span>}
                </NavLink>
              </div>
            </div>

            {/* ENGAGEMENT */}
            <div>
              {!isCollapsed && <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-4 mb-2">Engagement</span>}
              <div className="space-y-1">
                <NavLink 
                  to="/schedule" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Calendar"
                >
                  <span className="material-symbols-outlined">calendar_today</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Calendar</span>}
                </NavLink>
                <NavLink 
                  to="/announcements" 
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                  } 
                  title="Announcements"
                >
                  <span className="material-symbols-outlined">campaign</span>
                  {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Announcements</span>}
                </NavLink>
              </div>
            </div>
          </div>
        )}

        {!isAdmin && (
          <>
            {isFaculty && (
              <NavLink 
                to="/manage-labs" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                } 
                title="Manage Labs"
              >
                <span className="material-symbols-outlined">science</span>
                {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Manage Labs</span>}
              </NavLink>
            )}
            <NavLink 
              to={isFaculty ? "/submissions" : "/assignments"} 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
              } 
              title={isFaculty ? 'Submissions' : 'Assignments'}
            >
              <span className="material-symbols-outlined">assignment</span>
              {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">{isFaculty ? 'Submissions' : 'Assignments'}</span>}
            </NavLink>
            {isFaculty && (
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                } 
                title="Analytics"
              >
                <span className="material-symbols-outlined">analytics</span>
                {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Analytics</span>}
              </NavLink>
            )}
            <NavLink 
              to="/schedule" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
              } 
              title="Schedule"
            >
              <span className="material-symbols-outlined">calendar_today</span>
              {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Schedule</span>}
            </NavLink>
            <NavLink 
              to={isFaculty ? "/announcements" : "/updates"} 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
              } 
              title={isFaculty ? 'Announcements' : 'Updates'}
            >
              <span className="material-symbols-outlined">campaign</span>
              {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">{isFaculty ? 'Announcements' : 'Updates'}</span>}
            </NavLink>
            {!isFaculty && (
              <NavLink 
                to="/helpdesk" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
                } 
                title="Helpdesk"
              >
                <span className="material-symbols-outlined">support_agent</span>
                {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Helpdesk</span>}
              </NavLink>
            )}
          </>
        )}
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
          } 
          title="Profile"
        >
          <span className="material-symbols-outlined">account_circle</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Profile</span>}
        </NavLink>
      </div>
      <div className={`px-4 space-y-2 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 duration-200 rounded-lg ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-surface-container-high transition-all'} ${isCollapsed ? 'justify-center w-12 h-12 p-0' : ''}`
          } 
          title="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
          {!isCollapsed && <span className="font-label-caps text-label-caps uppercase">Settings</span>}
        </NavLink>
      </div>
    </nav>
  );
};
