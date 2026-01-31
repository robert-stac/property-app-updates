import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const InstallButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // 2. Capture the install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // 3. Hide button if installation succeeds
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Don't show anything if already installed or if browser doesn't support it yet
  if (isInstalled || !installPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200 mt-4 group"
    >
      <Download size={18} className="group-hover:bounce" />
      <span>Install for Offline Use</span>
    </button>
  );
};

export default InstallButton;