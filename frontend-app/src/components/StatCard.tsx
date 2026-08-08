import React from 'react';

interface StatCardProps {
  icon: string;
  iconColor: string;
  badge?: React.ReactNode;
  value: string | number;
  label: string;
  staggerIndex: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, iconColor, badge, value, label, staggerIndex }) => {
  return (
    <div className={`glass-panel rounded-3xl p-6 shadow-lg shadow-black/5 flex flex-col gap-4 fade-in-up stagger-${staggerIndex}`}>
      <div className="flex items-center justify-between">
        <span className={`material-symbols-outlined ${iconColor} text-[24px]`}>{icon}</span>
        {badge}
      </div>
      <div>
        <div className="text-[32px] font-semibold text-primary">{value}</div>
        <div className="font-label-caps text-label-caps text-secondary uppercase">{label}</div>
      </div>
    </div>
  );
};
