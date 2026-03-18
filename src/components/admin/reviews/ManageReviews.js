import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { Trash2, MessageSquare, Save, X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ✅ New States for Modals
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get("/reviews");
      if (Array.isArray(res.data)) {
        setReviews(res.data);
      } else {
        setReviews([]); 
        console.error("API did not return an array:", res.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to show custom status toast
  const showStatus = (message, isError = false) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/reviews/${confirmDelete.id}`);
      setReviews(reviews.filter(r => r._id !== confirmDelete.id));
      setConfirmDelete({ show: false, id: null });
      showStatus("Review deleted successfully!");
    } catch (err) { 
      showStatus("Delete Failed!", true); 
    }
  };

  const handleReplySubmit = async (id) => {
    try {
      await axiosInstance.put(`/reviews/reply/${id}`, { reply: replyText });
      showStatus("Reply Sent!");
      setReplyingTo(null);
      setReplyText("");
      fetchReviews();
    } catch (err) { 
      showStatus("Reply Failed!", true); 
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading Reviews...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px] relative">
      
      {/* ✅ Status Notification (Toast) */}
      {statusPopup.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300 w-[90%] sm:w-auto">
          <div className={`flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold text-sm">{statusPopup.message}</span>
          </div>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="text-[#003B6A]" /> Manage Reviews ({reviews.length})
      </h2>
      
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No reviews found yet.</p>
      ) : (
        <div className="grid gap-6">
          {reviews.map((rev) => (
            <div key={rev._id} className="border p-4 rounded-xl flex flex-col md:flex-row gap-4 bg-gray-50 hover:bg-white hover:shadow-md transition">
              
              {/* Review Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{rev.customerName}</h4>
                    <div className="flex text-yellow-500 text-sm">{"★".repeat(rev.rating)}</div>
                  </div>
                  {/* ✅ Trigger Delete Modal */}
                  <button onClick={() => setConfirmDelete({ show: true, id: rev._id })} className="text-red-500 hover:bg-red-100 p-2 rounded transition">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <p className="mt-2 text-gray-700 italic">"{rev.comment}"</p>
                
                {rev.adminReply && (
                  <div className="mt-3 text-sm text-[#003B6A] bg-blue-50 p-3 rounded-lg border-l-4 border-[#003B6A]">
                    <strong>Response:</strong> {rev.adminReply}
                  </div>
                )}

                {replyingTo === rev._id ? (
                  <div className="mt-3 flex gap-2 animate-fadeIn">
                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Write a reply..." />
                    <button onClick={() => handleReplySubmit(rev._id)} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><Save size={18} /></button>
                    <button onClick={() => setReplyingTo(null)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500"><X size={18} /></button>
                  </div>
                ) : (
                  <button onClick={() => { setReplyingTo(rev._id); setReplyText(rev.adminReply || ""); }} className="mt-3 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <MessageSquare size={14} /> {rev.adminReply ? "Edit Response" : "Reply to Customer"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MODAL: Yes/No Confirmation (Delete) */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Review?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to permanently delete this customer review? This action cannot be undone.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete({ show: false, id: null })} 
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReviews;