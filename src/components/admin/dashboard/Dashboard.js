import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance"; 

// Icons
import { 
  IndianRupee, Calendar, 
  MessageSquare, Star, Package 
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,       
    pendingBookings: 0,
    completedBookings: 0,     
    totalPartsOrders: 0,    
    pendingPartsOrders: 0,  
    totalRevenueThisMonth: 0, // ✅ Updated state
    totalRevenueToday: 0,     // ✅ Updated state
    totalReviews: 0,    
    avgRating: 0,       
    totalImages: 0      
  });
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        axiosInstance.get('/bookings'),            // 0: Service Bookings
        axiosInstance.get('/parts-bookings/all'),  // 1: Parts Bookings
        axiosInstance.get('/invoices'),            // 2: Invoices
        axiosInstance.get('/reviews'),             // 3: Reviews
        axiosInstance.get('/gallery')              // 4: Gallery
      ]);

      const getData = (index) => results[index].status === 'fulfilled' ? results[index].value.data : [];

      const bookings = getData(0);
      const partsOrders = getData(1); 
      const invoices = getData(2);
      const reviews = getData(3);
      const gallery = getData(4);

      // --- Calculations ---
      
      const pendingServices = bookings.filter(b => b.status?.toUpperCase() === 'PENDING').length;
      const completedServices = bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED').length;
      
      const pendingParts = partsOrders.filter(b => b.status === 'Pending').length;

      // ✅ REVENUE CALCULATIONS (Magic Happens Here!)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Helper function to check if dates are the same day
      const isSameDay = (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
      };

      let revenueThisMonth = 0;
      let revenueToday = 0;

      invoices.forEach(inv => {
        // Only count if status is Paid (case-insensitive)
        if (inv.status && inv.status.toLowerCase() === 'paid') {
            const invoiceDate = new Date(inv.createdAt || inv.invoiceDate); // Use createdAt or invoiceDate
            
            // Check if it's this month
            if (invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear) {
               revenueThisMonth += (Number(inv.grandTotal) || 0); // Use grandTotal as per your backend
            }

            // Check if it's today
            if (isSameDay(invoiceDate, now)) {
               revenueToday += (Number(inv.grandTotal) || 0);
            }
        }
      });
      // ✅ END REVENUE CALCULATIONS

      const totalStars = reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0);
      const avgRating = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : 0;

      // Stats Update
      setStats({
        totalBookings: bookings.length,
        pendingBookings: pendingServices,
        completedBookings: completedServices,
        totalPartsOrders: partsOrders.length, 
        pendingPartsOrders: pendingParts,
        totalRevenueThisMonth: revenueThisMonth, // ✅ Updated
        totalRevenueToday: revenueToday,         // ✅ Updated
        totalReviews: reviews.length,
        avgRating: avgRating,
        totalImages: gallery.length
      });

      setRecentServices(bookings.slice(0, 5));

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B6A]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of your workshop performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        
        {/* ✅ Updated Revenue Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md border-l-4 border-l-green-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg text-green-600"><IndianRupee size={24} /></div>
            <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
               Today: ₹{stats.totalRevenueToday.toLocaleString()}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">₹{stats.totalRevenueThisMonth.toLocaleString()}</h3>
          <p className="text-sm text-gray-500 mt-1">Revenue (This Month)</p>
        </div>

        {/* Service Bookings Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md border-l-4 border-l-blue-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg text-blue-600"><Calendar size={24} /></div>
            {stats.pendingBookings > 0 && (
              <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full animate-pulse">
                {stats.pendingBookings} New
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalBookings}</h3>
          <p className="text-sm text-gray-500 mt-1">Service Requests</p>
        </div>

        {/* Parts Bookings Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md border-l-4 border-l-indigo-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-2 sm:p-3 rounded-lg text-indigo-600"><Package size={24} /></div>
            {stats.pendingPartsOrders > 0 && (
              <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-full animate-pulse">
                {stats.pendingPartsOrders} New
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalPartsOrders}</h3>
          <p className="text-sm text-gray-500 mt-1">Parts Orders</p>
        </div>

        {/* Reviews Stats */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md border-l-4 border-l-orange-600">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-2 sm:p-3 rounded-lg text-orange-600"><MessageSquare size={24} /></div>
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded text-orange-600 font-bold text-xs">
              {stats.avgRating} <Star size={12} fill="currentColor" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalReviews}</h3>
          <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
        </div>
      </div>

      {/* Recent Activity Table (Service Bookings) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">Recent Service Requests</h2>
          <Link to="/admin/orders" className="text-sm text-[#003B6A] font-medium hover:underline">
             View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Service</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentServices.length > 0 ? (
                recentServices.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{booking.serviceType}</td>
                    <td className="p-4 text-sm text-gray-700">{booking.vehicleNumber}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{booking.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">No service bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;