import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UpdatePrompt from './components/UpdatePrompt'; 
import SystemManager from './components/SystemManager'; // Import the combined component

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
  return (
    <CurrencyProvider>
      <Router>
        {/* The UpdatePrompt sits at the top level. 
          It stays hidden until you upload a new 'dist' folder to Netlify. 
        */}
        <UpdatePrompt />

        <div className="min-h-screen bg-gray-50 font-sans antialiased">
          <Layout>
            {/* Suspense handles the loading state if pages take a moment to render */}
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
                
                {/* Fallback to Dashboard if route is not found */}
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