 import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { getUser, removeAuthToken, removeUser } from '../../api/auth';

 // ✅ Importing the new banner image

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // For desktop profile dropdown
  const navigate = useNavigate();

  useEffect(() => {
    // Initial check
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Listen for auth changes
    const handleAuthChange = () => {
      setUser(getUser());
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    removeUser();
    setUser(null);
    setShowProfileMenu(false);
    navigate('/login');
  };

  // Helper to check role
  const isAdminOrStaff = user && (user.role === 'admin' || user.role === 'staff');

  // Active Link Styles
  const navLinkStyles = ({ isActive }) => {
    return `cursor-pointer transition-colors duration-200 pb-1 text-base ${
      isActive 
        ? "text-blue-600 border-b-2 border-blue-600 font-bold" 
        : "text-gray-700 hover:text-blue-600 font-medium"
    }`;
  };

  return (
    <nav className="w-full bg-white shadow-md h-20 sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
      
      {/* --- Logo Section --- */}
      <Link to="/" className="flex items-center gap-3 cursor-pointer group">
        <img 
          src="/logo_maa_tara.jpg"
          alt="Logo" 
          className="h-14 w-auto rounded-full object-cover group-hover:shadow-lg transition-shadow" 
          style={{maxWidth: '60px', maxHeight: '60px'}}
        />
        <div className="flex items-center text-2xl font-bold tracking-tight">
          <span className="text-red-600">BOSCH</span>
          <span className="text-[#003B6A]">-MaaTara</span>
        </div>
      </Link>

      {/* --- Desktop Navigation --- */}
      <ul className="hidden lg:flex items-center gap-8">
        <li><NavLink to="/" className={navLinkStyles}>Home</NavLink></li>
        <li><NavLink to="/services" className={navLinkStyles}>Services</NavLink></li>
        <li><NavLink to="/gallery" className={navLinkStyles}>Gallery</NavLink></li>
        <li><NavLink to="/reviews" className={navLinkStyles}>Reviews</NavLink></li>
        <li><NavLink to="/about" className={navLinkStyles}>About</NavLink></li>
        <li><NavLink to="/contact" className={navLinkStyles}>Contact</NavLink></li>
      </ul>

      {/* --- Desktop Action Buttons --- */}
      <div className="hidden lg:flex items-center gap-4">
        {user ? (
          <div className="relative">
            {/* User Dropdown Trigger */}
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors focus:outline-none border px-3 py-1.5 rounded-full"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600">
                {user.image ? (
                  <img src={user.image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <span className="max-w-[100px] truncate">{user.name}</span>
              <ChevronDown size={16} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fadeIn z-50">
                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="font-bold text-gray-800 truncate">{user.name}</p>
                </div>

                {/* Dashboard Link based on Role */}
                {isAdminOrStaff ? (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <LayoutDashboard size={18} />
                    Admin Panel
                  </Link>
                ) : (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <LayoutDashboard size={18} />
                    My Dashboard
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left mt-1"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Login and Register Buttons */
          <div className="flex items-center gap-1">
            <Link to="/login" className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors px-4 py-2">
              <User size={20} />
              Login
            </Link>
            <Link to="/register" className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors px-4 py-2">
              Register
            </Link>
          </div>
        )}

        {/* Book Service Button */}
        <button
          onClick={() => {
            if (user) {
              navigate('/book-service');
            } else {
              navigate('/login');
            }
          }}
          className="bg-[#003B6A] hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-md transform hover:scale-105"
        >
          Book Service
        </button>
      </div>

      {/* --- Mobile Menu Toggle --- */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- Mobile Dropdown Menu --- */}
      {isOpen && (
        <div className="lg:hidden bg-white absolute top-20 left-0 w-full shadow-lg border-t border-gray-100 py-6 px-6 flex flex-col gap-4 animate-slideDown z-40 h-screen">
          <NavLink to="/" className={navLinkStyles} onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/services" className={navLinkStyles} onClick={() => setIsOpen(false)}>Services</NavLink>
          <NavLink to="/gallery" className={navLinkStyles} onClick={() => setIsOpen(false)}>Gallery</NavLink>
          {/* ✅ Reviews Link Added Here (Mobile) */}
          <NavLink to="/reviews" className={navLinkStyles} onClick={() => setIsOpen(false)}>Reviews</NavLink>
          <NavLink to="/about" className={navLinkStyles} onClick={() => setIsOpen(false)}>About</NavLink>
          <NavLink to="/contact" className={navLinkStyles} onClick={() => setIsOpen(false)}>Contact</NavLink>
          
          <hr className="border-gray-200 my-2" />

          {user ? (
            <>
              {/* Mobile User Profile Section */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600">
                  {user.image ? (
                    <img src={user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div> 
                <div>
                    <p className="text-sm text-gray-500">Welcome,</p>
                    <p className="font-bold text-gray-800">{user.name}</p>
                </div>
              </div>

              {/* Mobile Dashboard Link */}
              <Link 
                to={isAdminOrStaff ? "/admin/dashboard" : "/dashboard"} 
                className="flex items-center gap-2 text-blue-600 font-bold text-lg py-2 hover:bg-blue-50 rounded-lg transition px-2"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={20} />
                {isAdminOrStaff ? "Go to Admin Panel" : "Go to Dashboard"}
              </Link>

              {/* Mobile Logout */}
              <button 
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="flex items-center gap-2 text-red-600 font-bold text-lg py-2 hover:bg-red-50 rounded-lg transition px-2"
              >
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            /* Mobile Login and Register Links */
            <div className="flex flex-col gap-3">
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-gray-700 font-bold text-lg py-2 hover:text-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                <User size={20} /> Login
              </Link>
              <Link 
                to="/register" 
                className="flex items-center justify-center gap-2 text-gray-700 font-bold text-lg py-2 hover:text-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Book Service */}
          <button 
            onClick={() => {
              setIsOpen(false);
              if (user) {
                navigate('/book-service');
              } else {
                navigate('/login');
              }
            }}
            className="w-full bg-[#003B6A] text-white py-3 rounded-lg font-semibold shadow-md text-center hover:bg-blue-700 transition-all mt-2"
          >
            Book Service
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;





