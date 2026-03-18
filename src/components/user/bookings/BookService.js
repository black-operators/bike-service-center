import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { 
  Calendar, Clock, Truck, Wrench, 
  FileText, CheckCircle, ChevronDown, AlertTriangle 
} from 'lucide-react';

const BookService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  // ফর্ম ডেটা
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceCategory: 'Washing',
    vehicleNumber: '',
    vehicleModel: '',
    bookingDate: '',
    timeSlot: '',
    description: '',
    price: 0
  });

  // ফিক্সড অপশনস (তুমি চাইলে পরে API থেকে আনতে পারো)
  const serviceOptions = [
    "General Service", "Oil Change", "Brake Repair", 
    "Engine Diagnostics", "Battery Replacement", 
    "Basic Wash", "Premium Detailing", 
    "EV Motor Check", "EV Battery Health"
  ];

  const timeSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM","02:30 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showStatusPopup("Session expired. Please login again.", true);
        navigate('/login');
        return;
      }

      // ১. ভ্যালিডেশন চেক
      if (!formData.serviceType || !formData.vehicleNumber || !formData.bookingDate || !formData.timeSlot) {
        showStatusPopup("Please fill in all required fields marked with *", true);
        setLoading(false);
        return;
      }

      // २. बुकिং ডেটা रेडी करना
      const bookingData = {
        serviceType: formData.serviceType,
        serviceCategory: formData.serviceCategory,
        vehicleNumber: formData.vehicleNumber,
        vehicleModel: formData.vehicleModel || "Unknown Model", // মডেল না দিলে ডিফল্ট ভ্যালু
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        price: formData.price
      };

      // ৩. সার্ভারে পাঠানো
      await axiosInstance.post('/bookings', bookingData);
      
      showStatusPopup("Service booked successfully! Check 'My Bookings' for status.", false);
      
      // ২ সেকেন্ড পর রিডাইরেক্ট
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);

    } catch (err) {
      console.error(err);
      showStatusPopup(err.response?.data?.message || "Failed to book service. Please check your inputs.", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      
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
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-800">Book A New Service</h1>
        <p className="text-gray-500 mt-2">Fill in the details to schedule an appointment with our experts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: The Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Service Type Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Service Type *</label>
              <div className="relative">
                <Wrench className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all"
                  required
                >
                  <option value="">Select a Service...</option>
                  {serviceOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Vehicle Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Number *</label>
                <div className="relative">
                  <Truck className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="vehicleNumber"
                    placeholder="WB 02 AB 1234"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  placeholder="e.g. Pulsar 150, Activa 6G"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="bookingDate"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.bookingDate}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Time Slot *</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all"
                    required
                  >
                    <option value="">Select Time...</option>
                    {timeSlots.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Problem Description (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <textarea
                  name="description"
                  placeholder="Describe any specific issues, noises, or requests..."
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {loading ? "Processing Booking..." : "Confirm Appointment"}
            </button>
          </form>
        </div>

        {/* Right Side: Info Card */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 blur-3xl rounded-full"></div>
            <h3 className="text-xl font-bold mb-4">Why Book Online?</h3>
            <ul className="space-y-4 text-blue-100">
              <li className="flex items-center gap-2">
                <CheckCircle size={18} /> Priority Service Slot
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={18} /> Track Real-time Status
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={18} /> Transparent Pricing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={18} /> Digital Invoice History
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-white p-6 rounded-3xl shadow border border-gray-100 text-center">
            <h4 className="font-bold text-gray-800 mb-2">Need Help?</h4>
            <p className="text-gray-500 text-sm mb-4">Not sure what service to choose? Call our expert.</p>
            <a href="tel:+919876543210" className="text-blue-600 font-bold hover:underline">
              +91 8240429417
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;