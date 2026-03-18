import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; 

// Components Imports
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Loader from "./components/common/Loader";

import AppRoutes from "./components/routes/AppRoutes"; 

function App() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, [location]);

  // ✅ Admin Check Logic
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Global Loader */}
      {loading && <Loader />}

      {/* 2. Navbar - High z-index usually handled within component, but sits above content */}
      {!isAdminRoute && <Navbar />}

      {/* 3. Main Content - flex-grow ensures footer stays at the bottom */}
      <main className="flex-grow">
        <AppRoutes />
      </main>

      {/* 4. Footer - Updated with Stacking Context fix */}
      {!isAdminRoute && (
        <div className="relative z-[100] w-full"> 
          <Footer />
        </div>
      )}
      
    </div>
  );
}

export default App;
