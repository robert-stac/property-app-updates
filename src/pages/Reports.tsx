import React, { useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { FileText, Printer, TrendingDown, PieChart, Calendar, FileType } from "lucide-react";

const Reports: React.FC = () => {
  // Only pulling formatUgx and convertToUsd/formatUsd to satisfy the UI usage
  const { formatUgx, formatUsd, convertToUsd } = useCurrency();

  // FIX: Explicitly typing the state so TypeScript doesn't assume the arrays are 'never'
  const [reportData, setReportData] = useState<{
    tenants: any[];
    properties: any[];
    repairs: any[];
    overdueSummary: any[];
  }>({
    tenants: [],
    properties: [],
    repairs: [],
    overdueSummary: []
  });

  useEffect(() => {
    const storedTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
    const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
    const storedRepairs = JSON.parse(localStorage.getItem("repairs") || "[]");

    const today = new Date();

    const overdue = storedTenants
      .filter((t: any) => {
        const dueDate = t.nextPaymentDate ? new Date(t.nextPaymentDate) : null;
        return t.balance > 0 && dueDate && dueDate < today;
      })
      .map((t: any) => {
        const dueDate = new Date(t.nextPaymentDate);
        const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const property = storedProperties.find(
          (p: any) => p.id?.toString() === t.propertyId?.toString()
        );

        return { 
          ...t, 
          daysLate: diffDays, 
          propertyName: property ? property.name : "Unassigned Property" 
        };
      })
      // FIX: Parameters a and b explicitly typed as 'any'
      .sort((a: any, b: any) => b.daysLate - a.daysLate);

    setReportData({ 
      tenants: storedTenants, 
      properties: storedProperties, 
      repairs: storedRepairs, 
      overdueSummary: overdue 
    });
  }, []);

  const totalRevenue = reportData.tenants.reduce((acc, t: any) => acc + Number(t.amountPaid || 0), 0);
  const totalArrears = reportData.tenants.reduce((acc, t: any) => acc + Number(t.balance || 0), 0);
  const totalRepairs = reportData.repairs.reduce((acc, r: any) => acc + Number(r.cost || 0), 0);

  return (
    <div className="w-full px-4 md:px-10 py-6 space-y-10">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center print:hidden bg-white p-8 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <FileText className="text-blue-700" size={40} /> Portfolio Financial Report
          </h1>
          <p className="text-gray-500 font-bold text-lg">Buwembo & Co. Advocates Management System</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition flex items-center gap-2 shadow-xl uppercase tracking-widest text-sm"
          >
            <FileType size={20} /> Export to PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gray-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition flex items-center gap-2 shadow-xl uppercase tracking-widest text-sm"
          >
            <Printer size={20} /> Print
          </button>
        </div>
      </div>

      {/* Financial Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase mb-2 tracking-widest">Total Collected</p>
          <p className="text-3xl font-black text-green-600">{formatUgx(totalRevenue)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase mb-2 tracking-widest">Total Arrears</p>
          <p className="text-3xl font-black text-red-600">{formatUgx(totalArrears)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase mb-2 tracking-widest">Repairs Outlay</p>
          <p className="text-3xl font-black text-orange-600">{formatUgx(totalRepairs)}</p>
        </div>
        <div className="bg-blue-800 p-8 rounded-[2rem] shadow-2xl text-white">
          <p className="text-blue-200 text-xs font-black uppercase mb-2 tracking-widest">Net Cash Position</p>
          <p className="text-3xl font-black">{formatUgx(totalRevenue - totalRepairs)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Arrears Risk Tracking Table */}
        <div className="bg-white rounded-[2.5rem] border border-red-100 shadow-md overflow-hidden">
          <div className="p-8 bg-red-50 border-b border-red-100 flex justify-between items-center">
            <h3 className="font-black text-red-800 text-xl flex items-center gap-3">
              <TrendingDown size={28} /> Arrears Risk Tracking
            </h3>
            <span className="bg-red-200 text-red-800 px-4 py-1 rounded-full font-black text-xs uppercase tracking-tighter">Aging Report</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-[11px] text-gray-500 font-black uppercase border-b">
              <tr>
                <th className="p-6 text-left">Tenant Name</th>
                <th className="p-6 text-left">Property</th>
                <th className="p-6 text-center">Days Overdue</th>
                <th className="p-6 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reportData.overdueSummary.length > 0 ? reportData.overdueSummary.map((t: any) => (
                <tr key={t.id} className="hover:bg-red-50/30 transition">
                  <td className="p-6 font-black text-gray-800">{t.name}</td>
                  <td className="p-6">
                    <span className="text-xs font-black text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">
                      {t.propertyName}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-black ${t.daysLate > 30 ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'}`}>
                      {t.daysLate} Days
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-gray-900">
                    <div className="text-red-600">{formatUgx(t.balance)}</div>
                    <div className="text-[10px] text-gray-400 font-bold">{formatUsd(convertToUsd(t.balance))}</div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic font-bold">Excellent: All accounts are cleared!</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Repairs Summary */}
        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-md overflow-hidden">
          <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-black text-gray-800 text-xl flex items-center gap-3">
              <PieChart size={28} className="text-blue-600" /> Recent Repairs Impact
            </h3>
          </div>
          <div className="p-8 space-y-6">
            {reportData.repairs.slice(-5).reverse().map((r: any, idx) => (
              <div key={idx} className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-2xl text-white"><Calendar size={20} /></div>
                  <div>
                    <p className="font-black text-gray-800 text-lg leading-tight">{r.description}</p>
                    <p className="text-xs text-blue-600 font-bold uppercase mt-1">
                      {reportData.properties.find((p: any) => p.id?.toString() === r.propertyId?.toString())?.name || 'Property N/A'}
                    </p>
                  </div>
                </div>
                <p className="font-black text-gray-900 text-xl">{formatUgx(r.cost)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .px-4, .md\\:px-10 { padding: 0 !important; }
          .rounded-3xl, .rounded-\\[2\\.5rem\\], .rounded-\\[2rem\\] { border-radius: 4px !important; border: 1px solid #eee !important; }
          .shadow-sm, .shadow-md, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
          .bg-blue-800 { background-color: #1e40af !important; color: white !important; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;