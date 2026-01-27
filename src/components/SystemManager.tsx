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
    // Updated container to match Dashboard and Properties width
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12">
      
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg">
            <Server size={32} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-blue-900 uppercase">System Settings</h2>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Global Configuration & Cloud Updates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Update Section - Spans 1 column */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight">Software Version</h3>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">Live</span>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                Your application connects to the cloud to check for new features and bug fixes. You can continue working offline, and updates will notify you here.
            </p>
          </div>

          {needRefresh ? (
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 animate-pulse">
              <p className="text-blue-900 text-sm font-black mb-4 flex items-center gap-2">
                <RefreshCw size={16} /> NEW VERSION AVAILABLE
              </p>
              <button
                onClick={() => { setIsUpdating(true); updateServiceWorker(true); }}
                className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
              >
                {isUpdating ? <RefreshCw className="animate-spin" /> : <Download size={20} />}
                INSTALL UPDATE NOW
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-gray-400">
                <ShieldCheck size={20} className="text-green-500" />
                <span className="text-sm font-bold uppercase tracking-widest">System is up to date</span>
            </div>
          )}
        </div>

        {/* Backup Section - Spans 2 columns on wide screens */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight">Data Management</h3>
            <Database className="text-gray-200" size={32} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h4 className="font-bold text-gray-700">Cloud Sync & Export</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Download a full copy of your tenant records, property details, and repair logs to your computer for safe keeping or to move to another laptop.
                </p>
                <button
                onClick={exportData}
                className="w-full border-2 border-blue-900 text-white py-4 rounded-2xl font-black hover:bg-blue-900 hover:text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                <Download size={20} /> DOWNLOAD BACKUP (.JSON)
                </button>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-gray-700">Restore System</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                    If you are moving to a new laptop, use this tool to upload your previously saved backup file to restore your entire database.
                </p>
                <label className="w-full border-2 border-dashed border-gray-300 text-black-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-all">
                    <Upload size={20} /> UPLOAD BACKUP FILE
                    <input type="file" className="hidden" onChange={importData} accept=".json" />
                </label>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Warning Banner */}
      <div className="bg-amber-50 p-6 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center border border-amber-200 shadow-sm">
        <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl">
            <AlertTriangle size={32} />
        </div>
        <div>
            <p className="text-sm text-amber-900 font-bold uppercase mb-1">Important Safety Note</p>
            <p className="text-sm text-amber-800 leading-relaxed">
                Since Buwembo & Co.Advocates uses local device storage for offline capability, your data is <strong>unique to this laptop</strong>. 
                Running a software update will <strong>NOT</strong> delete your tenants, but we always recommend downloading a backup before significant changes.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SystemManager;