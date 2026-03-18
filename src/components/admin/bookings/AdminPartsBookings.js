import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Package, Phone, Mail, Clock, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AdminPartsBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });
  
  // ✅ ১. সার্চ স্টেটের জন্য নতুন লাইন
  const [searchTerm, setSearchTerm] = useState('');

  // backend base url (used for images etc.)
  const base = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${base}${img}`;
  };

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/parts-bookings/all');
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/parts-bookings/update-status/${id}`, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
      showStatusPopup(`Order marked as ${newStatus}`, false);
    } catch (error) {
      showStatusPopup("Failed to update status", true);
    }
  };
  
  const handleContactUpdate = async (id) => {
    try {
      await axiosInstance.put(`/parts-bookings/update-status/${id}`, { contactStatus: "Contacted" });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, contactStatus: "Contacted" } : b));
    } catch (error) { console.error(error); }
  };

  // ✅ ২. পাওয়ারফুল সার্চ এবং ফিল্টার লজিক
  const filteredBookings = bookings.filter(b => {
    // স্ট্যাটাস ফিল্টার (All হলে সব, নাহলে যেটা সিলেক্টেড)
    const matchesStatus = filter === 'All' || b.status === filter;

    // সার্চ ফিল্টার (Order ID, Name, Phone চেক করবে)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      b.bookingId.toLowerCase().includes(searchLower) || 
      b.user?.name?.toLowerCase().includes(searchLower) || 
      b.user?.phone?.includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div>
           <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Package className="text-[#003B6A]" /> Parts Booking Requests
           </h2>
           <p className="text-gray-500 text-sm mt-1">Manage offline pickup orders here.</p>
        </div>
        
        {/* ✅ ৩. সার্চ বার (Search Bar UI) */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name or Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003B6A] focus:border-transparent outline-none shadow-sm transition"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto bg-white rounded-xl shadow-sm p-1 mb-6 w-fit">
        {['All', 'Pending', 'Completed', 'Cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${
              filter === status ? 'bg-[#003B6A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003B6A]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-300">
                
                {/* Order Header */}
                <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-[#003B6A] rounded-full flex items-center justify-center font-bold text-xl uppercase">
                      {booking.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                        {booking.user?.name || "Unknown User"} 
                        <span className="text-xs bg-[#003B6A] text-white px-2 py-0.5 rounded font-mono tracking-wide">
                          {booking.bookingId}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Mail size={12}/> {booking.user?.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12}/> {booking.user?.phone || "N/A"}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(booking.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                      {booking.contactStatus === "Not Contacted" && (
                          <button 
                              onClick={() => handleContactUpdate(booking._id)}
                              className="text-xs bg-white text-blue-600 px-3 py-2 rounded-lg font-bold hover:bg-blue-50 border border-blue-200 shadow-sm transition"
                          >
                              Mark as Contacted
                          </button>
                      )}
                      
                      <div className="relative">
                        <select 
                            value={booking.status} 
                            onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                            className={`appearance-none text-sm font-bold pl-3 pr-8 py-2 rounded-lg border outline-none cursor-pointer transition shadow-sm ${
                                booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-2 rounded-l-lg">Item Name</th>
                          <th className="px-4 py-2 rounded-r-lg text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {booking.parts.map((part, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-white">
                                {part.image ? (
                                  // use same base as axios instance; fallback to localhost
                                  <img
                                    src={getImageUrl(part.image)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs text-gray-400">N/A</div>
                                )}
                              </div>
                              <span className="font-semibold text-gray-700">{part.name}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-600">₹{part.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Footer Summary */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Contact Status:</span>
                        {booking.contactStatus === "Contacted" ? 
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-green-100">
                            <CheckCircle size={12}/> Contacted
                          </span> : 
                          <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-orange-100">
                            <XCircle size={12}/> Pending Call
                          </span>
                        }
                      </div>
                      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl">
                          <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Amount</span>
                          <p className="text-2xl font-black text-[#003B6A]">₹{booking.totalAmount}</p>
                      </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No bookings found matching your search.</p>
              <button onClick={() => {setSearchTerm(''); setFilter('All');}} className="mt-2 text-[#003B6A] text-sm hover:underline font-bold">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPartsBookings;