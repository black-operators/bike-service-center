import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Image, FileText, ShoppingBag, 
  Wrench, Users, Settings, LogOut, Menu, X, 
  MessageSquare, Calendar, Package, Bike 
} from 'lucide-react';
import { removeAuthToken, removeUser, getUser, getAuthToken } from '../../api/auth'; 

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const user = getUser(); // ✅ এখানে ইউজারের রোল পাওয়া যাবে (admin বা staff)

  // Auth check on mount only - redirect if no token exists
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthChecked(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    removeAuthToken();
    removeUser();
    navigate('/login');
  };

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/orders', label: 'Service Bookings', icon: <Calendar size={20} /> }, 
    { path: '/admin/parts-bookings', label: 'Parts Bookings', icon: <Package size={20} /> },
    { path: '/admin/secondhand/manage', label: 'Bike Trade', icon: <Bike size={20} /> },
    { path: '/admin/services/manage', label: 'Services', icon: <Wrench size={20} /> },
    { path: '/admin/gallery/list', label: 'Gallery', icon: <Image size={20} /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <MessageSquare size={20} /> },
    { path: '/admin/invoices/list', label: 'Invoices', icon: <FileText size={20} /> },
    { path: '/admin/parts/list', label: 'Parts Inventory', icon: <ShoppingBag size={20} /> },
    { path: '/admin/staff', label: 'Staff Management', icon: <Users size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  // ✅ ম্যাজিক লজিক: যদি ইউজার 'staff' হয়, তবে 'Staff Management' অপশনটা মেনু থেকে বাদ পড়ে যাবে!
  const filteredLinks = adminLinks.filter(link => {
    if (user?.role === 'staff' && link.path === '/admin/staff') {
      return false; 
    }
    return true;
  });
  // Don't render until auth check is complete
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B6A]"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="md:hidden bg-[#1a1f2c] text-white p-4 flex justify-between items-center">
        <div className="font-bold tracking-wider">BOSCH ADMIN</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`
        bg-[#1a1f2c] text-white flex-shrink-0 md:min-h-screen border-r border-gray-800 flex flex-col
        fixed md:relative z-50 w-64 h-full transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">B</div>
          <div>
            <h2 className="text-lg font-bold tracking-wider">BOSCH</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user?.role === 'staff' ? 'Staff Panel' : 'Admin Panel'}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 mt-4 flex-1 overflow-y-auto">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.startsWith(link.path)
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.icon}
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-[#1a1f2c] mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm font-medium border border-red-900/30"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen bg-gray-50/50">
        <div className="p-2 sm:p-4 md:p-8 max-w-7xl mx-auto">
            <Outlet /> 
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </div>
  );
};

export default AdminLayout;