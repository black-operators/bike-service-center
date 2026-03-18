import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { 
  Calendar, Clock, Truck, CheckCircle, 
  AlertCircle, ShieldCheck, ArrowLeft, IndianRupee,
  HelpCircle, CheckCircle2
} from 'lucide-react';

const WashingBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const service = location.state?.service; 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ✅ Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleModel: '',
    date: '',
    timeSlot: ''
  });

  const timeSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", 
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  if (!service) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Service Selected</h2>
            <p className="text-gray-500 mb-4">Please select a washing plan first.</p>
            <button 
                onClick={() => navigate('/services', { state: { selectedService: 'washing' } })} 
                className="bg-[#003B6A] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition"
            >
                Go Back to Plans
            </button>
        </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Step 1: Trigger Confirmation Modal
  const handlePreSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please login first to book a service!");
      setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 2000);
      return;
    }
    setShowConfirm(true);
  };

  // ✅ Step 2: Final API Execution
  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        serviceType: service.name,
        vehicleNumber: formData.vehicleNumber,
        vehicleModel: formData.vehicleModel,
        bookingDate: formData.date,
        timeSlot: formData.timeSlot,
        price: service.price || 0,
        status: 'PENDING'
      };

      const res = await axiosInstance.post('/bookings', bookingData);
      
      if (res.data.success) {
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/services', { state: { selectedService: 'washing' } })} 
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#003B6A] font-bold bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md"
        >
          <ArrowLeft size={20} /> Back to Washing Plans
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Service Details Card */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-t-[#003B6A] h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">{service.description}</p>
            
            <ul className="space-y-4 mb-8">
              {service.features && service.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium text-sm">
                   <CheckCircle size={18} className="text-green-500 shrink-0" /> {feature}
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-dashed border-gray-200">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Price</p>
              <p className="text-4xl font-black text-[#003B6A] mt-2 flex items-center">
                 <IndianRupee size={28}/> {service.price}
              </p>
            </div>
          </div>

          {/* Right Side: Booking Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="text-[#003B6A]" /> Confirm Booking
            </h3>

            {/* Error Message Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100">
                <AlertCircle size={24} /> <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handlePreSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Number</label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      placeholder="e.g. WB 00 AB 1234"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] focus:border-transparent outline-none transition-all"
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bike Model</label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    placeholder="e.g. Royal Enfield Classic 350"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] focus:border-transparent outline-none transition-all"
                    required
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] focus:border-transparent outline-none transition-all cursor-pointer"
                    required
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] focus:border-transparent outline-none bg-white appearance-none cursor-pointer"
                      required
                      onChange={handleChange}
                    >
                      <option value="">Choose a slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
                 <ShieldCheck className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                 <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>Booking Info:</strong> Your request will be reviewed by admin. Payment can be made at the shop after the service is completed.
                 </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-extrabold text-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#003B6A] hover:bg-blue-800'
                }`}
              >
                {loading ? "Processing Booking..." : `Confirm Booking • ₹${service.price}`}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center border border-gray-100">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={48} className="text-[#003B6A]" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Confirm Order?</h3>
                <p className="text-gray-500 mb-8">Confirm <span className="font-bold text-[#003B6A]">{service.name}</span> for your <span className="font-bold text-gray-900">{formData.vehicleModel}</span>?</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">No, Edit</button>
                    <button onClick={handleFinalSubmit} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition">Yes, Book</button>
                </div>
            </div>
        </div>
      )}

      {/* ✅ SUCCESS MESSAGE MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
            <div className="bg-white rounded-[35px] p-10 max-w-sm w-full relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-500 mb-8">Your washing appointment for <span className="font-bold text-gray-900">{service.name}</span> has been booked successfully.</p>
                <button 
                    onClick={() => navigate('/my-bookings')}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl"
                >
                    View My Bookings
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default WashingBooking;