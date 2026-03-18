import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { compressImages } from "../../../api/helpers";
import { 
  Bike, X, 
  PhoneCall, AlertTriangle, CheckCircle2,
  Plus, Upload, ChevronLeft, ChevronRight, Edit, User, Loader2
} from "lucide-react";

const ManageSecondHand = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [bikes, setBikes] = useState([]); 
  const [buyRequests, setBuyRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [selectedBike, setSelectedBike] = useState(null); 
  const [contactInfo, setContactInfo] = useState(null); 
  const [formModal, setFormModal] = useState({ show: false, isEdit: false, data: null });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, title: '', message: '', actionFn: null, isDelete: false });

  // notification toast state (shared pattern used in other admin pages)
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });
  const showStatus = (message, isError = false) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  // backend base url, ensure it ends with /api so uploads path concatenates correctly
  const base = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';

  // helper for cloudinary or legacy local URLs
  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${base}/uploads/${url}`;
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bikesRes, offersRes] = await Promise.all([
        axiosInstance.get("/bikes/admin/all"),
        axiosInstance.get("/bikes/admin/offers")
      ]);
      setBikes(bikesRes.data);
      setBuyRequests(offersRes.data);
    } catch (error) { console.error("Fetch Error:", error); } 
    finally { setLoading(false); }
  };

  // ✅ ১. স্ট্যাটাস আপডেট ট্রিগার (Status Update Trigger)
  const triggerStatusUpdate = (id, newStatus) => {
    setConfirmModal({
      show: true, title: "Update Status?", message: `Are you sure you want to change status to ${newStatus}?`,
      isDelete: false, actionFn: () => executeBikeStatusUpdate(id, newStatus)
    });
  };

  // ✅ ২. ডিলিট ট্রিগার (FIXed: This was missing in the previous version)
  const triggerDelete = (id) => {
    setConfirmModal({
      show: true,
      title: "Delete Listing?",
      message: "This action cannot be undone. The bike listing will be permanently removed.",
      isDelete: true, 
      actionFn: () => executeDelete(id)
    });
  };

  const executeBikeStatusUpdate = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/bikes/admin/status/${id}`, { status: newStatus });
      fetchData();
      showStatus("Status updated successfully!");
    } catch (error) { showStatus("Status update failed!", true); }
    setConfirmModal({ show: false });
  };

  const executeDelete = async (id) => {
    try {
      await axiosInstance.delete(`/bikes/admin/delete/${id}`);
      fetchData();
      showStatus("Bike deleted successfully!");
    } catch (error) {
      console.error("delete error", error);
      const msg = error.response?.data?.error || error.message || "Unknown";
      showStatus("Delete failed: " + msg, true);
    }
    setConfirmModal({ show: false });
  };

  const updateOfferStatus = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/bikes/admin/offer/status/${id}`, { status: newStatus });
      fetchData();
      showStatus("Request status updated!");
    } catch (error) { showStatus("Failed to update request status", true); }
  };

  const handleFormSubmit = async (formData, isEdit, bikeId) => {
    try {
        const config = { headers: { "Content-Type": "multipart/form-data" } };
        if (isEdit) await axiosInstance.put(`/bikes/admin/update/${bikeId}`, formData, config);
        else await axiosInstance.post("/bikes/admin/add", formData, config);
        setFormModal({ show: false, isEdit: false, data: null });
        fetchData();
        showStatus(isEdit ? "Bike updated!" : "New bike added!");
    } catch (error) { showStatus("Operation failed! Check backend connection.", true); }
  };

  const getStatusColor = (status) => {
    const colors = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        CONTACTED: 'bg-blue-100 text-blue-700',
        APPROVED: 'bg-green-100 text-green-700',
        SOLD: 'bg-gray-800 text-white',
        CANCELLED: 'bg-red-100 text-red-700'
    };
    return colors[status?.toUpperCase()] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B6A]"></div></div>;

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* notification toast (shared component style) */}
      {statusPopup.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300 w-[90%] sm:w-auto">
          <div className={`flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold text-sm">{statusPopup.message}</span>
          </div>
        </div>
      )}
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col gap-4 mb-6">
        <div><h2 className="text-xl sm:text-2xl font-bold text-gray-800">Bike Trade Center</h2><p className="text-sm text-gray-500">Inventory & Customer Requests</p></div>
        <div className="flex bg-white p-1 rounded-lg border shadow-sm overflow-x-auto">
            <TabBtn active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")} label={`Selling (${bikes.filter(b => b.status === "PENDING").length})`} />
            <TabBtn active={activeTab === "inspections"} onClick={() => setActiveTab("inspections")} label={`Inspect (${bikes.filter(b => b.status === "INSPECTION").length})`} />
            <div className={`flex items-center ml-1 rounded-md flex-shrink-0 ${activeTab === "showroom" ? "bg-[#003B6A]" : "bg-gray-100"}`}>
                <button onClick={() => setActiveTab("showroom")} className={`px-3 sm:px-4 py-2 font-bold text-sm whitespace-nowrap ${activeTab === "showroom" ? "text-white" : "text-gray-600"}`}>Showroom</button>
                <button onClick={() => setFormModal({ show: true, isEdit: false, data: null })} className="bg-orange-500 text-white px-3 py-2 hover:bg-orange-600 transition rounded-r-md flex-shrink-0"><Plus size={16}/></button>
            </div>
            <TabBtn active={activeTab === "buy_requests"} onClick={() => setActiveTab("buy_requests")} label={`Requests (${buyRequests.length})`} />
        </div>
      </div>

      {/* --- CONTENT TABS --- */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.filter(b => b.status === "PENDING").map(bike => (
                <BikeCard key={bike._id} bike={bike} getMediaUrl={getMediaUrl} onView={() => setSelectedBike(bike)} onAction={() => triggerStatusUpdate(bike._id, 'INSPECTION')} actionLabel="Move to Inspect" actionColor="bg-purple-600" onDelete={() => triggerDelete(bike._id)} onEdit={() => setFormModal({show: true, isEdit: true, data: bike})}/>
            ))}
        </div>
      )}

      {activeTab === "inspections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.filter(b => b.status === "INSPECTION").map(bike => (
                <BikeCard key={bike._id} bike={bike} getMediaUrl={getMediaUrl} onView={() => setSelectedBike(bike)} onAction={() => triggerStatusUpdate(bike._id, 'APPROVED')} actionLabel="Approve Now" actionColor="bg-green-600" onDelete={() => triggerDelete(bike._id)} onEdit={() => setFormModal({show: true, isEdit: true, data: bike})}/>
            ))}
        </div>
      )}

      {activeTab === "showroom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.filter(b => b.status === "APPROVED" || b.status === "SOLD").map(bike => (
                <BikeCard key={bike._id} bike={bike} getMediaUrl={getMediaUrl} onView={() => setSelectedBike(bike)} onAction={() => triggerStatusUpdate(bike._id, 'SOLD')} actionLabel="Mark Sold" actionColor="bg-blue-600" onDelete={() => triggerDelete(bike._id)} isDisabled={bike.status === 'SOLD'} onEdit={() => setFormModal({show: true, isEdit: true, data: bike})}/>
            ))}
        </div>
      )}

      {activeTab === "buy_requests" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                    <tr><th className="p-4">Bike</th><th className="p-4">Customer</th><th className="p-4">Offer</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
                </thead>
                <tbody className="divide-y">
                    {buyRequests.map(req => (
                        <tr key={req._id} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-bold">{req.bikeName}</td>
                            <td className="p-4 font-bold">{req.buyerName}</td>
                            <td className="p-4 text-green-600 font-bold">₹{Number(req.offerPrice).toLocaleString()}</td>
                            <td className="p-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(req.status)}`}>{req.status}</span></td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => setContactInfo(req)} className="bg-[#003B6A] text-white p-2 rounded-lg hover:bg-blue-800 transition"><PhoneCall size={14}/></button>
                                <select value={req.status} onChange={(e) => updateOfferStatus(req._id, e.target.value)} className="border rounded p-1 text-xs outline-none">
                                    <option value="PENDING">Pending</option><option value="CONTACTED">Contacted</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* --- ALL MODALS --- */}
      {formModal.show && <BikeFormModal isEdit={formModal.isEdit} existingData={formModal.data} onClose={() => setFormModal({show: false})} onSubmit={handleFormSubmit} getMediaUrl={getMediaUrl} showStatus={showStatus} />}
      {selectedBike && <BikeDetailsModal bike={selectedBike} getMediaUrl={getMediaUrl} onClose={() => setSelectedBike(null)} />}
      {contactInfo && <ContactModal info={contactInfo} onClose={() => setContactInfo(null)} />}
      {confirmModal.show && <ConfirmModal modal={confirmModal} onClose={() => setConfirmModal({show: false})} />}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const TabBtn = ({ active, onClick, label }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-md font-bold text-sm ml-1 transition whitespace-nowrap ${active ? "bg-[#003B6A] text-white" : "text-gray-600 hover:bg-gray-50"}`}>{label}</button>
);

const BikeCard = ({ bike, getMediaUrl, onView, onAction, actionLabel, actionColor, onDelete, isDisabled, onEdit }) => {
    const coverImage = bike.images && bike.images.length > 0 ? bike.images[0] : bike.image;
    return (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition group">
            <div className="relative h-48 bg-gray-100">
                {coverImage ? <img src={getMediaUrl(coverImage)} alt="bike" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-gray-300"><Bike size={48}/></div>}
                <button onClick={onEdit} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md text-gray-700 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"><Edit size={16} /></button>
                <span className={`absolute top-2 left-2 px-2 py-1 text-[10px] font-black uppercase rounded shadow-sm ${bike.status === 'SOLD' ? 'bg-black text-white' : 'bg-yellow-400 text-black'}`}>{bike.status}</span>
            </div>
            <div className="p-4 flex flex-col">
                <h3 className="font-bold text-lg mb-1">{bike.bikeName || bike.make}</h3>
                <div className="text-[#003B6A] font-black text-xl mb-4">₹ {Number(bike.expectedPrice).toLocaleString()}</div>
                <div className="flex gap-2">
                    <button onClick={onView} className="flex-1 bg-gray-100 py-2 rounded-lg text-xs font-bold hover:bg-gray-200">View</button>
                    <button disabled={isDisabled} onClick={onAction} className={`flex-1 ${actionColor} text-white py-2 rounded-lg text-xs font-bold shadow-sm hover:opacity-90`}>{actionLabel}</button>
                    <button onClick={() => onDelete(bike._id)} className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><X size={16}/></button>
                </div>
            </div>
        </div>
    );
};

const BikeFormModal = ({ isEdit, existingData, onClose, onSubmit, getMediaUrl, showStatus }) => {
    const [formData, setFormData] = useState({
        bikeName: "", brand: "", expectedPrice: "", registrationYear: "",
        kmDriven: "", noOfOwners: "", location: "", description: ""
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isEdit && existingData) {
            setFormData({
                bikeName: existingData.bikeName || existingData.make,
                brand: existingData.brand || existingData.make,
                expectedPrice: existingData.expectedPrice,
                registrationYear: existingData.registrationYear,
                kmDriven: existingData.kmDriven,
                noOfOwners: existingData.noOfOwners,
                location: existingData.location,
                description: existingData.description || ""
            });
            const oldImgs = existingData.images?.length > 0 ? existingData.images : [existingData.image];
            setPreviews(oldImgs.filter(i => i).map(i => getMediaUrl(i)));
        }
    }, [isEdit, existingData, getMediaUrl]);

    const handleImg = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) return showStatus("Max 4 images!", true);
        setImages(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const data = new FormData();
            Object.keys(formData).forEach(k => data.append(k, formData[k]));
            
            // Compress images before upload (same as AddParts.js)
            if (images.length > 0) {
                try {
                    const compressedFiles = await compressImages(images, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        quality: 0.8
                    });
                    compressedFiles.forEach(img => data.append("images", img));
                } catch (compressionError) {
                    console.error("Image compression failed:", compressionError);
                    // Fallback to original files if compression fails
                    images.forEach(img => data.append("images", img));
                }
            }
            
            await onSubmit(data, isEdit, existingData?._id);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-[#003B6A]">{isEdit ? "Update Bike" : "Add New Bike"}</h3><button onClick={onClose}><X size={24} className="text-gray-400 hover:text-red-500"/></button></div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="bikeName" value={formData.bikeName} placeholder="Model Name" required onChange={(e) => setFormData({...formData, bikeName: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"/>
                        <input name="brand" value={formData.brand} placeholder="Brand" required onChange={(e) => setFormData({...formData, brand: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"/>
                        <input name="expectedPrice" value={formData.expectedPrice} type="number" placeholder="Price" required onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"/>
                        <input name="kmDriven" value={formData.kmDriven} type="number" placeholder="KM Driven" required onChange={(e) => setFormData({...formData, kmDriven: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"/>
                        <input name="registrationYear" value={formData.registrationYear} type="number" placeholder="Year" required onChange={(e) => setFormData({...formData, registrationYear: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"/>
                        <input name="noOfOwners" value={formData.noOfOwners} type="number" placeholder="No. of Owners" required onChange={(e) => setFormData({...formData, noOfOwners: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"/>
                    </div>
                    <input name="location" value={formData.location} placeholder="Location" required onChange={(e) => setFormData({...formData, location: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"/>
                    <textarea name="description" value={formData.description} placeholder="Condition/Notes" rows="3" onChange={(e) => setFormData({...formData, description: e.target.value})} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#003B6A]"></textarea>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <input type="file" id="bikeImgs" multiple accept="image/*" onChange={handleImg} className="hidden" />
                        <label htmlFor="bikeImgs" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-[#003B6A]"><Upload size={32}/><span className="font-bold">Upload Photos (Max 4)</span></label>
                        {previews.length > 0 && <div className="flex gap-2 mt-4 justify-center">{previews.map((src, idx) => <img key={idx} src={src} alt="preview" className="w-16 h-16 object-cover rounded-lg border"/>)}</div>}
                    </div>
                    <button type="submit" disabled={submitting} className="w-full bg-[#003B6A] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                        {submitting ? <><Loader2 className="animate-spin" size={20}/> Compressing & Uploading...</> : "Save & Publish"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const BikeDetailsModal = ({ bike, getMediaUrl, onClose }) => {
    const imgs = bike.images?.length > 0 ? bike.images : [bike.image];
    const [idx, setIdx] = useState(0);
    return (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                <div className="md:w-1/2 bg-gray-100 relative flex items-center justify-center h-64 md:h-auto">
                    {imgs[idx] ? <img src={getMediaUrl(imgs[idx])} alt="bike" className="w-full h-full object-cover" /> : <div className="p-20"><Bike size={64} className="text-gray-300"/></div>}
                    {imgs.length > 1 && (
                        <>
                            <button onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)} className="absolute left-4 bg-white/50 p-2 rounded-full hover:bg-white transition"><ChevronLeft/></button>
                            <button onClick={() => setIdx((idx + 1) % imgs.length)} className="absolute right-4 bg-white/50 p-2 rounded-full hover:bg-white transition"><ChevronRight/></button>
                        </>
                    )}
                </div>
                <div className="md:w-1/2 p-8 bg-white overflow-y-auto">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">{bike.bikeName || bike.make}</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X/></button></div>
                    <div className="text-[#003B6A] font-black text-3xl mb-6">₹ {Number(bike.expectedPrice).toLocaleString()}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Year</p><p className="font-bold">{bike.registrationYear}</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Driven</p><p className="font-bold">{bike.kmDriven} km</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Owners</p><p className="font-bold">{bike.noOfOwners}</p></div>
                        <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Location</p><p className="font-bold">{bike.location}</p></div>
                    </div>
                    <p className="text-sm text-gray-600 italic border-l-4 border-gray-200 pl-4 py-2 bg-gray-50 rounded-r-lg">{bike.description || "No description available."}</p>
                </div>
            </div>
        </div>
    );
};

const ContactModal = ({ info, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#003B6A]"><User size={32}/></div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{info.buyerName}</h3>
            <p className="text-sm text-gray-500 mb-6">Interested in: {info.bikeName}</p>
            <div className="bg-gray-50 p-4 rounded-xl border mb-6"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Phone Number</p><p className="text-2xl font-black text-[#003B6A] tracking-wider">{info.buyerPhone}</p></div>
            <div className="flex gap-3"><a href={`tel:${info.buyerPhone}`} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"><PhoneCall size={18}/> Call</a><button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition">Close</button></div>
        </div>
    </div>
);

const ConfirmModal = ({ modal, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-[130] flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in">
        <div className="bg-white max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modal.isDelete ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#003B6A]'}`}><AlertTriangle size={32}/></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{modal.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{modal.message}</p>
            <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button><button onClick={modal.actionFn} className={`flex-1 py-3 text-white rounded-xl font-bold transition shadow-md ${modal.isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-[#003B6A] hover:bg-blue-800'}`}>Confirm</button></div>
        </div>
    </div>
);

export default ManageSecondHand;