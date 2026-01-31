import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileBarChart, 
  PlusCircle, 
  Wrench, 
  UserMinus,
  Settings
} from 'lucide-react';
import InstallButton from './InstallButton';
import UpdateHandler from './UpdateHandler'; // Added UpdateHandler

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/properties', label: 'Properties', icon: Building2 },
    { path: '/tenants', label: 'Tenants', icon: Users },
    { path: '/repairs', label: 'Repairs', icon: Wrench },
    { path: '/reports', label: 'Reports', icon: FileBarChart },
    { path: '/vacated', label: 'Vacated', icon: UserMinus },
    { path: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - w-72 for a premium desktop feel */}
      <aside className="w-72 bg-blue-900 text-white flex-shrink-0 sticky top-0 h-screen hidden md:flex flex-col shadow-2xl">
        
        {/* Logo Section */}
        <div className="p-6 mb-2">
          <h1 
            className="font-bold uppercase leading-tight text-white"
            style={{ 
              fontSize: '18px', 
              letterSpacing: '0.01em',
              lineHeight: '1.1' 
            }}
          >
            Buwembo & Co.
            <span 
              className="block text-blue-400" 
              style={{ fontSize: '15px', marginTop: '2px' }}
            >
              Advocates
            </span>
          </h1>
          <div className="mt-4 pt-2 border-t border-blue-800/50">
            <p className="text-[10px] text-blue-200/60 font-bold uppercase tracking-[0.2em]">
              Property Management
            </p>
          </div>
        </div>

        {/* Update Notification Section */}
        <UpdateHandler />

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-white hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-white' : 'text-blue-300'} />
                {item.label}
              </Link>
            );
          })}
          
          {/* Offline Installation Button */}
          <div className="pt-4 mt-4 border-t border-blue-800/30">
            <InstallButton />
          </div>
        </nav>

        {/* Action Button Section */}
        <div className="p-5 border-t border-blue-800/50">
          <Link
            to="/add-property"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl text-xs font-bold transition shadow-lg active:scale-95 uppercase tracking-widest"
          >
            <PlusCircle size={18} />
            Add Property
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
        <div className="p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;