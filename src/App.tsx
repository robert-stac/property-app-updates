import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SystemManager from './components/SystemManager';

// Pages
import Dashboard from './pages/dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Reports from './pages/Reports';
import AddProperty from './pages/AddProperty';
import VacatedTenants from './pages/VacatedTenants';
import Repairs from './pages/Repairs';

// Context
import { CurrencyProvider } from './context/CurrencyContext';

const App: React.FC = () => {
  
  useEffect(() => {
    // --- DATA MIGRATION SCRIPT (V1 to V2) ---
    const CURRENT_VERSION = "2.0";
    const installedVersion = localStorage.getItem("app_version");

    if (installedVersion !== CURRENT_VERSION) {
      console.log(`Upgrading System to Version ${CURRENT_VERSION}...`);

      // 1. Migrate Tenants (Ensure propertyId and numeric types exist)
      const storedTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
      const updatedTenants = storedTenants.map((t: any) => ({
        ...t,
        propertyId: t.propertyId || "unassigned",
        balance: Number(t.balance || 0),
        amountPaid: Number(t.amountPaid || 0),
        nextPaymentDate: t.nextPaymentDate || new Date().toISOString().split('T')[0]
      }));
      localStorage.setItem("tenants", JSON.stringify(updatedTenants));

      // 2. Migrate Repairs (Link to properties and ensure cost is numeric)
      const storedRepairs = JSON.parse(localStorage.getItem("repairs") || "[]");
      const updatedRepairs = storedRepairs.map((r: any) => ({
        ...r,
        propertyId: r.propertyId || "unassigned",
        cost: Number(r.cost || 0),
        issue: r.issue || r.description || "Unspecified Repair"
      }));
      localStorage.setItem("repairs", JSON.stringify(updatedRepairs));

      // 3. Migrate Properties (Ensure ID is consistent)
      const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
      const updatedProperties = storedProperties.map((p: any) => ({
        ...p,
        id: p.id?.toString() || Math.random().toString(36).substr(2, 9)
      }));
      localStorage.setItem("properties", JSON.stringify(updatedProperties));

      // Update version and reload to apply changes across the UI
      localStorage.setItem("app_version", CURRENT_VERSION);
      console.log("Migration Complete. Refreshing UI...");
      window.location.reload();
    }
  }, []);

  return (
    <CurrencyProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
          <Layout>
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/tenants" element={<Tenants />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/repairs" element={<Repairs />} />
                <Route path="/vacated" element={<VacatedTenants />} />
                <Route path="/settings" element={<SystemManager />} />
                
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
    </CurrencyProvider>
  );
};

export default App;