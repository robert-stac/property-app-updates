import React, { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Wrench, Plus, Search, Trash2, Edit3, AlertCircle } from "lucide-react";

interface Property {
  id: string;
  name: string;
}

interface Repair {
  id: string;
  propertyId: string;
  issue: string;
  description: string;
  cost: number;
  status: "Pending" | "In Progress" | "Completed";
  date: string;
}

const Repairs: React.FC = () => {
  const { formatUgx, formatUsd, convertToUsd, rate } = useCurrency();
  const [properties, setProperties] = useState<Property[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<Omit<Repair, "id">>({
    propertyId: "",
    issue: "",
    description: "",
    cost: 0,
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
  });

  const [usdCost, setUsdCost] = useState<string>("0");

  useEffect(() => {
    const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
    const storedRepairs = JSON.parse(localStorage.getItem("repairs") || "[]");
    setProperties(storedProperties);
    setRepairs(storedRepairs);
  }, []);

  const persistRepairs = (data: Repair[]) => {
    setRepairs(data);
    localStorage.setItem("repairs", JSON.stringify(data));
  };

  const handleCostChange = (ugxValue: number) => {
    setFormData({ ...formData, cost: ugxValue });
    setUsdCost((ugxValue / rate).toFixed(2));
  };

  const handleUsdChange = (usdValue: number) => {
    setUsdCost(usdValue.toString());
    setFormData({ ...formData, cost: Math.round(usdValue * rate) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updated = repairs.map((r) => (r.id === editingId ? { ...r, ...formData } : r));
      persistRepairs(updated);
      setEditingId(null);
    } else {
      persistRepairs([...repairs, { id: crypto.randomUUID(), ...formData }]);
    }
    setFormData({ propertyId: "", issue: "", description: "", cost: 0, status: "Pending", date: new Date().toISOString().split("T")[0] });
    setUsdCost("0");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this repair record?")) {
      persistRepairs(repairs.filter((r) => r.id !== id));
    }
  };

  const filtered = repairs.filter(r => {
    const property = properties.find(p => p.id === r.propertyId);
    return r.issue.toLowerCase().includes(searchTerm.toLowerCase()) || 
           property?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full space-y-8 pb-12 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 uppercase">
            <Wrench className="text-blue-700" size={40} />
            Maintenance & Repairs
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">
            Global Repair Log • {repairs.length} Total Records
          </p>
        </div>

        <div className="relative w-full xl:w-96 group">
          <input
            type="text"
            placeholder="Search by property or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-blue-600 outline-none font-bold transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={20} />
        </div>
      </div>

      {/* Form Section - Wide Layout */}
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 w-full">
        <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${editingId ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {editingId ? <Edit3 size={24} /> : <Plus size={24} />}
            </div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                {editingId ? "Edit Maintenance Record" : "Log New Repair Request"}
            </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Target Property</label>
            <select 
              value={formData.propertyId} 
              onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
              className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-gray-50 outline-none focus:border-blue-600 font-bold transition-all"
              required
            >
              <option value="">Select property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Issue / Item</label>
            <input 
              type="text" 
              value={formData.issue} 
              onChange={(e) => setFormData({...formData, issue: e.target.value})}
              className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-gray-50 outline-none focus:border-blue-600 font-bold transition-all"
              placeholder="e.g., Leaking Roof"
              required
            />
          </div>

          <div className="space-y-2 xl:col-span-1">
             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Estimated Cost (UGX / USD)</label>
             <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  value={formData.cost || ""} 
                  onChange={(e) => handleCostChange(Number(e.target.value))}
                  className="p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none focus:border-blue-600 font-bold" 
                  placeholder="UGX" 
                />
                <input 
                  type="number" 
                  value={usdCost === "0" ? "" : usdCost} 
                  onChange={(e) => handleUsdChange(Number(e.target.value))}
                  className="p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none focus:border-blue-600 font-bold" 
                  placeholder="USD" 
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-gray-50 outline-none focus:border-blue-600 font-bold transition-all"
            >
              <option value="Pending">Pending Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Work Completed</option>
            </select>
          </div>

          <div className="md:col-span-2 xl:col-span-3 space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Work Description & Notes</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border-2 border-gray-100 p-4 rounded-2xl bg-gray-50 outline-none focus:border-blue-600 font-bold transition-all"
              rows={1}
              placeholder="Provide more context about the repair..."
            />
          </div>

          <div className="xl:pt-8">
            <button type="submit" className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black hover:bg-green-600 transition shadow-lg shadow-blue-100 uppercase tracking-widest text-sm">
              {editingId ? "Update Record" : "Save Record"}
            </button>
          </div>
        </div>
      </form>

      {/* Table Section - Stretch to fill */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                <th className="p-8 text-left">Property & Issue Details</th>
                <th className="p-8 text-center">Work Status</th>
                <th className="p-8 text-right">Estimated Cost</th>
                <th className="p-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No maintenance records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const property = properties.find(p => p.id === r.propertyId);
                  return (
                    <tr key={r.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="p-8">
                        <div className="font-black text-gray-900 text-xl uppercase tracking-tight">{r.issue}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                {property?.name || "Unlinked Property"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">{r.date}</span>
                        </div>
                        {r.description && <p className="text-gray-500 text-sm mt-2 italic">"{r.description}"</p>}
                      </td>
                      <td className="p-8 text-center">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          r.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : 
                          r.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="font-black text-gray-900 text-lg">{formatUgx(r.cost)}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            {formatUsd(convertToUsd(r.cost))}
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => { setEditingId(r.id); setFormData({...r}); setUsdCost((r.cost/rate).toFixed(2)); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Edit Record"
                            >
                                <Edit3 size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(r.id)} 
                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Delete Record"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Repairs;