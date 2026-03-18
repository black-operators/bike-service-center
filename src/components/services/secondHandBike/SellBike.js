import React, { useState, useEffect } from "react";
import { 
  Upload, X, FileText, ArrowLeft,
  HelpCircle, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { getUser, getAuthToken } from "../../../api/auth"; 

const SellBike = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ New Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    ownerName: "", phone: "", bikeName: "", make: "", registrationYear: "",
    trim: "", kmDriven: "", noOfOwners: "", fuelType: "Petrol",
    engineCapacity: "", bodyType: "", registrationNumber: "",
    expectedPrice: "", location: "", description: ""
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login", { state: { from: "/services/second-hand/sell" } });
      return;
    }

    const loggedInUser = getUser(); 
    if (loggedInUser) {
      setFormData(prev => ({
        ...prev,
        ownerName: loggedInUser.name || "",
        phone: loggedInUser.phone || ""
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Triggered by Form Submit
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) {
        setErrorMsg("Please upload a photo of your bike.");
        return;
    }
    setShowConfirm(true);
  };

  // ✅ Final API Execution
  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setErrorMsg("");

    const data = new FormData();
    data.append("image", imageFile);
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      await axiosInstance.post("/bikes/sell", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setShowSuccess(true);
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to list bike. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 flex justify-center relative">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 font-bold hover:text-[#003B6A] transition bg-white px-4 py-2 rounded-full shadow-sm z-10"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-xl border border-gray-100 mt-12 mb-10">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800">Sell Your Bike</h2>
            <p className="text-gray-500 text-sm mt-1">Enter vehicle details as per RC document</p>
        </div>

        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="w-full">
            {!preview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition h-48">
                <input type="file" id="sellBikeImageUpload" accept="image/*" onChange={handleImageChange} className="hidden" required />
                <label htmlFor="sellBikeImageUpload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                      <Upload className="text-[#003B6A]" size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600">Tap to Upload Bike Photo</p>
                  <p className="text-xs text-gray-400 mt-1">Max size 5MB (JPG/PNG)</p>
                </label>
              </div>
            ) : (
              <div className="relative h-64 border rounded-2xl overflow-hidden group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button type="button" onClick={() => {setPreview(null); setImageFile(null)}} className="bg-white text-red-600 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"><X size={16}/> Remove Photo</button>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Info Grid */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <FileText size={18} className="text-[#003B6A]"/> Vehicle Information
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Registration Year</label><input type="number" name="registrationYear" onChange={handleChange} required className="w-full border px-4 py-2 rounded-lg" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Make</label><input type="text" name="make" onChange={handleChange} required className="w-full border px-4 py-2 rounded-lg" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Model</label><input type="text" name="bikeName" onChange={handleChange} required className="w-full border px-4 py-2 rounded-lg" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Trim</label><input type="text" name="trim" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">KMs Driven</label><input type="number" name="kmDriven" onChange={handleChange} required className="w-full border px-4 py-2 rounded-lg" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">No. of Owners</label><input type="number" name="noOfOwners" onChange={handleChange} required className="w-full border px-4 py-2 rounded-lg" /></div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Fuel Type</label>
                    <select name="fuelType" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg bg-white">
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                        <option value="Diesel">Diesel</option>
                    </select>
                </div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Engine (CC)</label><input type="text" name="engineCapacity" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Body Type</label><input type="text" name="bodyType" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Registration (RTO)</label><input type="text" name="registrationNumber" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" /></div>
             </div>
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Expected Price (₹)</label><input type="number" name="expectedPrice" onChange={handleChange} required className="w-full border px-4 py-3 rounded-xl text-lg font-bold text-[#003B6A]" /></div>
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Location</label><input type="text" name="location" onChange={handleChange} required className="w-full border px-4 py-3 rounded-xl" /></div>
          </div>

          {/* Seller Details */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-[#003B6A] mb-3 text-sm uppercase">Seller Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="ownerName" value={formData.ownerName} readOnly className="w-full border px-4 py-2 rounded-lg bg-gray-100 text-gray-500" />
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full border px-4 py-2 rounded-lg bg-white" />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#003B6A] text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition">List Bike Now</button>
        </form>
      </div>

      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={48} className="text-[#003B6A]" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">List for Sale?</h3>
                <p className="text-gray-500 mb-8">Are you sure you want to list your <span className="font-bold text-[#003B6A]">{formData.bikeName}</span> for <span className="font-bold text-gray-900">₹{formData.expectedPrice}</span>?</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">No</button>
                    <button onClick={handleFinalSubmit} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition">Yes, List</button>
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
                <h3 className="text-3xl font-black text-gray-900 mb-2">Bike Listed!</h3>
                <p className="text-gray-500 mb-8">Your listing has been received. Please wait for admin approval before it becomes visible in the store.</p>
                <button 
                    onClick={() => navigate("/services/second-hand/buy")}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg"
                >
                    Back to Store
                </button>
            </div>
        </div>
      )}

      {/* ✅ ERROR MESSAGE MODAL */}
      {errorMsg && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setErrorMsg("")}></div>
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
                <p className="text-gray-500 mb-6">{errorMsg}</p>
                <button onClick={() => setErrorMsg("")} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                    Try Again
                </button>
            </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[400] bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#003B6A]" size={48} />
        </div>
      )}
    </div>
  );
};

export default SellBike;