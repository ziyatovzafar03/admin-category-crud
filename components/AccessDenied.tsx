
import React from 'react';

const AccessDenied: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-slate-950">
      <div className="w-24 h-24 mb-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">Kirish taqiqlangan</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
        {message || "Profilingiz tasdiqlanmagan. Iltimos, administrator bilan bog'laning."}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-brand-500/25"
      >
        Qayta urinib ko'rish
      </button>
    </div>
  );
};

export default AccessDenied;
