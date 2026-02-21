import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SystemManager from './components/SystemManager';
import SplashScreen from './components/SplashScreen'; // Import Splash

// Pages
import Dashboard from './pages/dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Reports from './pages/Reports';
import AddProperty from './pages/AddProperty';
import VacatedTenants from './pages/VacatedTenants';
import Repairs from './pages/Repairs';
import Login from './pages/Login'; 
import UserManagement from './pages/UserManagement';

// Context
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- SUB-COMPONENT TO PROTECT CONTENT ---
const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Show splash for 1.5 seconds to ensure smooth transition
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 1. Show Splash on initial boot
  if (isInitialLoading) {
    return <SplashScreen />;
  }

  // 2. If not logged in after boot, show ONLY login
  if (!currentUser) {
    return <Login />;
  }

  // 3. If logged in, show the full app layout
  return (
    <Layout>
      <Suspense fallback={<SplashScreen />}> 
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/repairs" element={<Repairs />} />
          <Route path="/vacated" element={<VacatedTenants />} />
          <Route path="/settings" element={<SystemManager />} />
          <Route path="/users" element={<UserManagement />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  
  useEffect(() => {
    // --- DATA MIGRATION SCRIPT (V1 to V2) ---
    const CURRENT_VERSION = "2.0";
    const installedVersion = localStorage.getItem("app_version");

    if (installedVersion !== CURRENT_VERSION) {
      console.log(`Upgrading System to Version ${CURRENT_VERSION}...`);

      const storedTenants = JSON.parse(localStorage.getItem("tenants") || "[]");
      const updatedTenants = storedTenants.map((t: any) => ({
        ...t,
        propertyId: t.propertyId || "unassigned",
        balance: Number(t.balance || 0),
        amountPaid: Number(t.amountPaid || 0),
        nextPaymentDate: t.nextPaymentDate || new Date().toISOString().split('T')[0]
      }));
      localStorage.setItem("tenants", JSON.stringify(updatedTenants));

      const storedRepairs = JSON.parse(localStorage.getItem("repairs") || "[]");
      const updatedRepairs = storedRepairs.map((r: any) => ({
        ...r,
        propertyId: r.propertyId || "unassigned",
        cost: Number(r.cost || 0),
        issue: r.issue || r.description || "Unspecified Repair"
      }));
      localStorage.setItem("repairs", JSON.stringify(updatedRepairs));

      const storedProperties = JSON.parse(localStorage.getItem("properties") || "[]");
      const updatedProperties = storedProperties.map((p: any) => ({
        ...p,
        id: p.id?.toString() || Math.random().toString(36).substr(2, 9)
      }));
      localStorage.setItem("properties", JSON.stringify(updatedProperties));

      localStorage.setItem("app_version", CURRENT_VERSION);
      window.location.assign(window.location.origin + import.meta.env.BASE_URL);
    }
  }, []);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router basename="/property-app-updates">
          <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <AppContent />
          </div>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;