import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wrench, Calendar, FileText, 
  MessageSquare, LogOut, Package, Bike // ✅ ১. Bike আইকন ইমপোর্ট
} from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

  const getProfileSrc = (u) => {
    if (!u) return null;
    if (u.image) return u.image; // cloudinary path

    if (u.profileImageData && /^data:/.test(u.profileImageData)) return u.profileImageData;
    const v = u.profileImage;
    if (!v) return null;
    if (/^(https?:|data:|blob:|\/)\w*/i.test(v)) return v;
    try {
      const images = require.context('../../assets/gallery/profile', false, /\.(png|jpe?g|svg|webp|avif)$/);
      return images(`./${v}`);
    } catch (err) {
      return null;
    }
  };

  const profileSrc = getProfileSrc(user);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const menuItems = [
    { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/book-service', label: 'Book A Service', icon: <Wrench size={20} /> },
    { path: '/my-bookings', label: 'Service Bookings', icon: <Calendar size={20} /> },
    { path: '/user/parts-bookings', label: 'Parts Bookings', icon: <Package size={20} /> },
    
    // ✅ ২. নতুন অপশন: My Bike Trade
    { path: '/user/bike-trade', label: 'My Bike Trade', icon: <Bike size={20} /> },

    { path: '/reviews', label: 'Reviews', icon: <MessageSquare size={20} /> },
    { path: '/my-invoices', label: 'Invoices', icon: <FileText size={20} /> },
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col md:flex-row"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/80 z-0 "></div>

      <aside className="relative z-10 w-full md:w-64 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700 text-white flex-shrink-0">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black relative flex-shrink-0">

              {/* initials fallback */}
              {/* <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white z-0">{userInitial}</span> */}

              {profileSrc && (
                <img
                  src={profileSrc}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover absolute inset-0 z-10"
                  onError={(e) => { e.currentTarget.remove(); }}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg text-gray-100 truncate">{user?.name}</h2>
              <p className="text-xs text-blue-400">Bike Owner</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition mt-8">
            <LogOut size={20} /> <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      <main className="relative z-10 flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 min-h-full border border-gray-200/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

