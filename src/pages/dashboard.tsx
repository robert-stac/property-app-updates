import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useCurrency } from "../context/CurrencyContext";
import packageInfo from "../../package.json";
import { 
  Building2, 
  Users, 
  AlertCircle, 
  Download, 
  Upload, 
  ShieldCheck, 
  TrendingUp,
  Clock,
  Hammer,
  RefreshCcw,
  Database
} from "lucide-react";

// --- SUB-COMPONENT: SYSTEM STATUS ---
const SystemStatus: React.FC = () => {
  const navigate = useNavigate();
  const [lastBackup] = useState<string | null>(localStorage.getItem('last_backup_date'));
  const needRefresh = false; 

  const isBackupOverdue = () => {
    if (!lastBackup) return true;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(lastBackup) < sevenDaysAgo;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${needRefresh ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs font-medium text-gray-500">Version {packageInfo.version} Stable</span>
        </div>
        {needRefresh ? <AlertCircle size={16} className="text-orange-500" /> : <ShieldCheck size={16} className="text-green-500" />}
      </div>
      
      <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 border ${isBackupOverdue() ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
        <Database size={18} className={isBackupOverdue() ? 'text-red-500' : 'text-gray-400'} />
        <div>
          <p className="text-xs text-gray-500 font-medium">Last system backup</p>
          <p className={`text-sm font-semibold ${isBackupOverdue() ? 'text-red-700' : 'text-gray-900'}`}>
            {lastBackup ? new Date(lastBackup).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Backup Required'}
          </p>
        </div>
      </div>

      <button onClick={() => navigate('/system')} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${needRefresh ? 'bg-orange-500 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
        <RefreshCcw size={16} className={needRefresh ? 'animate-spin' : ''} />
        {needRefresh ? 'Update Available' : 'System Settings'}
      </button>
    </div>
  );
};

// --- MAIN DASHBOARD ---
const Dashboard: React.FC = () => {
  const { formatUgx } = useCurrency();
  const [properties, setProperties] = useState<any[]>([]);
  const [overdueTenants, setOverdueTenants] = useState<any[]>([]);
  const [pendingRepairs, setPendingRepairs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeTenants: 0,
    totalRepairs: 0,
    totalRevenue: 0,
    totalBalance: 0,
  });

  useEffect(() => {
    const storedProps = JSON.parse(localStorage.getItem("properties") || "[]");
    const storedTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
    const storedRepairs = JSON.parse(localStorage.getItem("repairs") || "[]");

    const revenue = storedTenants.reduce((acc: number, t: any) => acc + Number(t.amountPaid || 0), 0);
    const balance = storedTenants.reduce((acc: number, t: any) => acc + Number(t.balance || 0), 0);
    const repairCosts = storedRepairs.reduce((acc: number, r: any) => acc + Number(r.cost || 0), 0);

    const today = new Date();
    const overdue = storedTenants
      .filter((t: any) => {
        const dueDate = t.nextPaymentDate ? new Date(t.nextPaymentDate) : null;
        return t.balance > 0 && dueDate && dueDate < today;
      })
      .map((t: any) => {
        const dueDate = new Date(t.nextPaymentDate);
        const diffDays = Math.ceil(Math.abs(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return { ...t, daysLate: diffDays };
      });

    setPendingRepairs(storedRepairs.slice(-4).reverse());
    setProperties(storedProps);
    setOverdueTenants(overdue);
    setStats({
      totalProperties: storedProps.length,
      activeTenants: storedTenants.length,
      totalRepairs: repairCosts,
      totalRevenue: revenue,
      totalBalance: balance,
    });
  }, []);

  const handleExport = () => {
    const data = {
      properties: JSON.parse(localStorage.getItem("properties") || "[]"),
      tenants: JSON.parse(localStorage.getItem("tenants") || "[]"),
      repairs: JSON.parse(localStorage.getItem("repairs") || "[]"),
      vacatedTenants: JSON.parse(localStorage.getItem("vacatedTenants") || "[]"),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Buwembo_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    localStorage.setItem('last_backup_date', new Date().toISOString());
    window.location.reload(); 
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (window.confirm("Overwrite all data on this device? This cannot be undone.")) {
          localStorage.setItem("properties", JSON.stringify(data.properties || []));
          localStorage.setItem("tenants", JSON.stringify(data.tenants || []));
          localStorage.setItem("repairs", JSON.stringify(data.repairs || []));
          localStorage.setItem("vacatedTenants", JSON.stringify(data.vacatedTenants || []));
          window.location.reload();
        }
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 text-left">
      {/* Page Title */}
      <div className="px-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your property management system</p>
      </div>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={<Building2 size={24}/>} label="Total Units" value={stats.totalProperties} color="blue" />
        <StatCard icon={<Users size={24}/>} label="Active Tenants" value={stats.activeTenants} color="green" />
        <StatCard icon={<TrendingUp size={24}/>} label="Gross Revenue" value={formatUgx(stats.totalRevenue)} color="purple" />
        <StatCard icon={<AlertCircle size={24}/>} label="Total Arrears" value={formatUgx(stats.totalBalance)} color="red" />
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-8">
          
          {/* Overdue Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Clock className="text-red-600" size={18} /> Overdue Payments
              </h3>
              {overdueTenants.length > 0 && (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Action Required
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Tenant Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Property Unit</th>
                    <th className="px-6 py-4 text-center font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {overdueTenants.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-medium">All accounts are settled</td></tr>
                  ) : (
                    overdueTenants.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{t.name}</td>
                        <td className="px-6 py-4 text-gray-600">{properties.find(p=>p.id===t.propertyId)?.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {t.daysLate} days late
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-red-600">{formatUgx(t.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Maintenance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Hammer className="text-orange-500" size={18} /> Recent Maintenance
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingRepairs.length === 0 ? (
                <p className="col-span-2 text-center py-8 text-gray-400 text-sm">No recent repairs recorded</p>
              ) : (
                pendingRepairs.map((r, i) => {
                  const property = properties.find(p => p.id === r.propertyId);
                  const allTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
                  const tenant = allTenants.find((t: any) => t.propertyId === r.propertyId);
                  return (
                    <div key={i} className="p-5 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm truncate pr-4">{r.issue}</h4>
                        <span className="font-bold text-blue-600 text-sm whitespace-nowrap">{formatUgx(r.cost)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Building2 size={12} className="text-gray-400"/>
                        <span>{property?.name || "General Property"}</span>
                        {tenant && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">{tenant.name}</span>
                          </>
                        )}
                      </div>
                      {r.description && (
                         <p className="text-xs text-gray-400 italic mt-2 line-clamp-1">{r.description}</p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 space-y-6">
          <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
             <ShieldCheck className="absolute top-[-10px] right-[-10px] text-white opacity-10" size={100} />
             <h3 className="text-lg font-bold mb-2">Data Safety</h3>
             <p className="text-blue-100 text-sm mb-6 leading-relaxed">Ensure your property data is safe. Download a local backup file weekly.</p>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={handleExport} className="bg-white text-blue-700 py-3 rounded-lg font-semibold text-xs flex flex-col items-center justify-center gap-1 hover:bg-blue-50 transition-colors">
                  <Download size={16} /> 
                  <span>Backup</span>
                </button>
                <label className="border border-blue-400 bg-blue-700 text-white py-3 rounded-lg font-semibold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-800 transition-colors">
                  <Upload size={16} /> 
                  <span>Restore</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
             </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Net Cash Flow</p>
            <p className="text-3xl font-bold text-emerald-400 tracking-tight">{formatUgx(stats.totalRevenue - stats.totalRepairs)}</p>
            <div className="mt-4 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
            </div>
          </div>

          <SystemStatus />
        </div>
      </div>
    </div>
  );
};

// Reusable Professional Card Component
const StatCard = ({ icon, label, value, color }: any) => {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    red: "text-red-600 bg-red-50 border-red-100"
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;