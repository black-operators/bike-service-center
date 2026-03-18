import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { getUser, getAuthToken } from "../../../api/auth";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, Loader2, AlertTriangle 
} from "lucide-react";

const Inspection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bikeName: "", phone: "", address: "", preferredDate: ""
  });
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  // ✅ Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setShowLoginAlert(true); // Replace alert with Modal
      return;
    }
    
    const user = getUser();
    if (user) {
      setFormData(prev => ({ ...prev, phone: user.phone || "" }));
    }
  }, []);

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/bikes/inspection", formData);
      setShowSuccess(true);
      setFormData({ bikeName: "", phone: "", address: "", preferredDate: "" });
    } catch (err) {
      showStatusPopup("Error submitting request.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 flex justify-center px-4 relative">
      
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 font-bold hover:text-[#003B6A] transition bg-white px-4 py-2 rounded-full shadow-sm z-10"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <form onSubmit={handlePreSubmit} className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-xl space-y-5 mt-14 border border-gray-100">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-800">Book Expert Inspection</h2>
            <p className="text-gray-500 text-sm mt-2">Our technical experts will visit the location to perform a 40-point check on the bike.</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Bike Model</label>
                <input type="text" placeholder="e.g. Yamaha MT-15" className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#003B6A] bg-gray-50/50" value={formData.bikeName} onChange={(e)=>setFormData({...formData, bikeName: e.target.value})} required />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Contact Number</label>
                <input type="tel" placeholder="Your Phone Number" className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#003B6A] bg-gray-50/50" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} required />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Preferred Date</label>
                <input type="date" className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#003B6A] bg-gray-50/50" value={formData.preferredDate} onChange={(e)=>setFormData({...formData, preferredDate: e.target.value})} required />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Inspection Address</label>
                <textarea placeholder="Where is the bike located?" className="w-full border p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[#003B6A] bg-gray-50/50" rows="3" value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} required />
            </div>
        </div>
        
        <button type="submit" disabled={isSubmitting} className="w-full bg-[#003B6A] text-white py-4 rounded-xl font-black text-lg hover:bg-black transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
        </button>
      </form>

      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center border border-gray-100">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={48} className="text-[#003B6A]" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Book Now?</h3>
                <p className="text-gray-500 mb-8">Confirm inspection booking for <span className="font-bold text-[#003B6A]">{formData.bikeName}</span> on <span className="font-bold text-gray-900">{formData.preferredDate}</span>?</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">No, Edit</button>
                    <button onClick={handleFinalSubmit} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-900/20">Yes, Book</button>
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
                <p className="text-gray-500 mb-8">Inspection request submitted. Our representative will call you within 24 hours to confirm the visit.</p>
                <button 
                    onClick={() => setShowSuccess(false)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl"
                >
                    Got it
                </button>
            </div>
        </div>
      )}

      {/* ✅ LOGIN ALERT MODAL */}
      {showLoginAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginAlert(false)}></div>
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={48} className="text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Login Required</h3>
                <p className="text-gray-500 mb-8">Please login to your account to book a professional bike inspection.</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowLoginAlert(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">Cancel</button>
                    <button onClick={() => navigate("/login", { state: { from: "/services/second-hand/inspection" } })} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition">Login Now</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Inspection;