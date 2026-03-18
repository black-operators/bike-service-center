import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { 
  Loader2, CheckCircle, XCircle, Clock, Calendar, 
  User, Phone, Mail, Eye, X, MapPin, AlertTriangle 
} from "lucide-react";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, newStatus: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const handleUpdateStatus = async () => {
    const { id, newStatus } = confirmModal;
    if(!id || !newStatus) return;

    try {
        await axiosInstance.put(`/bookings/update-status/${id}`, { status: newStatus });
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
        showStatusPopup("Status Updated Successfully!", false);
    } catch (err) {
        console.error("Update failed:", err);
        showStatusPopup("Failed to update status.", true);
    } finally {
        setConfirmModal({ show: false, id: null, newStatus: '' });
    }
  };

    // ✅ Reliability fix: Helper function for status colors
    const getStatusStyles = (status) => {
        switch (status) {
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'CONFIRMED':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'COMPLETED':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'CANCELLED':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

  const filteredBookings = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#003B6A]" size={40} /></div>;

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

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Manage Bookings</h2>
           <p className="text-gray-500 text-sm">Review customer service requests</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm overflow-x-auto w-full sm:w-auto">
          {['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-md transition whitespace-nowrap ${
                filter === status ? 'bg-[#003B6A] text-white shadow' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No bookings found.</p>
        ) : (
            filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition duration-300">
              
              <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-wrap items-center gap-3">
                    {/* ✅ Fixed Status Badge using helper function */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(booking.status)}`}>
                        {booking.status}
                    </span>
                    
                    <h3 className="text-lg font-bold text-gray-800">{booking.serviceType}</h3>
                    
                    <span className="bg-gray-800 text-white font-mono tracking-wider text-xs px-2 py-1 rounded shadow-sm">
                        ID: {booking.bookingId || booking._id.slice(-6).toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Customer</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                                {booking.user?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{booking.user?.name}</p>
                                <p className="text-[#003B6A] font-bold text-xs flex items-center gap-1 mt-0.5">
                                    <Phone size={10}/> {booking.user?.phone || "No Phone"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Vehicle</p>
                        <p className="font-bold text-gray-800 uppercase flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400"/> {booking.vehicleNumber}
                        </p>
                        <p className="text-gray-500 text-xs ml-4">{booking.vehicleModel}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Schedule</p>
                        <p className="font-bold text-gray-800 flex items-center gap-1">
                            <Calendar size={12}/> {booking.bookingDate}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                            <Clock size={12}/> {booking.timeSlot}
                        </p>
                    </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto min-w-0 sm:min-w-[170px]">
                {booking.status === 'PENDING' && (
                    <>
                    <button 
                        onClick={() => setConfirmModal({ show: true, id: booking._id, newStatus: 'CONFIRMED' })}
                        className="bg-[#003B6A] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 flex items-center justify-center gap-2 transition shadow-sm"
                    >
                        <CheckCircle size={16}/> Approve Booking
                    </button>
                    <button 
                        onClick={() => setConfirmModal({ show: true, id: booking._id, newStatus: 'CANCELLED' })}
                        className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition"
                    >
                        <XCircle size={16}/> Reject Request
                    </button>
                    </>
                )}
                
                {booking.status === 'CONFIRMED' && (
                     <button 
                        onClick={() => setConfirmModal({ show: true, id: booking._id, newStatus: 'COMPLETED' })}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition shadow-sm"
                     >
                        <CheckCircle size={16}/> Mark Completed
                     </button>
                )}

                <button 
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center justify-center gap-2 transition"
                >
                    <Eye size={16}/> View Details
                </button>
              </div>

            </div>
          )))
        }
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-6 text-sm">Do you really want to mark this booking as <span className="font-black text-gray-700 uppercase">{confirmModal.newStatus}</span>?</p>
            
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({show: false, id: null, newStatus: ''})} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">No, Cancel</button>
              <button onClick={handleUpdateStatus} className="flex-1 py-3 bg-[#003B6A] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all">Yes, Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal section remains unchanged */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
                <div className="bg-[#003B6A] text-white p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Booking Details</h3>
                        <p className="text-blue-200 text-sm opacity-90 mt-1">
                            Transaction ID: #{selectedBooking.bookingId || selectedBooking._id}
                        </p>
                    </div>
                    <button onClick={() => setSelectedBooking(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
                        <X size={24}/>
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-gray-400 font-bold uppercase text-xs mb-3 border-b pb-1">Customer Information</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="text-[#003B6A]" size={20}/>
                                <span className="font-bold text-gray-800 text-xl">{selectedBooking.user?.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="text-gray-400" size={20}/> 
                                <span className="text-sm">{selectedBooking.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#003B6A] font-bold">
                                <Phone className="text-[#003B6A]" size={20}/> 
                                <span className="text-lg">{selectedBooking.user?.phone || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-gray-400 font-bold uppercase text-xs mb-3 border-b pb-1">Service Details</h4>
                        <p className="text-2xl font-black text-[#003B6A] mb-2">{selectedBooking.serviceType}</p>
                        <p className="font-bold text-gray-800 uppercase text-lg">Vehicle: {selectedBooking.vehicleNumber}</p>
                        <p className="text-gray-500 text-base">Model: {selectedBooking.vehicleModel}</p>
                    </div>

                    <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-around items-center gap-4 mt-2">
                         <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Date</p>
                            <p className="text-xl font-bold text-gray-800">{selectedBooking.bookingDate}</p>
                         </div>
                         <div className="hidden md:block w-px bg-gray-300 h-10"></div>
                         <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Time</p>
                            <p className="text-xl font-bold text-gray-800">{selectedBooking.timeSlot}</p>
                         </div>
                         <div className="hidden md:block w-px bg-gray-300 h-10"></div>
                         <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Price</p>
                            <p className="text-3xl font-black text-[#003B6A]">₹{selectedBooking.price}</p>
                         </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 text-center border-t">
                    <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-gray-800 font-bold text-sm uppercase tracking-wider">Close Window</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;