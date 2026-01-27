import React, { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { RotateCcw, Printer, FileDown, Search, History, Users } from "lucide-react";

interface VacatedTenant {
  id: string;
  name: string;
  propertyId: string;
  rent: number;
  amountPaid: number;
  balance: number;
  nextPaymentDate: string;
  expiryDate: string;
  vacatedDate: string;
}

const VacatedTenants: React.FC = () => {
  const { formatUgx, formatUsd, convertToUsd } = useCurrency();
  const [vacated, setVacated] = useState<VacatedTenant[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedVacated = JSON.parse(localStorage.getItem("vacatedTenants") || "[]");
    const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
    setVacated(storedVacated);
    setProperties(storedProperties);
  }, []);

  const handleRestore = (id: string) => {
    const tenantToRestore = vacated.find((t) => t.id === id);
    if (!tenantToRestore) return;

    if (!window.confirm(`Restore ${tenantToRestore.name} to active tenants?`)) return;

    const activeTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
    const { vacatedDate, ...restoredData } = tenantToRestore as any;
    localStorage.setItem("tenants", JSON.stringify([...activeTenants, restoredData]));

    const updatedVacated = vacated.filter((t) => t.id !== id);
    setVacated(updatedVacated);
    localStorage.setItem("vacatedTenants", JSON.stringify(updatedVacated));
    
    alert(`${tenantToRestore.name} has been restored.`);
  };

  const exportCSV = () => {
    const header = ["Name", "Property", "Amount Paid", "Balance (UGX)", "Vacated Date"];
    const rows = filtered.map(t => [
      t.name,
      properties.find(p => p.id === t.propertyId)?.name || "N/A",
      t.amountPaid,
      t.balance,
      t.vacatedDate
    ]);
    const content = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Vacated_Tenants_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const filtered = vacated.filter(t => {
    const property = properties.find(p => p.id === t.propertyId);
    const searchStr = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(searchStr) ||
      (property?.name.toLowerCase().includes(searchStr) || "")
    );
  });

  return (
    // "w-full px-0" ensures it touches the edges if the parent allows it
    <div className="w-full space-y-6 pb-12 min-h-screen">
      
      {/* Header Section - Wide Layout */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 print:hidden px-4">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3">
            <History className="text-blue-600" size={38} />
            VACATED TENANTS
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">
            Historical Archive • {vacated.length} Total Records
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <div className="relative flex-grow xl:w-96 group">
            <input
              type="text"
              placeholder="Search by tenant name or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 rounded-2xl border-2 border-gray-200 bg-white shadow-sm focus:border-blue-600 outline-none font-bold transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={20} />
          </div>
          
          <button onClick={() => window.print()} className="bg-white border-2 border-gray-200 px-6 py-4 rounded-2xl hover:bg-gray-50 shadow-sm transition-all text-gray-700 font-black flex items-center gap-2">
            <Printer size={20} /> PRINT
          </button>
          
          <button onClick={exportCSV} className="bg-green-600 text-white px-8 py-4 rounded-2xl hover:bg-green-700 shadow-lg transition-all font-black flex items-center gap-2">
            <FileDown size={20} /> EXPORT CSV
          </button>
        </div>
      </div>

      {/* Full-Width Table Container */}
      <div className="bg-white shadow-xl border-y md:border-x border-gray-100 md:rounded-[2rem] overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-800">
                <th className="p-8 text-left">Tenant Information</th>
                <th className="p-8 text-right">Rent Paid (UGX)</th>
                <th className="p-8 text-right">Final Balance</th>
                <th className="p-8 text-center">Date Vacated</th>
                <th className="p-8 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <div className="opacity-20 flex flex-col items-center">
                        <Users size={80} />
                        <p className="mt-4 font-black text-xl uppercase tracking-widest">No Records Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const property = properties.find(p => p.id === t.propertyId);
                  return (
                    <tr key={t.id} className="hover:bg-blue-50/50 transition-all group">
                      <td className="p-8">
                        <div className="font-black text-gray-900 text-xl uppercase tracking-tight group-hover:text-blue-700 transition-colors">
                            {t.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">
                                {property?.name || "No Property"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">ID: {t.id.slice(0,8)}</span>
                        </div>
                      </td>
                      <td className="p-8 text-right font-black text-gray-600">
                        {formatUgx(t.amountPaid)}
                      </td>
                      <td className="p-8 text-right">
                        <div className={`font-black text-xl ${t.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatUgx(t.balance)}
                        </div>
                        <div className="text-[10px] text-gray-400 font-black uppercase">
                            {formatUsd(convertToUsd(t.balance))}
                        </div>
                      </td>
                      <td className="p-8 text-center font-bold text-gray-500">
                        <div className="bg-gray-100 inline-block px-4 py-2 rounded-lg text-sm">
                            {t.vacatedDate}
                        </div>
                      </td>
                      <td className="p-8 text-center print:hidden">
                        <button 
                          onClick={() => handleRestore(t.id)} 
                          className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all font-black text-xs uppercase tracking-tighter flex items-center gap-2 mx-auto shadow-md"
                        >
                          <RotateCcw size={14} /> Restore Tenant
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Optimization */}
      <style>{`
        @media print {
          body { background: white !important; }
          .min-h-screen { padding: 0 !important; }
          .bg-white { border: none !important; }
          table { font-size: 12px; }
          th { background-color: #000 !important; color: white !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default VacatedTenants;