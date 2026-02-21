import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, WifiOff, Clock } from 'lucide-react';
import { db } from "../firebase";
import { onSnapshotsInSync } from "firebase/firestore";

const SyncStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [isSynced, setIsSynced] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = onSnapshotsInSync(db, () => {
      setIsSynced(true);
      setLastSynced(new Date());
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // Simple formatter for the time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
        <WifiOff size={14} strokeWidth={3} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
        isSynced 
          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
          : "bg-blue-50 text-blue-600 border-blue-100 shadow-sm"
      }`}>
        {isSynced ? (
          <Cloud size={14} strokeWidth={3} />
        ) : (
          <RefreshCw size={14} strokeWidth={3} className="animate-spin" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {isSynced ? "Cloud Synced" : "Updating..."}
        </span>
      </div>
      
      {lastSynced && isSynced && (
        <div className="flex items-center gap-1 text-gray-400 mr-2">
          <Clock size={10} />
          <span className="text-[9px] font-medium italic">
            Last seen by cloud at {formatTime(lastSynced)}
          </span>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;