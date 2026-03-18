import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import Loader from '../../common/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Loader2
} from 'lucide-react';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Modal States
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [successModal, setSuccessModal] = useState({ open: false, msg: "" });
  const [errorModal, setErrorModal] = useState({ open: false, msg: "" });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/bookings/my-bookings'); 
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const triggerCancel = (id) => {
    setConfirmModal({ open: true, id });
  };

  const handleFinalCancel = async () => {
    const bookingId = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    setActionLoading(true);

    try {
      await axiosInstance.put(`/bookings/cancel/${bookingId}`);
      fetchBookings();
      setSuccessModal({ open: true, msg: 'Booking cancelled successfully!' });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setErrorModal({ open: true, msg: error.response?.data?.message || 'Failed to cancel booking' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <Link to="/book-service" className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition">
          + New Booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 font-medium mb-4 text-lg">You haven't booked any services yet.</p>
          <Link to="/book-service" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            Book Your First Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {booking.serviceType || 'General Service'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Vehicle: <span className="font-semibold text-gray-800">{booking.vehicleNumber}</span></p>
                  <p>Date: <span className="font-semibold text-gray-800">{new Date(booking.bookingDate).toLocaleDateString()}</span></p>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[120px] text-right">
                {booking.status === 'PENDING' && (
                    <button 
                      onClick={() => triggerCancel(booking._id)}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition border border-red-200"
                    >
                      Cancel
                    </button>
                )}

                {booking.status === 'COMPLETED' && (
                    <button 
                      onClick={() => navigate('/reviews')}
                      className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 transition border border-blue-200"
                    >
                      Rate Service
                    </button>
                )}
                <span className="text-xs text-gray-400 mt-2 block">ID: {booking._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ YES/NO CONFIRMATION MODAL - FIXED TO CENTER OF SCREEN */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal({ open: false, id: null })}></div>
          <div className="relative z-[2001] w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={48} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-gray-500 mb-8">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal({ open: false, id: null })} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">No</button>
              <button onClick={handleFinalCancel} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SUCCESS MODAL - FIXED TO CENTER OF SCREEN */}
      {successModal.open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSuccessModal({ open: false, msg: "" })}></div>
          <div className="relative z-[2001] w-full max-w-md bg-white rounded-[35px] p-10 shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={50} className="text-green-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500 mb-8">{successModal.msg}</p>
            <button onClick={() => setSuccessModal({ open: false, msg: "" })} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl">Got it</button>
          </div>
        </div>
      )}

      {/* ✅ ERROR MODAL - FIXED TO CENTER OF SCREEN */}
      {errorModal.open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setErrorModal({ open: false, msg: "" })}></div>
          <div className="relative z-[2001] w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
            <p className="text-gray-500 mb-6">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({ open: false, msg: "" })} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">Try Again</button>
          </div>
        </div>
      )}

      {/* Full-screen Loading Overlay for Actions */}
      {actionLoading && (
        <div className="fixed inset-0 z-[3000] bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      )}
    </div>
  );
};

export default BookingHistory;