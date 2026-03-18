import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Package, Calendar, ShoppingBag } from 'lucide-react';

const UserPartsBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ensure environment base URL includes `/api`
  const _rawBase = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';
  const base = _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`;
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${base}${img}`;
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // ✅ ফিক্স ১: সঠিক API এন্ডপয়েন্ট ব্যবহার করুন (Parts Booking এর জন্য)
      // আপনার backend এর partBookingRoutes.js এ চেক করুন সঠিক রাউট কি আছে। 
      // সাধারণত এটি '/parts-bookings/my-orders' বা '/parts-bookings/my-bookings' হতে পারে।
      const res = await axiosInstance.get('/parts-bookings/my-bookings'); 
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingBag className="text-[#003B6A]" /> My Parts Bookings
      </h2>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center">
          <p className="text-gray-500">You haven't booked any parts yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              
              {/* Header: ID & Status */}
              <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Booking ID</p>
                  <p className="text-lg font-black text-[#003B6A] tracking-wide">{booking.bookingId || booking._id.substring(0,8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                   <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                     {booking.status}
                   </span>
                   <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                     <Calendar size={12}/> {new Date(booking.createdAt).toLocaleDateString()}
                   </p>
                </div>
              </div>

              {/* Body: Items */}
              <div className="p-4">
                {/* ✅ ফিক্স ২: '?' যোগ করা হয়েছে যাতে parts না থাকলেও ক্র্যাশ না করে */}
                {booking.parts?.map((part, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4 last:mb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {part.image ? (
                        <img src={getImageUrl(part.image)} alt={part.name} className="w-full h-full object-cover"/>
                      ) : (
                        <Package className="w-8 h-8 text-gray-400 m-auto mt-4"/>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{part.name}</p>
                      <p className="text-sm text-gray-500">Price: ₹{part.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: Total & Instruction */}
              <div className="bg-[#003B6A] text-white p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-80">Total Amount</p>
                  <p className="text-xl font-bold">₹{booking.totalAmount}</p>
                </div>
                <div className="text-right text-xs opacity-90">
                  <p>Please visit our shop with this ID.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPartsBookings;