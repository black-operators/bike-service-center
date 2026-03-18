import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { 
  Plus, Trash2, Edit, X, RefreshCw, CheckCircle, 
  Wrench, AlertTriangle, Eye, IndianRupee 
} from "lucide-react";

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const categories = ["all", "washing", "modification", "ev-service"];
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  // ✅ Modals States
  const [editingService, setEditingService] = useState(null); // Dedicated Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // View Details Modal
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, type: null, id: null, title: "", message: "" 
  });

  const [newServiceData, setNewServiceData] = useState({
    name: "", category: "washing", type: "none", price: "", description: "", isPopular: false
  });

  useEffect(() => { fetchServices(); }, []);

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("/services");
      setServices(res.data);
    } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
  };

  const handleConfirmAction = async () => {
    const { type, id } = confirmModal;
    try {
      if (type === 'RESET') {
        await axiosInstance.post("/services/seed");
        fetchServices();
        showStatusPopup("Services reset to default!", false);
      } else if (type === 'DELETE') {
        await axiosInstance.delete(`/services/delete/${id}`);
        setServices(services.filter(s => s._id !== id));
        showStatusPopup("Service deleted successfully!", false);
      }
    } catch (error) { 
      showStatusPopup("Action failed", true); 
    } finally {
      setConfirmModal({ show: false, type: null, id: null, title: "", message: "" });
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/services/add", newServiceData);
      setServices([...services, res.data.service]);
      setShowAddModal(false);
      setNewServiceData({ name: "", category: "washing", type: "none", price: "", description: "", isPopular: false });
      showStatusPopup("Service added successfully!", false);
    } catch (error) { 
      showStatusPopup("Add Failed", true); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/services/update/${editingService._id}`, editingService);
      setServices(services.map(s => s._id === editingService._id ? editingService : s));
      setEditingService(null);
      showStatusPopup("Service updated successfully!", false);
    } catch (error) { 
      showStatusPopup("Update Failed", true); 
    }
  };

  const filteredServices = activeTab === "all" ? services : services.filter(s => s.category?.toLowerCase() === activeTab.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B6A]"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div><h3 className="text-xl sm:text-2xl font-bold">Manage Services</h3></div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setConfirmModal({
                show: true, type: 'RESET', title: 'Reset Database?', 
                message: 'This will reset all services to defaults. This cannot be undone.'
              })} 
              className="bg-white border px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={16} /> Reset
            </button>
            <button onClick={() => setShowAddModal(true)} className="bg-[#003B6A] text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-all flex-1 sm:flex-none justify-center"><Plus size={18} /> Add New</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat)} className={`px-5 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap ${activeTab === cat ? "bg-[#003B6A] text-white shadow-md" : "bg-white text-gray-600 border"}`}>
            {cat === "ev-service" ? "Ev Lab" : cat}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredServices.map((s) => (
          <div key={s._id} className="bg-white p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-gray-100 text-gray-600 w-max">{s.category}</span>
                      {s.category === 'modification' && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-100 text-purple-700 flex items-center gap-1 w-max"><Wrench size={10}/> {s.type}</span>}
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => setSelectedService(s)} className="text-gray-400 hover:text-[#003B6A] p-1"><Eye size={16} /></button>
                        <button onClick={() => setEditingService(s)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                        <button onClick={() => setConfirmModal({ show: true, type: 'DELETE', id: s._id, title: 'Delete Service?', message: `Delete "${s.name}"?` })} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                </div>
                <h4 className="font-bold text-lg text-gray-800 leading-tight mb-1">{s.name}</h4>
                <p className="text-2xl font-black text-[#003B6A] flex items-center gap-1"><IndianRupee size={20}/>{s.price}</p>
                {/* ✅ Reduced Line Height & 2 Line Clamp */}
                <p className="text-gray-500 text-[11px] mt-1 leading-tight line-clamp-2">{s.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ MODAL: Detailed View */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform animate-in zoom-in duration-200">
            <div className="bg-[#003B6A] p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">{selectedService.category}</span>
                <h3 className="text-xl font-bold mt-2">{selectedService.name}</h3>
              </div>
              <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Service Price</p>
                <div className="flex items-center gap-1 text-[#003B6A] font-black text-4xl"><IndianRupee size={32} />{selectedService.price}</div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 border-b pb-1">Full Description</p>
                <p className="text-gray-700 leading-relaxed text-sm">{selectedService.description || "No description available."}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <button onClick={() => setSelectedService(null)} className="w-full py-3 bg-[#003B6A] text-white rounded-xl font-bold hover:bg-blue-900 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL: Edit Service */}
      {editingService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">Edit Service</h3><button onClick={()=>setEditingService(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button></div>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Service Name</label>
                        <input type="text" value={editingService.name} className="w-full border p-2 rounded mt-1" required onChange={(e)=>setEditingService({...editingService, name: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                            <select className="w-full border p-2 rounded mt-1" value={editingService.category} onChange={(e)=>setEditingService({...editingService, category: e.target.value})}>
                                {categories.filter(c=>c!=='all').map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Price (₹)</label>
                            <input type="number" value={editingService.price} className="w-full border p-2 rounded mt-1 font-bold text-[#003B6A]" required onChange={(e)=>setEditingService({...editingService, price: e.target.value})}/>
                        </div>
                    </div>
                    {editingService.category === "modification" && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Mod Type</label>
                        <select className="w-full border p-2 rounded bg-purple-50 font-bold text-purple-700 mt-1" value={editingService.type} onChange={(e)=>setEditingService({...editingService, type: e.target.value})}>
                            <option value="body">Body</option><option value="engine">Engine</option><option value="exhaust">Exhaust</option>
                        </select>
                      </div>
                    )}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Full Description</label>
                        <textarea value={editingService.description} className="w-full border p-2 rounded h-32 mt-1 leading-snug text-sm" required onChange={(e)=>setEditingService({...editingService, description: e.target.value})}/>
                    </div>
                    <button type="submit" className="w-full bg-[#003B6A] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all flex justify-center items-center gap-2"><CheckCircle size={18}/> Update Service</button>
                </form>
            </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">Add Package</h3><button onClick={()=>setShowAddModal(false)}><X size={20}/></button></div>
                <form onSubmit={handleAddService} className="space-y-4">
                    <input type="text" placeholder="Package Name" className="w-full border p-2 rounded" required onChange={(e)=>setNewServiceData({...newServiceData, name: e.target.value})}/>
                    <select className="w-full border p-2 rounded" onChange={(e)=>setNewServiceData({...newServiceData, category: e.target.value})}>
                      {categories.filter(c=>c!=='all').map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    {newServiceData.category === "modification" && (
                      <select className="w-full border p-2 rounded bg-purple-50 font-bold text-purple-700" required onChange={(e)=>setNewServiceData({...newServiceData, type: e.target.value})}>
                        <option value="">Select Modification Type</option><option value="body">Body</option><option value="engine">Engine</option><option value="exhaust">Exhaust</option>
                      </select>
                    )}
                    <input type="number" placeholder="Price" className="w-full border p-2 rounded" required onChange={(e)=>setNewServiceData({...newServiceData, price: e.target.value})}/>
                    <textarea placeholder="Description" className="w-full border p-2 rounded h-20" required onChange={(e)=>setNewServiceData({...newServiceData, description: e.target.value})}/>
                    <button type="submit" className="w-full bg-[#003B6A] text-white py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all">Add Service</button>
                </form>
            </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmModal.type === 'DELETE' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'}`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{confirmModal.title}</h3>
            <p className="text-gray-500 mb-6 text-sm">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, type: null, id: null, title: "", message: "" })} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
              <button onClick={handleConfirmAction} className={`flex-1 py-3 text-white rounded-xl font-bold transition-all ${confirmModal.type === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#003B6A] hover:bg-blue-900'}`}>Yes, Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;