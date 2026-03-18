import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { getUser } from "../../../api/auth";
import { 
  Bike, ShoppingBag, Wrench, Trash2, IndianRupee, 
  Phone, Calendar, MapPin,
  HelpCircle, CheckCircle2, AlertCircle, Loader2,
  User // added for incoming bids section
} from "lucide-react";

const UserBikeTrade = () => {
  const [activeTab, setActiveTab] = useState("selling");
  const [data, setData] = useState({ 
    myBikes: [], 
    myOffers: [], 
    myInspections: [], 
    receivedOffers: [] 
  });
  const [loading, setLoading] = useState(true);
  
  // ✅ Modal States
  const [confirmModal, setConfirmModal] = useState({ open: false, type: "", id: "" });
  const [successModal, setSuccessModal] = useState({ open: false, msg: "" });
  const [errorModal, setErrorModal] = useState({ open: false, msg: "" });
  const [cancelling, setCancelling] = useState(false);

  const user = getUser();
  const [syncPhone, setSyncPhone] = useState(user?.phone || "");
  const [needsSync, setNeedsSync] = useState(false);

  // backend base with `/api` to use for uploads
  const base = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';
  // helper for cloudinary/local urls
  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${base}/uploads/${url}`;
  };

  useEffect(() => {
    if (user?.phone) {
      fetchData(user.phone);
    } else {
      setNeedsSync(true); 
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (phoneToFetch) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/bikes/user/activity?phone=${phoneToFetch}`);
      setData(res.data);
      setNeedsSync(false);
    } catch (error) { 
      console.error("Error fetching data:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleManualSync = (e) => {
    e.preventDefault();
    if(syncPhone.length > 8) fetchData(syncPhone);
  };

  // ✅ Triggered by Cancel Button
  const triggerCancel = (type, id) => {
    setConfirmModal({ open: true, type, id });
  };

  // ✅ Final Execution after "Yes"
  const handleFinalCancel = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ open: false, type: "", id: "" });
    setCancelling(true);
    try {
      await axiosInstance.delete(`/bikes/user/cancel/${type}/${id}`);
      fetchData(syncPhone || user.phone); 
      setSuccessModal({ open: true, msg: "Request Cancelled Successfully" });
    } catch (error) { 
      console.error("cancel error", error);
      const msg = error.response?.data?.error || error.message || "Failed to cancel request. Please try again.";
      setErrorModal({ open: true, msg });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      SOLD: "bg-gray-800 text-white",
      INSPECTION: "bg-purple-100 text-purple-800",
      CONTACTED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-green-100 text-green-800",
      NEW: "bg-blue-100 text-blue-800"
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const sellingBikes = data.myBikes.filter(b => b.status !== "INSPECTION"); 
  const workshopInspections = data.myBikes.filter(b => b.status === "INSPECTION"); 

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003B6A]"></div>
    </div>
  );

  if (needsSync) return (
    <div className="py-20 max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-sm border">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#003B6A]">
        <Phone size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Sync Your Account</h2>
      <p className="text-gray-500 mb-6 text-sm">Please enter your registered phone number to load your history.</p>
      <form onSubmit={handleManualSync} className="flex flex-col gap-3">
        <input 
          type="tel" 
          placeholder="Enter Phone Number" 
          value={syncPhone} 
          onChange={(e) => setSyncPhone(e.target.value)} 
          className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#003B6A]" 
          required 
        />
        <button type="submit" className="bg-[#003B6A] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition">Sync Data</button>
      </form>
    </div>
  );

  return (
    <div className="w-full relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Bike Trade History</h2>
        <p className="text-gray-500 text-sm">Track your selling approvals, inspections, and offers.</p>
      </div>

      <div className="flex gap-2 border-b mb-6 overflow-x-auto pb-2">
        <TabButton 
          active={activeTab === "selling"} 
          onClick={() => setActiveTab("selling")} 
          icon={<Bike size={18}/>} 
          label={`Selling (${sellingBikes.length})`} 
        />
        <TabButton 
          active={activeTab === "inspections"} 
          onClick={() => setActiveTab("inspections")} 
          icon={<Wrench size={18}/>} 
          label={`Inspections (${workshopInspections.length + data.myInspections.length})`} 
        />
        <TabButton 
          active={activeTab === "buying"} 
          onClick={() => setActiveTab("buying")} 
          icon={<ShoppingBag size={18}/>} 
          label={`Offers & Bids (${data.myOffers.length + data.receivedOffers.length})`} 
        />
      </div>

      {activeTab === "selling" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sellingBikes.length === 0 && <EmptyState msg="You haven't listed any bikes for sale."/>}
          {sellingBikes.map(bike => {
            const coverImage = bike.images && bike.images.length > 0 ? bike.images[0] : bike.image;
            return (
              <div key={bike._id} className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm relative hover:shadow-md transition">
                <img src={getMediaUrl(coverImage)} alt="Bike" className="w-full sm:w-32 h-32 object-cover rounded-lg bg-gray-100"/>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-gray-800">{bike.bikeName || bike.make}</h3>
                    {getStatusBadge(bike.status)}
                  </div>
                  <p className="text-[#003B6A] font-black flex items-center text-xl mb-1">
                    <IndianRupee size={18}/>{Number(bike.expectedPrice).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Listed on: {new Date(bike.createdAt).toLocaleDateString()}</p>
                </div>
                {bike.status === 'PENDING' && (
                  <button onClick={() => triggerCancel('bike', bike._id)} className="absolute bottom-4 right-4 text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                    <Trash2 size={14}/> Cancel
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeTab === "inspections" && (
        <div className="space-y-6">
          {(workshopInspections.length === 0 && data.myInspections.length === 0) && <EmptyState msg="No inspection activities found."/>}
          
          {workshopInspections.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Your Bikes Under Verification</h3>
              {workshopInspections.map(bike => {
                const coverImage = bike.images && bike.images.length > 0 ? bike.images[0] : bike.image;
                return (
                  <div key={bike._id} className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-4 shadow-sm items-center mb-4">
                    <img src={getMediaUrl(coverImage)} alt="Bike" className="w-20 h-20 object-cover rounded-lg"/>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{bike.bikeName || bike.make}</h3>
                      <p className="text-xs text-purple-700 mt-1 italic">
                        Admin has moved this bike to the workshop for physical verification.
                      </p>
                    </div>
                    <div>{getStatusBadge(bike.status)}</div>
                  </div>
                )
              })}
            </div>
          )}

          {data.myInspections.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Service Inspection Requests</h3>
              <div className="grid grid-cols-1 gap-4">
                {data.myInspections.map(ins => (
                  <div key={ins._id} className="bg-white border rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                        <Wrench size={24}/>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{ins.bikeName}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                          <MapPin size={14}/> <span>{ins.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#003B6A] text-xs font-bold mt-1">
                          <Calendar size={14}/> <span>Preferred Date: {ins.preferredDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(ins.status)}
                      {ins.status === 'PENDING' && (
                        <button onClick={() => triggerCancel('inspection', ins._id)} className="text-red-500 text-xs font-bold border border-red-200 px-3 py-1.5 rounded hover:bg-red-50">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "buying" && (
        <div className="space-y-8">
          {data.receivedOffers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Offers Received on Your Bikes</h3>
              <div className="space-y-4">
                {data.receivedOffers.map(offer => (
                  <div key={offer._id} className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-full text-[#003B6A] shadow-sm"><User size={24}/></div>
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase">Incoming Bid</p>
                        <h3 className="font-bold text-lg text-gray-800">{offer.bikeName}</h3>
                        <p className="text-sm font-medium text-gray-600">From: {offer.buyerName}</p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-2xl font-black text-[#003B6A] flex items-center justify-center sm:justify-end">
                        <IndianRupee size={20}/>{Number(offer.offerPrice).toLocaleString()}
                      </p>
                      <a href={`tel:${offer.buyerPhone}`} className="mt-2 inline-flex items-center gap-2 bg-[#003B6A] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-800 transition">
                        <Phone size={14}/> Contact Buyer ({offer.buyerPhone})
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Your Sent Offers</h3>
            <div className="space-y-4">
              {data.myOffers.length === 0 && <EmptyState msg="No sent offers found."/>}
              {data.myOffers.map(offer => (
                <div key={offer._id} className="bg-white p-5 rounded-xl border flex flex-col sm:flex-row justify-between items-center shadow-sm gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Bike Model</p>
                    <h3 className="font-bold text-lg text-[#003B6A]">{offer.bikeName}</h3>
                    <p className="text-xs text-gray-400 mt-1">Sent on: {new Date(offer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Your Price</p>
                    <p className="text-2xl font-black text-green-600 flex items-center justify-center sm:justify-end">
                      <IndianRupee size={20}/>{Number(offer.offerPrice).toLocaleString()}
                    </p>
                    <div className="mt-2 flex justify-center sm:justify-end gap-2 items-center">
                      {getStatusBadge(offer.status)}
                      {offer.status === 'PENDING' && (
                        <button onClick={() => triggerCancel('offer', offer._id)} className="text-red-500 p-1.5 bg-red-50 hover:bg-red-100 rounded ml-2 transition">
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal({ open: false, type: "", id: "" })}></div>
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={48} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Cancel Request?</h3>
            <p className="text-gray-500 mb-8">Are you sure you want to delete this {confirmModal.type} request? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal({ open: false, type: "", id: "" })} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">No</button>
              <button onClick={handleFinalCancel} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SUCCESS MODAL */}
      {successModal.open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
          <div className="bg-white rounded-[35px] p-10 max-w-md w-full relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={50} className="text-green-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500 mb-8">{successModal.msg}</p>
            <button onClick={() => setSuccessModal({ open: false, msg: "" })} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl">Got it</button>
          </div>
        </div>
      )}

      {/* ✅ ERROR MODAL */}
      {errorModal.open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setErrorModal({ open: false, msg: "" })}></div>
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
            <p className="text-gray-500 mb-6">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({ open: false, msg: "" })} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">Try Again</button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {cancelling && (
        <div className="fixed inset-0 z-[3000] bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-[#003B6A]" size={48} />
            <p className="font-bold text-[#003B6A]">Cancelling...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition whitespace-nowrap text-sm ${
      active 
        ? 'border-[#003B6A] text-[#003B6A] font-bold bg-blue-50/50 rounded-t-lg' 
        : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg'
    }`}
  >
    {icon} {label}
  </button>
);

const EmptyState = ({ msg }) => (
  <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
      <Bike size={32} />
    </div>
    <p className="text-gray-500 font-medium">{msg}</p>
  </div>
);

export default UserBikeTrade;