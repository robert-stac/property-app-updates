import React, { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Building2, Search, Home, MapPin, Users, Edit3, Trash2, PlusCircle, XCircle } from "lucide-react";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  description: string;
}

interface Tenant {
  id: string;
  name: string;
  propertyId: string;
}

const Properties: React.FC = () => {
  const { formatUgx, formatUsd, convertToUsd, rate } = useCurrency();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form State
  const [formData, setFormData] = useState<Omit<Property, "id">>({
    name: "",
    location: "",
    price: 0,
    description: "",
  });
  
  const [usdDisplay, setUsdDisplay] = useState<string>("0");

  useEffect(() => {
    const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
    const storedTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
    setProperties(storedProperties);
    setTenants(storedTenants);
  }, []);

  const persistProperties = (data: Property[]) => {
    setProperties(data);
    localStorage.setItem("properties", JSON.stringify(data));
  };

  const handleUgxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ugxValue = Number(e.target.value);
    setFormData({ ...formData, price: ugxValue });
    setUsdDisplay((ugxValue / rate).toFixed(2));
  };

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usdValue = Number(e.target.value);
    setUsdDisplay(e.target.value);
    setFormData({ ...formData, price: Math.round(usdValue * rate) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updated = properties.map((p) =>
        p.id === editingId ? { ...p, ...formData } : p
      );
      persistProperties(updated);
      setEditingId(null);
    } else {
      const newProperty: Property = { id: crypto.randomUUID(), ...formData };
      persistProperties([...properties, newProperty]);
    }
    setFormData({ name: "", location: "", price: 0, description: "" });
    setUsdDisplay("0");
  };

  const handleEdit = (property: Property) => {
    setEditingId(property.id);
    setFormData({
      name: property.name,
      location: property.location,
      price: property.price,
      description: property.description,
    });
    setUsdDisplay((property.price / rate).toFixed(2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    const activeTenants = tenants.filter((t) => t.propertyId === id);
    if (activeTenants.length > 0) {
      alert(`Access Denied: Cannot delete. This property has ${activeTenants.length} active tenant(s).`);
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this property?")) return;
    persistProperties(properties.filter((p) => p.id !== id));
  };

  const getTenantCount = (propertyId: string) => tenants.filter((t) => t.propertyId === propertyId).length;

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-blue-800 flex items-center gap-3">
            <Building2 size={40} /> PROPERTIES
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Manage Buwembo & Co. Real Estate</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus:border-blue-500 outline-none font-bold"
          />
        </div>
      </div>

      {/* Entry Form - Optimized for Wide Screen */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-sm border border-blue-100">
        <div className="flex items-center gap-2 mb-8">
            <div className={`p-2 rounded-lg ${editingId ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {editingId ? <Edit3 size={20}/> : <PlusCircle size={20}/>}
            </div>
            <h2 className="text-2xl font-black text-gray-800">
            {editingId ? "Edit Property Details" : "Register New Property"}
            </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Property Name</label>
            <input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              placeholder="e.g. Buwembo Plaza"
              className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:bg-white focus:border-blue-500 font-bold transition-all" 
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Location</label>
            <input 
              value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})} 
              required 
              placeholder="e.g. Kampala Central"
              className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:bg-white focus:border-blue-500 font-bold transition-all" 
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <label className="block text-xs font-black text-blue-700 uppercase mb-2">Rent (UGX)</label>
            <input type="number" value={formData.price || ""} onChange={handleUgxChange} className="w-full bg-transparent text-xl font-black text-blue-900 outline-none" placeholder="0" />
          </div>

          <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
            <label className="block text-xs font-black text-green-700 uppercase mb-2">Rent (USD)</label>
            <input type="number" step="0.01" value={usdDisplay === "0" ? "" : usdDisplay} onChange={handleUsdChange} className="w-full bg-transparent text-xl font-black text-green-900 outline-none" placeholder="0.00" />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-black text-gray-400 uppercase mb-2">Description / Notes</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            placeholder="Add any additional details or specs..."
            className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 outline-none focus:bg-white focus:border-blue-500 font-bold transition-all" 
            rows={2} 
          />
        </div>

        <div className="flex gap-4 mt-8">
          <button className={`px-10 py-4 rounded-2xl font-black shadow-lg uppercase transition-all flex items-center gap-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}>
            {editingId ? "Save Changes" : "Confirm & Save"}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setFormData({name:"", location:"", price:0, description:""}); setUsdDisplay("0"); }} 
              className="bg-gray-200 text-gray-700 px-10 py-4 rounded-2xl hover:bg-gray-300 transition font-black uppercase"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Wide-Screen Table Container */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
            <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">Property Inventory</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
            <thead>
                <tr className="bg-white text-gray-400 text-xs font-black uppercase border-b border-gray-100">
                <th className="p-6 text-left">Property Details</th>
                <th className="p-6 text-left">Location</th>
                <th className="p-6 text-center">Active Tenants</th>
                <th className="p-6 text-right">Rent Price</th>
                <th className="p-6 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {filteredProperties.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">No matching records found</td></tr>
                ) : (
                filteredProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Home size={20}/>
                            </div>
                            <div>
                                <div className="font-black text-gray-900 text-lg uppercase">{p.name}</div>
                                <div className="text-xs text-gray-400 font-bold italic truncate max-w-xs">{p.description || "No description provided"}</div>
                            </div>
                        </div>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <MapPin size={16} className="text-blue-500" />
                            {p.location}
                        </div>
                    </td>
                    <td className="p-6 text-center">
                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-black inline-flex items-center gap-2">
                        <Users size={14}/> {getTenantCount(p.id)}
                        </span>
                    </td>
                    <td className="p-6 text-right">
                        <div className="font-black text-blue-700 text-lg">{formatUgx(p.price)}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase">{formatUsd(convertToUsd(p.price))}</div>
                    </td>
                    <td className="p-6">
                        <div className="flex justify-end gap-3">
                            <button onClick={() => handleEdit(p)} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                <Edit3 size={18}/>
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-3 bg-gray-100 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Properties;