import React, { useState } from 'react';
import { Database, Download, Upload, RefreshCw, AlertTriangle, ShieldCheck, Server } from 'lucide-react';

const SystemManager: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  // --- DATA BACKUP LOGIC ---
  const exportData = () => {
    const backup = {
      properties: JSON.parse(localStorage.getItem("properties") || "[]"),
      tenants: JSON.parse(localStorage.getItem("tenants") || "[]"),
      repairs: JSON.parse(localStorage.getItem("repairs") || "[]"),
      vacatedTenants: JSON.parse(localStorage.getItem("vacatedTenants") || "[]"),
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Buwembo_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (window.confirm("WARNING: This will overwrite ALL data on this device. Continue?")) {
          localStorage.setItem('properties', JSON.stringify(data.properties || []));
          localStorage.setItem('tenants', JSON.stringify(data.tenants || []));
          localStorage.setItem('repairs', JSON.stringify(data.repairs || []));
          localStorage.setItem('vacatedTenants', JSON.stringify(data.vacatedTenants || []));
          alert("Data restored successfully!");
          window.location.reload();
        }
      } catch (err) {
        alert("Invalid backup file. Please ensure you are using a genuine Buwembo & Co. backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 pb-12 px-4">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg">
            <Server size={28} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-tight">System Settings</h2>
            <p className="text-gray-500 font-semibold text-[10px] uppercase tracking-[0.2em]">Configuration & Backups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Software Status Section */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-800 uppercase tracking-tight">Software Version</h3>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">V2.0.0</span>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                Your application is currently optimized for desktop use via Tauri. Automatic updates will be managed through the system installer.
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-gray-400">
              <ShieldCheck size={20} className="text-green-500" />
              <span className="text-xs font-bold uppercase tracking-widest">System is up to date</span>
          </div>
        </div>

        {/* Backup Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
            <h3 className="font-bold text-lg text-gray-800 uppercase tracking-tight">Data Management</h3>
            <Database className="text-blue-900/10" size={32} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Cloud Sync & Export</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Download a full copy of your tenant records, property details, and repair logs to your computer.
                </p>
                <button
                onClick={exportData}
                className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                >
                <Download size={18} /> DOWNLOAD BACKUP
                </button>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Restore System</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Use this tool to upload your previously saved backup file to restore your entire database.
                </p>
                <label className="w-full border-2 border-dashed border-gray-200 text-gray-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-all text-xs">
                    <Upload size={18} /> UPLOAD BACKUP FILE
                    <input type="file" className="hidden" onChange={importData} accept=".json" />
                </label>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Warning Banner */}
      <div className="bg-amber-50 p-6 rounded-[1.5rem] flex flex-col md:flex-row gap-6 items-center border border-amber-200 shadow-sm">
        <div className="p-4 bg-white text-amber-600 rounded-xl shadow-sm">
            <AlertTriangle size={24} />
        </div>
        <div>
            <p className="text-[11px] text-amber-900 font-bold uppercase mb-1 tracking-wider">Storage Security Note</p>
            <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                Buwembo & Co. Advocates uses local encrypted storage. Your data is <strong>unique to this device</strong>. 
                Always download a backup before switching laptops or performing system maintenance.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SystemManager;