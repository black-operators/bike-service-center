import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Battery, Zap, Settings, Wrench, 
  Thermometer, ShieldCheck, Loader2, 
  AlertCircle, X, HelpCircle, CheckCircle2, Truck, Flame, Clock, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

const EVOverview = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedService, setSelectedService] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Success/Error Modal State
  const [modalStatus, setModalStatus] = useState({ open: false, type: "", msg: "" });
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [formData, setFormData] = useState({ vehicleNumber: "", vehicleModel: "", phone: "", bookingDate: "", timeSlot: "" });

  // Theme config for consistent styling in modals
  const themeConfig = {
    accent: "text-green-500",
    border: "border-t-green-500",
    ring: "focus:ring-green-500",
    iconBg: "bg-green-50",
  };

  useEffect(() => {
    const fetchEvServices = async () => {
      try {
        const res = await axiosInstance.get("/services");
        const evData = res.data.filter(s => s.category?.toLowerCase().trim() === "ev-service");
        setServices(evData);
      } catch (error) { console.error("Error:", error); } 
      finally { setLoading(false); }
    };
    fetchEvServices();
  }, []);

  useEffect(() => {
    if (selectedService || showConfirmModal || modalStatus.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [selectedService, showConfirmModal, modalStatus.open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSelectedService(null);
        setShowConfirmModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleBookingClick = (service) => {
    if (!localStorage.getItem("token")) return navigate("/login");
    setSelectedService(service);
    setFormData({ vehicleNumber: "", vehicleModel: "", phone: "", bookingDate: "", timeSlot: "" });
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    if(!selectedService) return;
    
    setBookingLoading(true);
    try {
      await axiosInstance.post("/bookings", { 
        ...formData, 
        serviceType: selectedService.name, 
        serviceCategory: "EV", 
        price: selectedService.price,
        status: "PENDING"
      });
      setSelectedService(null);
      setModalStatus({ open: true, type: "success", msg: "EV Service booking request sent successfully!" });
    } catch (err) { 
      setModalStatus({ open: true, type: "error", msg: "Booking failed. Please fill all fields and try again." });
    } 
    finally { setBookingLoading(false); }
  };

  // Helper to determine icon and color based on service name
  const getServiceStyle = (name) => {
    const n = name.toLowerCase();
    if (n.includes('battery')) return { 
      icon: <Battery className="w-6 h-6 text-green-400" />, 
      color: 'from-green-500/20 to-slate-900/90 border-green-500/30',
      glow: 'hover:shadow-green-500/20'
    };
    if (n.includes('motor')) return { 
      icon: <Settings className="w-6 h-6 text-purple-400" />, 
      color: 'from-purple-500/20 to-slate-900/90 border-purple-500/30',
      glow: 'hover:shadow-purple-500/20'
    };
    if (n.includes('charging')) return { 
      icon: <Zap className="w-6 h-6 text-blue-400" />, 
      color: 'from-blue-500/20 to-slate-900/90 border-blue-500/30',
      glow: 'hover:shadow-blue-500/20'
    };
    return { 
      icon: <Wrench className="w-6 h-6 text-gray-400" />, 
      color: 'from-gray-500/20 to-slate-900/90 border-gray-500/30',
      glow: 'hover:shadow-gray-500/20'
    };
  };

  return (
    <div className="min-h-screen bg-transparent pb-16">
      {/* HEADER */}
      <div className="bg-transparent text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Advanced <span className="text-green-400">EV</span> Services</h1>
        <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg opacity-80">Specialized diagnostics and repair for your electric vehicle.</p>
      </div>

      {/* SERVICE GRID - UPDATED UI */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8 relative z-20">
        {loading ? (
          <div className="bg-white/5 backdrop-blur-md p-10 rounded-2xl shadow-md text-center border border-white/10">
            <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" />
            <p className="text-gray-400">Connecting to EV Lab...</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
            {services.map((service) => {
              const style = getServiceStyle(service.name);
              return (
                <div 
                  key={service._id} 
                  className={`
                    relative group cursor-pointer rounded-3xl p-8 
                    border backdrop-blur-md transition-all duration-500 
                    hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                    bg-gradient-to-br ${style.color} ${style.glow}
                    flex flex-col h-full overflow-hidden
                  `}
                >
                  {/* Top Icon Area */}
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl ring-1 ring-white/20">
                      {style.icon}
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-white">₹{service.price}</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="relative z-10 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 whitespace-nowrap truncate">{service.name}</h2>
                      <p className="text-gray-300 text-sm leading-relaxed mb-12">{service.description}</p>
                    </div>
                    <button 
                      onClick={() => handleBookingClick(service)} 
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition font-bold border border-white/20 backdrop-blur-sm mt-auto"
                    >
                      Book Now
                    </button>
                  </div>

                  {/* Bottom Shine Effect */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROTOCOL SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-sm border border-white/10">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-black text-white leading-tight">Professional <br/><span className="text-blue-400">EV Diagnostics</span> Protocol</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <Thermometer className="text-orange-400 mb-2" />
                <h4 className="font-bold text-white">Thermal Scan</h4>
                <p className="text-xs text-gray-400 mt-1">Battery heat analysis</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <ShieldCheck className="text-green-400 mb-2" />
                <h4 className="font-bold text-white">Safety Check</h4>
                <p className="text-xs text-gray-400 mt-1">System integrity test</p>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="w-full h-48 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border-4 border-white/10 shadow-2xl">
              <div className="text-center animate-pulse">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-green-400 mb-2 flex items-center justify-center text-green-400 font-mono text-xl mx-auto">100%</div>
                <p className="text-green-400 font-mono text-xs uppercase tracking-widest">Health Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING FORM MODAL */}
      {selectedService && createPortal((
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => !bookingLoading && setSelectedService(null)}
          />
          <div className="relative z-10 w-full max-w-3xl">
            <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${themeConfig.iconBg}`}>
                    <Zap className={`w-6 h-6 ${themeConfig.accent}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Confirm Booking</h2>
                    <p className="text-sm text-gray-500">{selectedService.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="p-7">
                <form onSubmit={handlePreSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Vehicle Number</label>
                      <div className="relative">
                        <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="e.g. WB 00 AB 1234"
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${themeConfig.ring}`}
                          required
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Vehicle Model</label>
                      <div className="relative">
                        <Flame size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="e.g. Ather 450X"
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${themeConfig.ring}`}
                          required
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <div className="relative">
                      <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${themeConfig.ring}`}
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Select Date</label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${themeConfig.ring} bg-white`}
                          required
                          value={formData.bookingDate}
                          onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Time Slot</label>
                      <div className="relative">
                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${themeConfig.ring} bg-white`}
                          required
                          value={formData.timeSlot}
                          onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        >
                          <option value="">Choose a slot</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="06:00 PM">06:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#003B6A] hover:bg-[#002e53] text-white py-4 rounded-2xl font-extrabold"
                  >
                    Proceed to Confirm
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ), document.body)}

      {/* YES/NO CONFIRMATION MODAL */}
      {showConfirmModal && createPortal((
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={32} className="text-[#003B6A]" />
            </div>
            <h3 className="text-2xl font-black text-center text-gray-900 mb-3">Confirm Submission?</h3>
            <p className="text-gray-500 text-center mb-8">
              Are you sure you want to book the <span className="font-bold text-gray-900">{selectedService?.name}</span> service for <span className="font-bold text-gray-900">{formData.bookingDate}</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                No, Edit
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={bookingLoading}
                className="flex-1 py-4 rounded-2xl font-bold bg-[#003B6A] text-white hover:bg-[#002e53] shadow-lg shadow-blue-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {bookingLoading ? <Loader2 className="animate-spin" size={18} /> : "Yes, Book"}
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {/* SUCCESS / ERROR STATUS MODAL */}
      {modalStatus.open && createPortal((
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-10 shadow-2xl text-center animate-in zoom-in duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${modalStatus.type === "success" ? "bg-emerald-50" : "bg-rose-50"}`}>
              {modalStatus.type === "success" ? (
                <CheckCircle2 size={48} className="text-emerald-600" />
              ) : (
                <AlertCircle size={48} className="text-rose-600" />
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">
              {modalStatus.type === "success" ? "Success!" : "Oops!"}
            </h3>
            <p className="text-gray-500 mb-8">{modalStatus.msg}</p>
            <button
              onClick={() => setModalStatus({ ...modalStatus, open: false })}
              className={`w-full py-4 rounded-2xl font-bold text-white transition shadow-xl ${modalStatus.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              Got it
            </button>
          </div>
        </div>
      ), document.body)}
    </div>
  );
};

export default EVOverview;