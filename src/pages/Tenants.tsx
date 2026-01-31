import React, { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { 
  Users, 
  Search, 
  UserPlus, 
  Building2, 
  Calendar, 
  CreditCard, 
  Edit3, 
  LogOut, 
  Wallet,
  CheckCircle,
  AlertCircle,
  Banknote
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  price: number;
}

interface Tenant {
  id: string;
  name: string;
  propertyId: string;
  rent: number;
  amountPaid: number;
  balance: number;
  nextPaymentDate: string;
  expiryDate: string;
}

const Tenants: React.FC = () => {
  const { formatUgx, formatUsd, convertToUsd, rate } = useCurrency();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<Omit<Tenant, "id">>({
    name: "",
    propertyId: "",
    rent: 0,
    amountPaid: 0,
    balance: 0,
    nextPaymentDate: "",
    expiryDate: "",
  });

  const [usdRent, setUsdRent] = useState<string>("0");
  const [usdPaid, setUsdPaid] = useState<string>("0");

  useEffect(() => {
    const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
    const storedTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
    setProperties(storedProperties);
    setTenants(storedTenants);
  }, []);

  const persistTenants = (data: Tenant[]) => {
    setTenants(data);
    localStorage.setItem("tenants", JSON.stringify(data));
  };

  // Dual Currency Logic for Rent
  const handleRentUgxChange = (val: number) => {
    setFormData((prev) => ({ ...prev, rent: val, balance: val - prev.amountPaid }));
    setUsdRent((val / rate).toFixed(2));
  };

  const handleRentUsdChange = (val: number) => {
    const ugx = Math.round(val * rate);
    setFormData((prev) => ({ ...prev, rent: ugx, balance: ugx - prev.amountPaid }));
    setUsdRent(val.toString());
  };

  // Dual Currency Logic for Paid
  const handlePaidUgxChange = (val: number) => {
    setFormData((prev) => ({ ...prev, amountPaid: val, balance: prev.rent - val }));
    setUsdPaid((val / rate).toFixed(2));
  };

  const handlePaidUsdChange = (val: number) => {
    const ugx = Math.round(val * rate);
    setFormData((prev) => ({ ...prev, amountPaid: ugx, balance: prev.rent - ugx }));
    setUsdPaid(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      persistTenants(tenants.map((t) => (t.id === editingId ? { ...t, ...formData } : t)));
      setEditingId(null);
    } else {
      persistTenants([...tenants, { id: crypto.randomUUID(), ...formData }]);
    }
    setFormData({ name: "", propertyId: "", rent: 0, amountPaid: 0, balance: 0, nextPaymentDate: "", expiryDate: "" });
    setUsdRent("0"); setUsdPaid("0");
  };

  const handleEdit = (t: Tenant) => {
    setEditingId(t.id);
    setFormData({ ...t });
    setUsdRent((t.rent / rate).toFixed(2));
    setUsdPaid((t.amountPaid / rate).toFixed(2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVacate = (id: string) => {
    const tenantToMove = tenants.find((t) => t.id === id);
    if (!tenantToMove) return;
    if (!window.confirm(`Move ${tenantToMove.name} to Vacated Tenants?`)) return;

    const vacated = JSON.parse(localStorage.getItem("vacatedTenants") || "[]");
    localStorage.setItem("vacatedTenants", JSON.stringify([...vacated, { ...tenantToMove, vacatedDate: new Date().toISOString().split("T")[0] }]));
    persistTenants(tenants.filter((t) => t.id !== id));
  };

  const filteredTenants = tenants.filter((t) => {
    const property = properties.find((p) => p.id === t.propertyId);
    const searchStr = searchTerm.toLowerCase();
    return t.name.toLowerCase().includes(searchStr) || (property?.name.toLowerCase().includes(searchStr) || "");
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tenants</h1>
          <p className="text-gray-500 text-sm mt-1">Manage lease agreements and dual-currency payments</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
          <input
            type="text"
            placeholder="Search directory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Professional Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className={`p-2 rounded-lg ${editingId ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                {editingId ? <Edit3 size={20}/> : <UserPlus size={20}/>}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{editingId ? "Update Tenant" : "New Tenant Registration"}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 1: Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">General Information</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Property Unit</label>
              <select 
                value={formData.propertyId} 
                onChange={(e) => {
                  const p = properties.find(prop => prop.id === e.target.value);
                  if(p) { handleRentUgxChange(p.price); setFormData(prev => ({...prev, propertyId: p.id})); }
                }} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:border-blue-500 outline-none" 
                required
              >
                <option value="">Select unit...</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Section 2: Financials (Dual Currency) */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Financial Details</h3>
            
            {/* Rent Due Inputs */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Monthly Rent Due</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400">UGX</span>
                  <input type="number" value={formData.rent || ""} onChange={(e) => handleRentUgxChange(Number(e.target.value))} className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg text-sm font-semibold text-blue-900 outline-none focus:bg-white" placeholder="0" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400">USD</span>
                  <input type="number" step="0.01" value={usdRent === "0" ? "" : usdRent} onChange={(e) => handleRentUsdChange(Number(e.target.value))} className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg text-sm font-semibold text-blue-900 outline-none focus:bg-white" placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* Amount Paid Inputs */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Current Amount Paid</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400">UGX</span>
                  <input type="number" value={formData.amountPaid || ""} onChange={(e) => handlePaidUgxChange(Number(e.target.value))} className="w-full pl-10 pr-3 py-2 border border-emerald-200 rounded-lg text-sm font-semibold text-emerald-900 outline-none focus:bg-white" placeholder="0" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400">USD</span>
                  <input type="number" step="0.01" value={usdPaid === "0" ? "" : usdPaid} onChange={(e) => handlePaidUsdChange(Number(e.target.value))} className="w-full pl-10 pr-3 py-2 border border-emerald-200 rounded-lg text-sm font-semibold text-emerald-900 outline-none focus:bg-white" placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Timeline & Balance */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Timeline & Status</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Payment Date</label>
                 <input type="date" value={formData.nextPaymentDate} onChange={(e)=>setFormData({...formData, nextPaymentDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                 <input type="date" value={formData.expiryDate} onChange={(e)=>setFormData({...formData, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
               </div>
            </div>
            <div className={`p-4 rounded-xl border flex justify-between items-center ${formData.balance > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
               <span className={`text-[10px] font-bold uppercase ${formData.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>Total Balance</span>
               <div className="text-right">
                  <div className={`text-lg font-bold ${formData.balance > 0 ? "text-red-700" : "text-emerald-700"}`}>{formatUgx(formData.balance)}</div>
                  <div className="text-[10px] font-medium opacity-70">{formatUsd(convertToUsd(formData.balance))}</div>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
          <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm">
            {editingId ? "Save Changes" : "Register Tenant"}
          </button>
          {editingId && (
            <button type="button" onClick={() => setEditingId(null)} className="px-8 py-2.5 border border-gray-300 rounded-lg text-sm font-medium">Cancel</button>
          )}
        </div>
      </form>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
           <h3 className="font-bold text-gray-800 text-sm">Tenant Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Tenant / Property</th>
                <th className="px-6 py-4 text-center">Lease Schedule</th>
                <th className="px-6 py-4 text-right">Payment Breakdown</th>
                <th className="px-6 py-4 text-right">Balance Due</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTenants.map((t) => {
                const property = properties.find(p => p.id === t.propertyId);
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5"><Building2 size={10}/> {property?.name || "No unit"}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1"><Calendar size={10}/> Due: {t.nextPaymentDate || "—"}</span>
                          <span className="text-[10px] text-gray-400">Exp: {t.expiryDate || "—"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="font-bold text-emerald-700 text-sm">{formatUgx(t.amountPaid)}</div>
                       <div className="text-[10px] text-gray-400 font-medium">({formatUsd(convertToUsd(t.amountPaid))})</div>
                       <div className="text-[9px] text-gray-300 mt-0.5 italic">Paid of {formatUgx(t.rent)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className={`font-bold text-sm ${t.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {t.balance > 0 ? `-${formatUgx(t.balance)}` : "Settled"}
                       </div>
                       {t.balance > 0 && <div className="text-[10px] text-red-400">{formatUsd(convertToUsd(t.balance))}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(t)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => handleVacate(t.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><LogOut size={16}/></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tenants;