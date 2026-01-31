import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, Sparkles } from 'lucide-react';

const UpdateHandler: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // If there's a new version, this banner pops up in the sidebar
  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="mx-4 my-4 p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 border border-blue-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={18} className="text-blue-200" />
          <span className="text-xs font-black uppercase tracking-widest">
            {needRefresh ? "System Update Ready" : "Ready for Offline"}
          </span>
        </div>
        
        <p className="text-[11px] text-blue-100 font-medium leading-relaxed">
          {needRefresh 
            ? "A new version of the Management System is available with latest changes." 
            : "The system is now cached and fully available for offline use."}
        </p>

        <div className="flex gap-2">
          {needRefresh ? (
            <button
              onClick={() => updateServiceWorker(true)}
              className="flex-1 bg-white text-blue-600 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <RefreshCcw size={12} /> Update Now
            </button>
          ) : (
            <button
              onClick={close}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-400 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateHandler;