import React, { useState, useEffect } from 'react';
import { BackgroundOrbs } from './BackgroundOrbs';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  role: 'student' | 'faculty';
  fullWidth?: boolean;
  breadcrumbs?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, fullWidth = false, breadcrumbs }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <>
      <BackgroundOrbs />
      <Sidebar role={role} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <TopBar role={role} isCollapsed={isCollapsed} breadcrumbs={breadcrumbs} />
      
      <main className={`flex-1 relative z-10 pt-[72px] min-h-screen flex flex-col bg-transparent transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        <div className={`${fullWidth ? 'p-4 md:p-6 max-w-none' : 'p-8 md:p-12 max-w-[1200px]'} mx-auto w-full space-y-10 flex-1 flex flex-col`}>
          {children}
        </div>
      </main>
    </>
  );
};
