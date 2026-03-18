import React, { useEffect, useState } from "react";
import { 
  MapPin, Search, ArrowLeft, X, ChevronLeft, ChevronRight,
  Gauge, User, Fuel, Zap, CheckCircle, HelpCircle, AlertCircle, CheckCircle2, AlertTriangle
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUser } from "../../../api/auth";

const BuyBike = () => {
  const [bikes, setBikes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBike, setSelectedBike] = useState(null); 
  const [showOfferForm, setShowOfferForm] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false); 
  const [showLoginAlert, setShowLoginAlert] = useState(false); 
  const [showSuccess, setShowSuccess] = useState(false); // ✅ Success Modal state
  const [offerPrice, setOfferPrice] = useState("");
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });
  
  const navigate = useNavigate();
  // base for backend requests (ensure /api present)
  const base = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';
  // helper for cloudinary/local urls
  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${base}/uploads/${url}`;
  };

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/bikes");
      setBikes(res.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const handleContactSeller = (bike) => {
    setSelectedBike(bike);
    setModalImageIndex(0);
    setShowOfferForm(false); 
  };

  const getBikeImages = (bike) => {
    const imgs = Array.isArray(bike?.images) && bike.images.length ? bike.images : [bike?.image];
    return imgs.filter(Boolean);
  };

  const goNextModalImage = () => {
    const total = getBikeImages(selectedBike).length;
    if (total <= 1) return;
    setModalImageIndex((prev) => (prev + 1) % total);
  };

  const goPrevModalImage = () => {
    const total = getBikeImages(selectedBike).length;
    if (total <= 1) return;
    setModalImageIndex((prev) => (prev - 1 + total) % total);
  };

  const handleKnowMoreClick = () => {
    const token = getAuthToken();
    if (!token) {
      setShowLoginAlert(true); 
    } else {
      setShowOfferForm(true); 
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    const user = getUser();
    
    try {
      await axiosInstance.post("/bikes/offer", {
        bikeId: selectedBike._id,
        bikeName: selectedBike.bikeName,
        buyerName: user.name,
        buyerPhone: user.phone,
        offerPrice: offerPrice
      });
      
      // ✅ Replaced alert with Success Modal
      setShowSuccess(true); 
      setSelectedBike(null); 
      setOfferPrice("");
    } catch (error) {
      showStatusPopup("Failed to submit offer.", true);
    }
  };

  const filteredBikes = bikes.filter(bike => 
    bike.bikeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bike.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBikeImages = getBikeImages(selectedBike);
  const hasMultipleModalImages = selectedBikeImages.length > 1;
  const currentModalImage = selectedBikeImages[modalImageIndex] || selectedBike?.image;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 relative">
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 font-bold hover:text-[#003B6A] transition bg-white px-4 py-2 rounded-full shadow-sm z-10">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-4xl mx-auto mb-10 mt-12 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input type="text" placeholder="Search available bikes..." className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-[#003B6A]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {filteredBikes.map((bike) => (
            <div key={bike._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-2xl transition group">
              <div className="relative h-56 overflow-hidden">
                <img src={getMediaUrl(bike.image)} alt={bike.bikeName} className="h-full w-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">{bike.bikeName}</h3>
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded font-bold">{bike.registrationYear}</span>
                </div>
                <div className="text-2xl font-black text-orange-600 my-2">₹ {Number(bike.expectedPrice).toLocaleString()}</div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4"><MapPin size={16}/> {bike.location}</div>
                
                <button onClick={() => handleContactSeller(bike)} className="w-full bg-[#003B6A] text-white py-3 rounded-xl hover:bg-black font-bold transition">
                    Contact Seller
                </button>
              </div>
            </div>
        ))}
      </div>

      {/* DETAILED BIKE MODAL */}
      {selectedBike && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative">
                <div className="md:w-1/2 bg-gray-900 relative h-64 md:h-[520px] flex items-center justify-center">
                    <img src={getMediaUrl(currentModalImage)} alt="Bike" className="w-full h-full object-contain" />

                    {hasMultipleModalImages && (
                      <>
                        <button
                          type="button"
                          onClick={goPrevModalImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                          aria-label="Previous bike image"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={goNextModalImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                          aria-label="Next bike image"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          {modalImageIndex + 1}/{selectedBikeImages.length}
                        </div>
                      </>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
                        <h2 className="text-3xl font-bold">{selectedBike.bikeName}</h2>
                        <p className="text-gray-300">{selectedBike.make} • {selectedBike.registrationYear}</p>
                    </div>
                </div>

                <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <p className="text-xs font-bold text-gray-400 uppercase">Asking Price</p>
                             <h3 className="text-3xl font-black text-[#003B6A]">₹{Number(selectedBike.expectedPrice).toLocaleString()}</h3>
                        </div>
                            <button onClick={() => { setSelectedBike(null); setModalImageIndex(0); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2"><Gauge size={16} className="text-gray-400"/> <span>{selectedBike.kmDriven} km</span></div>
                        <div className="flex items-center gap-2"><User size={16} className="text-gray-400"/> <span>{selectedBike.noOfOwners} Owner(s)</span></div>
                        <div className="flex items-center gap-2"><Fuel size={16} className="text-gray-400"/> <span>{selectedBike.fuelType}</span></div>
                        <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> <span>{selectedBike.location}</span></div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-6">
                        <p className="line-clamp-3">{selectedBike.description || "No description provided."}</p>
                    </div>

                    <div className="mt-auto">
                        {!showOfferForm ? (
                            <button onClick={handleKnowMoreClick} className="w-full bg-[#003B6A] text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition flex items-center justify-center gap-2">
                                <Zap size={20}/> I'm Interested / Make Offer
                            </button>
                        ) : (
                            <form onSubmit={handlePreSubmit} className="bg-blue-50 p-5 rounded-xl border border-blue-100 animate-in slide-in-from-bottom-5">
                                <h4 className="font-bold text-[#003B6A] mb-3 flex items-center gap-2"><CheckCircle size={16}/> Make Your Offer</h4>
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-lg border">
                                        <p className="text-xs text-gray-400">Your Contact</p>
                                        <p className="font-bold">{getUser()?.name} ({getUser()?.phone})</p>
                                    </div>
                                    <input 
                                        type="number" 
                                        required 
                                        placeholder="Enter your offer price (₹)" 
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        className="w-full border p-3 rounded-lg font-bold text-lg focus:ring-2 focus:ring-[#003B6A] outline-none"
                                    />
                                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={48} className="text-[#003B6A]" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Submit Offer?</h3>
                <p className="text-gray-500 mb-8">Are you sure you want to submit an offer of <span className="font-bold text-[#003B6A]">₹{Number(offerPrice).toLocaleString()}</span> for this bike?</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">No</button>
                    <button onClick={handleFinalSubmit} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition">Yes, Submit</button>
                </div>
            </div>
        </div>
      )}

      {/* ✅ SUCCESS MESSAGE MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowSuccess(false)}></div>
            <div className="bg-white rounded-[35px] p-10 max-w-sm w-full relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Submitted!</h3>
                <p className="text-gray-500 mb-8">Offer successfully sent! Our sales team will review your request and contact you shortly.</p>
                <button 
                    onClick={() => setShowSuccess(false)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg"
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
                <p className="text-gray-500 mb-8">Please login to your account to make an offer on this vehicle.</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowLoginAlert(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">Cancel</button>
                    <button onClick={() => navigate("/login", { state: { from: "/services/second-hand/buy" } })} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition">Login Now</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BuyBike;