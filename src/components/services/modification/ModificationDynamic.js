import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import {
  Palette,
  Zap,
  Flame,
  ArrowLeft,
  Loader2,
  Clock,
  Calendar,
  Truck,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

import bgImage from '../../../assets/gallery/services/BGImage.jpeg';

const themeConfig = {
  body: {
    title: "Body Customization",
    accent: "text-purple-400",
    border: "border-purple-500/30",
    ring: "focus:ring-purple-500",
    iconBg: "bg-white/10",
    chipBg: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Palette,
    subtitle: "Transform your bike's look with paint and wraps.",
    gradient: "from-purple-500/20 to-slate-900/90",
    glow: "hover:shadow-purple-500/20",
    featureColor: "bg-purple-400"
  },
  engine: {
    title: "Engine Tuning",
    accent: "text-yellow-400",
    border: "border-yellow-500/30",
    ring: "focus:ring-yellow-500",
    iconBg: "bg-white/10",
    chipBg: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Zap,
    subtitle: "Unlock performance with ECU and engine tuning.",
    gradient: "from-yellow-500/20 to-slate-900/90",
    glow: "hover:shadow-yellow-500/20",
    featureColor: "bg-yellow-400"
  },
  exhaust: {
    title: "Exhaust Systems",
    accent: "text-red-400",
    border: "border-red-500/30",
    ring: "focus:ring-red-500",
    iconBg: "bg-white/10",
    chipBg: "bg-red-50 text-red-700 border-red-200",
    icon: Flame,
    subtitle: "Premium sound and full system exhaust upgrades.",
    gradient: "from-red-500/20 to-slate-900/90",
    glow: "hover:shadow-red-500/20",
    featureColor: "bg-red-400"
  },
};

const TIME_SLOTS = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];

const ModificationDynamic = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const activeTheme = themeConfig[type] || themeConfig.body;

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false); 
  
  // Success/Error Modal State
  const [modalStatus, setModalStatus] = useState({ open: false, type: "", msg: "" });

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleModel: "",
    date: "",
    timeSlot: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const minDate = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(
          `/services?category=modification&type=${type}`
        );
        setPackages(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [type]);

  useEffect(() => {
    if (selectedPackage || showConfirm || modalStatus.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [selectedPackage, showConfirm, modalStatus.open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSelectedPackage(null);
        setShowConfirm(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetForm = () => {
    setFormData({ vehicleNumber: "", vehicleModel: "", date: "", timeSlot: "" });
  };

  const openBooking = (pkg) => {
    setSelectedPackage(pkg);
    resetForm();
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    if (!selectedPackage) return;

    try {
      setSubmitting(true);
      await axiosInstance.post("/bookings", {
        serviceType: selectedPackage.name,
        serviceCategory: "MODIFICATION",
        vehicleNumber: formData.vehicleNumber,
        vehicleModel: formData.vehicleModel,
        bookingDate: formData.date,
        timeSlot: formData.timeSlot,
        price: selectedPackage.price,
        status: "PENDING",
      });

      setSelectedPackage(null);
      setModalStatus({ open: true, type: "success", msg: "Booking request sent successfully!" });
    } catch (err) {
      console.error(err);
      setModalStatus({ open: true, type: "error", msg: "Booking failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent pb-16"
    style={{ 
      backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url(${bgImage})` 
    }}
    >
      {/* HEADER */}
      <div className="bg-transparent text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 md:left-10 md:top-8 inline-flex items-center gap-2 text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-sm transition z-30"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            {activeTheme.title.split(" ")[0]}{" "}
            <span className={activeTheme.accent}>
              {activeTheme.title.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg opacity-80">
            {activeTheme.subtitle}
          </p>
        </div>
      </div>

      {/* CARDS - Updated UI */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8 relative z-20">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`
                relative group cursor-pointer rounded-3xl p-8 
                border backdrop-blur-md transition-all duration-500 
                hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                bg-gradient-to-br ${activeTheme.gradient} ${activeTheme.glow}
                flex flex-col justify-between h-full overflow-hidden
              `}
            >
              {/* Top Icon Area */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-4 rounded-2xl backdrop-blur-xl ring-1 ring-white/20 ${activeTheme.iconBg}`}>
                  <activeTheme.icon className={`w-6 h-6 ${activeTheme.accent}`} />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">₹{pkg.price}</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="relative z-10 flex-grow flex flex-col ">
                <h2 className="text-2xl font-bold text-white mb-2 whitespace-nowrap truncate">{pkg.name}</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-12">{pkg.description}</p>
                
                <button
                  onClick={() => openBooking(pkg)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition font-bold backdrop-blur-sm"
                >
                  Book Now
                </button>
              </div>

              {/* Bottom Shine Effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />
            </div>
          ))}
        </div>
      </div>

      {/* BOOKING FORM MODAL */}
      {selectedPackage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => !submitting && setSelectedPackage(null)}
          />
          <div className="relative z-10 w-full max-w-3xl">
            <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${activeTheme.iconBg} bg-opacity-100`}>
                    <activeTheme.icon className={`w-6 h-6 ${activeTheme.accent}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Confirm Booking</h2>
                    <p className="text-sm text-gray-500">{selectedPackage.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPackage(null)}
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
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${activeTheme.ring}`}
                          required
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Bike Model</label>
                      <div className="relative">
                        <activeTheme.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="e.g. Royal Enfield Classic 350"
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${activeTheme.ring}`}
                          required
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Select Date</label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          min={minDate}
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${activeTheme.ring} bg-white`}
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Time Slot</label>
                      <div className="relative">
                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          className={`w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 ${activeTheme.ring} bg-white`}
                          required
                          value={formData.timeSlot}
                          onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        >
                          <option value="">Choose a slot</option>
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
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
      )}

      {/* YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={32} className="text-[#003B6A]" />
            </div>
            <h3 className="text-2xl font-black text-center text-gray-900 mb-3">Confirm Submission?</h3>
            <p className="text-gray-500 text-center mb-8">
              Are you sure you want to book the <span className="font-bold text-gray-900">{selectedPackage?.name}</span> package for <span className="font-bold text-gray-900">{formData.date}</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                No, Edit
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 py-4 rounded-2xl font-bold bg-[#003B6A] text-white hover:bg-[#002e53] shadow-lg shadow-blue-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : "Yes, Book"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS / ERROR STATUS MODAL */}
      {modalStatus.open && (
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
      )}
    </div>
  );
};

export default ModificationDynamic;