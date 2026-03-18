import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axiosInstance from "../../../api/axiosInstance";
import { Loader2, Zap, ArrowLeft, CheckCircle, Battery, Settings, Wrench, AlertTriangle, X } from "lucide-react";

const EvServicesDynamic = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });
  
  // Booking Modal States
  const [selectedService, setSelectedService] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ vehicleNumber: "", vehicleModel: "", phone: "", bookingDate: "", timeSlot: "" });

  useEffect(() => {
    fetchEvServices();
  }, []);

  useEffect(() => {
    const isOpen = selectedService || showSuccess;
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    };
  }, [selectedService, showSuccess]);

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const fetchEvServices = async () => {
    try {
      const res = await axiosInstance.get("/services");
      // Shudhu 'ev-service' category filter hobe
      const evData = res.data.filter(s => s.category.toLowerCase() === "ev-service");
      setServices(evData);
    } catch (error) {
      console.error("Error fetching EV services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (service) => {
    if (!localStorage.getItem("token")) return navigate("/login");
    setSelectedService(service);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await axiosInstance.post("/bookings", { 
        ...formData, 
        serviceType: selectedService.name, 
        serviceCategory: "EV", // Admin dashboard filter-er jonno
        price: selectedService.price,
        status: "PENDING"
      });
      setSelectedService(null);
      setShowSuccess(true);
    } catch (err) {
      showStatusPopup("Booking failed. Fill all fields.", true);
    } finally {
      setBookingLoading(false);
    }
  };

  // Dynamic Icon Selection based on name
  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('battery')) return <Battery className="text-green-500" />;
    if (n.includes('motor')) return <Settings className="text-purple-500" />;
    if (n.includes('charging')) return <Zap className="text-blue-500" />;
    return <Wrench className="text-gray-600" />;
  };

  const bookingModal = selectedService
    ? createPortal(
        <div className="fixed inset-0 z-[99999]">
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-md"
            onClick={() => !bookingLoading && setSelectedService(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-2xl">
              <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100">
                <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-blue-50">
                      <Zap className="w-6 h-6 text-blue-600" />
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
                    <ArrowLeft size={20} className="text-gray-600" />
                  </button>
                </div>

                <div className="p-7 max-h-[70vh] overflow-y-auto">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Vehicle Number</label>
                        <input type="text" required placeholder="e.g. WB 00 AB 1234" onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})} className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Vehicle Model</label>
                        <input type="text" required placeholder="e.g. Ather 450X" onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})} className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                      <input type="tel" required placeholder="Enter your phone number" onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Select Date</label>
                        <input type="date" required onChange={(e) => setFormData({...formData, bookingDate: e.target.value})} className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Time Slot</label>
                        <select required onChange={(e) => setFormData({...formData, timeSlot: e.target.value})} className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">Choose a slot</option>
                          <option value="10:00 AM">10:00 AM - 12:00 PM</option>
                          <option value="12:00 PM">12:00 PM - 02:00 PM</option>
                          <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                          <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <button disabled={bookingLoading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-extrabold text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                      {bookingLoading ? <><Loader2 className="animate-spin" size={20} /> Booking...</> : "Confirm Service Booking"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  const successModal = showSuccess
    ? createPortal(
        <div className="fixed inset-0 z-[99999]">
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-md"
            onClick={() => setShowSuccess(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md">
              <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100">
                <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-50">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900">Success!</h2>
                  </div>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
                <div className="p-7 text-center">
                  <p className="text-gray-600 mb-6">Your EV service request is registered. Admin will contact you shortly.</p>
                  <button 
                    onClick={() => setShowSuccess(false)} 
                    className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-extrabold hover:bg-emerald-700 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
  
  if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      {services.map((service) => (
        <div key={service._id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800">
              {getIcon(service.name)} {service.name}
            </h2>
            <p className="text-gray-500 text-sm mb-4 line-clamp-3">{service.description}</p>
            <p className="text-2xl font-black text-[#003B6A] mb-6">₹{service.price}</p>
          </div>
          <button 
            onClick={() => handleBookingClick(service)} 
            className="w-full bg-[#003B6A] text-white py-3 rounded-xl hover:bg-blue-800 transition font-bold shadow-lg shadow-blue-100"
          >
            Book Now
          </button>
        </div>
      ))}

      {bookingModal}
      {successModal}
    </div>
  );
};

export default EvServicesDynamic;
