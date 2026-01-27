import React, { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

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

  const handleRentChange = (ugx: number) => {
    setFormData((prev) => ({ ...prev, rent: ugx, balance: ugx - prev.amountPaid }));
    setUsdRent((ugx / rate).toFixed(2));
  };

  const handlePaidChange = (ugx: number) => {
    setFormData((prev) => ({ ...prev, amountPaid: ugx, balance: prev.rent - ugx }));
    setUsdPaid((ugx / rate).toFixed(2));
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

    if (!window.confirm(`Are you sure you want to move ${tenantToMove.name} to Vacated Tenants?`)) return;

    const vacated = JSON.parse(localStorage.getItem("vacatedTenants") || "[]");
    const updatedVacated = [
      ...vacated,
      { ...tenantToMove, vacatedDate: new Date().toISOString().split("T")[0] }
    ];
    localStorage.setItem("vacatedTenants", JSON.stringify(updatedVacated));

    persistTenants(tenants.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const filteredTenants = tenants.filter((t) => {
    const property = properties.find((p) => p.id === t.propertyId);
    const searchStr = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(searchStr) ||
      (property?.name.toLowerCase().includes(searchStr) || "")
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-700">Tenants</h1>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search tenant or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-700 outline-none"
          />
          <span className="absolute left-3 top-3.5 text-gray-400 font-bold">🔍</span>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md mb-8 border border-blue-500 max-w-6xl">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? "✏️ Edit Tenant" : "👤 Register New Tenant"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tenant Name</label>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Property</label>
            <select value={formData.propertyId} onChange={(e) => {
              const p = properties.find(prop => prop.id === e.target.value);
              if(p) { handleRentChange(p.price); setFormData(prev => ({...prev, propertyId: p.id})); }
            }} className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-black-500 mb-1">Next Payment</label>
              <input type="date" value={formData.nextPaymentDate} onChange={(e)=>setFormData({...formData, nextPaymentDate: e.target.value})} className="w-full border p-2 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black-500 mb-1">Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={(e)=>setFormData({...formData, expiryDate: e.target.value})} className="w-full border p-2 rounded-lg bg-gray-50" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 grid grid-cols-2 gap-2">
            <label className="col-span-2 text-xs font-bold text-blue-800 uppercase tracking-widest">Rent Due</label>
            <input type="number" value={formData.rent || ""} onChange={(e) => handleRentChange(Number(e.target.value))} className="p-2 border rounded bg-white" placeholder="UGX" />
            <input type="number" step="0.01" value={usdRent === "0" ? "" : usdRent} onChange={(e) => { setUsdRent(e.target.value); handleRentChange(Math.round(Number(e.target.value) * rate)); }} className="p-2 border rounded bg-white" placeholder="USD" />
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 grid grid-cols-2 gap-2">
            <label className="col-span-2 text-xs font-bold text-green-800 uppercase tracking-widest">Amount Paid</label>
            <input type="number" value={formData.amountPaid || ""} onChange={(e) => handlePaidChange(Number(e.target.value))} className="p-2 border rounded bg-white" placeholder="UGX" />
            <input type="number" step="0.01" value={usdPaid === "0" ? "" : usdPaid} onChange={(e) => { setUsdPaid(e.target.value); handlePaidChange(Math.round(Number(e.target.value) * rate)); }} className="p-2 border rounded bg-white" placeholder="USD" />
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-500 uppercase">Balance</label>
            <div className={`text-xl font-black ${formData.balance > 0 ? "text-red-600" : "text-green-600"}`}>{formatUgx(formData.balance)}</div>
            <div className="text-xs font-bold text-gray-400">{formatUsd(convertToUsd(formData.balance))}</div>
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <button type="submit" className="flex-1 bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-600 transition uppercase tracking-widest">
            {editingId ? "Update Record" : "Save Record"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({name:"", propertyId:"", rent:0, amountPaid:0, balance:0, nextPaymentDate:"", expiryDate:""}); setUsdRent("0"); setUsdPaid("0"); }} className="bg-gray-200 px-8 rounded-xl font-bold">Cancel</button>
          )}
        </div>
      </form>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-800 text-white text-sm">
            <tr>
              <th className="p-4 text-left">Tenant / Property</th>
              <th className="p-4 text-center">Dates</th>
              <th className="p-4 text-right">Rent Paid</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((t) => {
              const property = properties.find(p => p.id === t.propertyId);
              return (
                <tr key={t.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{t.name}</div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase">{property?.name || "No Property"}</div>
                  </td>
                  <td className="p-4 text-center text-[10px] text-gray-500">
                    <div className="font-bold">PAY: {t.nextPaymentDate || "—"}</div>
                    <div>EXP: {t.expiryDate || "—"}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-bold text-green-700">{formatUgx(t.amountPaid)}</div>
                    <div className="text-[10px] text-gray-400 font-bold">{formatUsd(convertToUsd(t.amountPaid))}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-bold ${t.balance > 0 ? "text-red-600" : "text-green-600"}`}>{formatUgx(t.balance)}</div>
                    <div className="text-[10px] text-gray-400 font-bold">{formatUsd(convertToUsd(t.balance))}</div>
                  </td>
                  <td className="p-4 text-center space-x-4">
                    <button onClick={() => handleEdit(t)} className="text-white bg-blue-600 px-4 py-2 rounded font-bold text-xs hover:underline">Edit</button>
                    <button onClick={() => handleVacate(t.id)} className="text-white bg-red-600 px-4 py-2 rounded font-bold text-xs hover:underline">Vacate</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tenants;