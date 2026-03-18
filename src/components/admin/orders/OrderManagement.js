import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { 
  CheckCircle, XCircle, Clock, Calendar, Truck, 
  Phone, Eye, X, RefreshCcw, Zap, Droplets, Wrench, AlertTriangle 
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL'); 
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });
  
  // ✅ New state for Confirmation Popup
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, status: '' });

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/bookings');
      setOrders(res.data);
    } catch (error) { console.error("Fetch Error:", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getCategory = (order) => {
    const lowerType = order.serviceType?.toLowerCase() || "";
    const dbCat = order.serviceCategory;
    if (dbCat === 'EV') return 'EV';
    if (dbCat === 'MODIFICATION' || dbCat === 'Custom') return 'MODIFICATION';
    const modKeywords = ['wrap', 'paint', 'body', 'engine', 'exhaust', 'modify', 'custom', 'tuning', 'kit'];
    if (modKeywords.some(k => lowerType.includes(k))) return 'MODIFICATION';
    const evKeywords = ['battery', 'motor', 'charging', 'ev', 'electric'];
    if (evKeywords.some(k => lowerType.includes(k))) return 'EV';
    return 'Washing';
  };

  // ✅ Updated logic to handle the API call after confirmation
  const handleUpdateStatus = async () => {
    const { id, status } = confirmModal;
    try {
      await axiosInstance.put(`/bookings/update-status/${id}`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      setConfirmModal({ show: false, id: null, status: '' }); // Close modal
      showStatusPopup("Status Updated Successfully!", false);
    } catch (error) { 
      showStatusPopup("Failed to update status.", true); 
      setConfirmModal({ show: false, id: null, status: '' });
    }
  };

  const filteredOrders = orders.filter(order => {
    const cat = getCategory(order);
    const statusMatch = filterStatus === 'ALL' || order.status === filterStatus;
    let categoryMatch = true;
    if (filterCategory === 'EV') categoryMatch = cat === 'EV';
    else if (filterCategory === 'Washing') categoryMatch = cat === 'Washing';
    else if (filterCategory === 'MODIFICATION') categoryMatch = cat === 'MODIFICATION';
    return statusMatch && categoryMatch;
  });

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B6A]"></div></div>;

  return (
    <div className="space-y-6 p-1 sm:p-4">
      
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      {/* --- Header UI --- */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Manage Bookings</h2>
          <p className="text-gray-500 text-sm">Review customer service requests</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === status ? 'bg-[#003B6A] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {status}
              </button>
            ))}
            <button onClick={fetchOrders} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shrink-0"><RefreshCcw size={20} /></button>
          </div>

          <div className="flex gap-2 flex-wrap">
             {['ALL', 'Washing', 'EV', 'MODIFICATION'].map(c => (
               <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border transition-all 
                 ${filterCategory === c ? 
                    (c === 'EV' ? 'bg-green-600 text-white border-green-600' : 
                     c === 'MODIFICATION' ? 'bg-purple-600 text-white border-purple-600' : 
                     'bg-blue-600 text-white border-blue-600') 
                  : 'bg-white text-gray-400 border-gray-100'}`}>
                 {c === 'MODIFICATION' ? 'CUSTOM MODS' : (c === 'EV' ? 'EV LAB' : c)}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* --- Order Cards --- */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">No bookings found for this category.</div>
        )}
        {filteredOrders.map((order) => {
          const cat = getCategory(order);
          return (
            <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col lg:flex-row justify-between gap-6">
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{order.status}</span>
                  
                  <span className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded border uppercase 
                    ${cat === 'EV' ? 'bg-green-50 text-green-700 border-green-100' : 
                      cat === 'MODIFICATION' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                      'bg-blue-50 text-blue-700 border-blue-100'}`}>
                      
                      {cat === 'EV' ? <Zap size={10}/> : 
                       cat === 'MODIFICATION' ? <Wrench size={10}/> : 
                       <Droplets size={10}/>} 

                      {cat === 'MODIFICATION' ? 'Custom Mod' : 
                       (cat === 'EV' ? 'EV Lab' : 'Washing')}
                  </span>

                  <h3 className="text-lg font-bold text-gray-800">{order.serviceType}</h3>
                  <span className="bg-gray-800 text-white font-mono text-[10px] px-2 py-1 rounded shadow-sm tracking-wider">ID: #{order.bookingId || order._id.slice(-6).toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{order.user?.name?.charAt(0)}</div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase leading-tight">Customer</p><p className="font-bold text-gray-800">{order.user?.name}</p><p className="text-xs text-[#003B6A] font-bold"><Phone size={10} className="inline mr-1"/>{order.user?.phone}</p></div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Truck className="text-purple-500" size={20} />
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase leading-tight">Vehicle</p><p className="font-bold text-gray-800 uppercase">{order.vehicleNumber}</p><p className="text-xs">{order.vehicleModel}</p></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-6 text-xs font-bold text-gray-700">
                   <div className="flex items-center gap-2"><Calendar className="text-orange-500" size={14} /> {order.bookingDate}</div>
                   <div className="flex items-center gap-2"><Clock className="text-green-500" size={14} /> {order.timeSlot || "N/A"}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-center gap-3 w-full lg:w-auto lg:min-w-[200px] lg:border-l lg:pl-6 border-gray-100 pt-4 lg:pt-0">
                {order.status === 'PENDING' && (
                  <>
                    <button onClick={() => setConfirmModal({show: true, id: order._id, status: 'CONFIRMED'})} className="w-full py-2.5 bg-[#003B6A] text-white rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-800 transition-all shadow-md"><CheckCircle size={18} /> Approve</button>
                    <button onClick={() => setConfirmModal({show: true, id: order._id, status: 'CANCELLED'})} className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-red-50 transition-all"><XCircle size={18} /> Reject</button>
                  </>
                )}
                {order.status === 'CONFIRMED' && (
                  <button onClick={() => setConfirmModal({show: true, id: order._id, status: 'COMPLETED'})} className="w-full py-2.5 bg-green-600 text-white rounded-lg font-bold flex justify-center items-center gap-2 shadow-md hover:bg-green-700"><CheckCircle size={18}/> Mark Done</button>
                )}
                <button onClick={() => setSelectedOrder(order)} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold border border-gray-200 flex justify-center items-center gap-2 hover:bg-gray-200"><Eye size={18} /> View Details</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all">
                <div className="bg-[#003B6A] text-white p-6 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Booking Details</h3>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/10 rounded-full"><X size={24}/></button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div><h4 className="text-gray-400 font-bold uppercase text-[10px] mb-2 border-b">Customer Info</h4><p className="font-bold text-gray-800 text-xl">{selectedOrder.user?.name}</p><p className="text-lg font-bold text-[#003B6A]">{selectedOrder.user?.phone}</p></div>
                    <div><h4 className="text-gray-400 font-bold uppercase text-[10px] mb-2 border-b">Service Info</h4><p className="text-2xl font-black text-[#003B6A]">{selectedOrder.serviceType}</p><p className="font-bold text-gray-800 uppercase">{selectedOrder.vehicleNumber}</p></div>
                </div>
                <div className="bg-gray-50 p-4 text-center border-t"><button onClick={() => setSelectedOrder(null)} className="text-gray-500 font-bold text-xs uppercase tracking-widest">Close Window</button></div>
            </div>
        </div>
      )}

      {/* ✅ New Confirmation Modal (Yes/No) */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-6 text-sm">Do you really want to mark this booking as <span className="font-black text-gray-700 uppercase">{confirmModal.status}</span>? This action is irreversible.</p>
            
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({show: false, id: null, status: ''})} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">No, Cancel</button>
              <button onClick={handleUpdateStatus} className="flex-1 py-3 bg-[#003B6A] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all">Yes, Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;