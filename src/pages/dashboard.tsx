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
    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${needRefresh ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">v{packageInfo.version}-Stable</span>
        </div>
        {needRefresh ? <AlertCircle size={14} className="text-orange-500" /> : <ShieldCheck size={14} className="text-green-500" />}
      </div>
      <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 border ${isBackupOverdue() ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
        <Database size={16} className={isBackupOverdue() ? 'text-red-500' : 'text-gray-400'} />
        <div className="leading-tight">
          <p className="text-[9px] font-black text-gray-400 uppercase">Last Backup</p>
          <p className={`text-[10px] font-bold ${isBackupOverdue() ? 'text-red-600' : 'text-gray-700'}`}>
            {lastBackup ? new Date(lastBackup).toLocaleDateString() : 'Action Required'}
          </p>
        </div>
      </div>
      <button onClick={() => navigate('/system')} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${needRefresh ? 'bg-orange-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'}`}>
        <RefreshCcw size={12} className={needRefresh ? 'animate-spin' : ''} />
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
    <div className="w-full space-y-10 pb-12">
      {/* Page Title */}
      <div className="px-2">
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Dashboard</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Property Management Overview</p>
      </div>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard icon={<Building2 size={28}/>} label="Total Units" value={stats.totalProperties} color="blue" />
        <StatCard icon={<Users size={28}/>} label="Active Tenants" value={stats.activeTenants} color="green" />
        <StatCard icon={<TrendingUp size={28}/>} label="Gross Revenue" value={formatUgx(stats.totalRevenue)} color="purple" />
        <StatCard icon={<AlertCircle size={28}/>} label="Total Arrears" value={formatUgx(stats.totalBalance)} color="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          
          {/* Overdue Table */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-red-50/30">
              <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                <Clock className="text-red-600" /> Overdue Rentals
              </h3>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Action Required</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="p-6 text-left">Tenant</th>
                    <th className="p-6 text-left">Property</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {overdueTenants.length === 0 ? (
                    <tr><td colSpan={4} className="p-16 text-center text-gray-400 font-bold italic uppercase">All accounts are settled</td></tr>
                  ) : (
                    overdueTenants.map(t => (
                      <tr key={t.id} className="hover:bg-red-50/50 transition-colors group">
                        <td className="p-6 font-black text-gray-800">{t.name}</td>
                        <td className="p-6 text-sm text-gray-500 font-bold">{properties.find(p=>p.id===t.propertyId)?.name}</td>
                        <td className="p-6 text-center">
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            {t.daysLate} Days Late
                          </span>
                        </td>
                        <td className="p-6 text-right font-black text-red-600 text-lg">{formatUgx(t.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Maintenance - Enhanced V2 Details */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                <Hammer className="text-orange-500" /> Recent Maintenance
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRepairs.length === 0 ? (
                <p className="col-span-2 text-center py-10 text-gray-300 font-black uppercase">No recent repairs</p>
              ) : (
                pendingRepairs.map((r, i) => {
                  const property = properties.find(p => p.id === r.propertyId);
                  const allTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
                  const tenant = allTenants.find((t: any) => t.propertyId === r.propertyId);

                  return (
                    <div key={i} className="flex flex-col p-6 border-2 border-gray-50 rounded-3xl bg-gray-50/50 hover:border-orange-200 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="max-w-[70%]">
                          <div className="font-black text-gray-800 uppercase text-sm leading-tight truncate">{r.issue}</div>
                          <div className="text-[9px] text-gray-400 font-bold mt-1 tracking-widest">{r.date}</div>
                        </div>
                        <div className="text-right font-black text-blue-700 text-sm whitespace-nowrap">{formatUgx(r.cost)}</div>
                      </div>

                      <div className="space-y-1.5 py-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600 font-bold text-[10px]">
                          <Building2 size={12} className="text-gray-400" />
                          <span className="uppercase tracking-tight">{property?.name || "Global Asset"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px]">
                          <Users size={12} className="text-gray-400" />
                          <span>Tenant: {tenant?.name || "N/A"}</span>
                        </div>
                      </div>

                      {r.description && (
                        <div className="mt-2 pt-2 border-t border-gray-100/50">
                          <p className="text-[10px] text-gray-400 italic leading-snug line-clamp-2">"{r.description}"</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <div className="bg-blue-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
             <ShieldCheck className="absolute top-[-20px] right-[-20px] text-white opacity-10" size={120} />
             <h3 className="text-2xl font-black mb-4 flex items-center gap-3">System Safety</h3>
             <p className="text-blue-100 text-sm mb-10 font-medium leading-relaxed">Ensure your data is safe. Download a local backup file weekly.</p>
             <div className="space-y-4">
                <button onClick={handleExport} className="w-full bg-white text-blue-700 py-5 rounded-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                  <Download size={20} /> Download Backup
                </button>
                <label className="w-full border-2 border-blue-400 text-white py-5 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-3 cursor-pointer uppercase text-xs tracking-widest">
                  <Upload size={20} /> Restore Data
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
             </div>
          </div>

          <div className="bg-gray-900 p-10 rounded-[3rem] text-white relative overflow-hidden group">
            <TrendingUp className="absolute bottom-[-30px] right-[-30px] text-green-400 opacity-5 group-hover:opacity-10 transition-opacity" size={180} />
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Net Cash Flow</p>
            <p className="text-4xl font-black text-green-400 tracking-tighter">{formatUgx(stats.totalRevenue - stats.totalRepairs)}</p>
            <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 w-3/4"></div>
            </div>
          </div>

          <SystemStatus />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const themes: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-200 animate-pulse-subtle"
  };
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-md ${themes[color]}`}>
      <div className="mb-6">{icon}</div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl xl:text-3xl font-black tracking-tighter ${color === 'red' ? 'text-red-600' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  );
};

export default Dashboard;