import React from 'react';

export const BackgroundOrbs: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neural-blue orb-blur mix-blend-multiply animate-float-1"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-neural-purple orb-blur mix-blend-multiply animate-float-2"></div>
    </div>
  );
};
