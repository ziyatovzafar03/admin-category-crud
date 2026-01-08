
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium animate-pulse">
        Kuting, ma'lumotlar yuklanmoqda...
      </p>
    </div>
  );
};

export default LoadingScreen;
