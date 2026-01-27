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
      {/* Sidebar - Fixed for Laptop View */}
      <aside className="w-64 bg-blue-900 text-white flex-shrink-0 sticky top-0 h-screen hidden md:flex flex-col">
        <div className="p-8">
          <h1 className="text-xl font-black tracking-tighter">BUWEMBO & CO.ADVOCATES</h1>
          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Property Management System</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                  isActive 
                    ? 'bg-blue-700 text-white shadow-lg' 
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-blue-800">
          <Link
            to="/properties"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black transition shadow-lg"
          >
            <PlusCircle size={18} />
            ADD PROPERTY
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;