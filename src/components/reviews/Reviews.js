import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { compressImage } from "../../api/helpers";
import { 
  Star, Send, Trash2, ShieldCheck, Loader2, Edit2, X, 
  ArrowLeft, CheckCircle, AlertCircle, HelpCircle 
} from "lucide-react";
import { getUser } from "../../api/auth";

// --- Custom Modal Component ---
const CustomModal = ({ isOpen, type, title, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="text-green-500 w-16 h-16" />,
    error: <AlertCircle className="text-red-500 w-16 h-16" />,
    confirm: <HelpCircle className="text-blue-500 w-16 h-16" />,
    warning: <AlertCircle className="text-red-600 w-16 h-16" />,
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 text-center">
        <div className="flex justify-center mb-6">{icons[type]}</div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>
        
        <div className="flex gap-4">
          {type === 'confirm' || type === 'warning' ? (
            <>
              <button onClick={onCancel} className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10">
                Cancel
              </button>
              <button 
                onClick={onConfirm} 
                className={`flex-1 text-white py-4 rounded-2xl font-bold transition-all shadow-lg ${type === 'warning' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}`}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </>
          ) : (
            <button onClick={onConfirm} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-400 transition-colors">
              Okay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Reviews = () => {
  const MAX_REVIEW_IMAGE_MB = 1.8;

  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // backend host for building review image URLs
  const base = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';

  const [editMode, setEditMode] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);

  // Modal States
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '', action: null });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const bgImage = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop";

  useEffect(() => {
    fetchReviews();
    const user = getUser();
    setCurrentUser(user);
    if (user && user.name) setName(user.name); 
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get("/reviews");
      setReviews(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const checkOwnership = (reviewUser) => {
    if (!currentUser || !reviewUser) return false;
    const currentUserId = currentUser.userId || currentUser._id || currentUser.id;
    const reviewUserId = typeof reviewUser === 'object' ? reviewUser._id : reviewUser;
    return currentUserId === reviewUserId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    if (!editMode) formData.append("customerName", name); 
    formData.append("rating", rating);
    formData.append("comment", comment);

    if (file) {
      try {
        const compressedImage = await compressImage(file, {
          maxSizeMB: MAX_REVIEW_IMAGE_MB,
          maxWidthOrHeight: 1600,
          quality: 0.75,
          minQuality: 0.4,
          maxAttempts: 10,
        });

        if (compressedImage.size > MAX_REVIEW_IMAGE_MB * 1024 * 1024) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Image Too Large',
            message: `Please choose a smaller image. Max allowed is ${MAX_REVIEW_IMAGE_MB}MB after compression.`,
          });
          setSubmitting(false);
          return;
        }

        formData.append("image", compressedImage);
      } catch (compressionError) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Compression Failed',
          message: 'Image compression failed. Please try another image.',
        });
        setSubmitting(false);
        return;
      }
    }

    try {
      if (editMode) {
        await axiosInstance.put(`/reviews/update/${editReviewId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setModal({ isOpen: true, type: 'success', title: 'Updated!', message: 'Your review has been successfully modified.' });
      } else {
        await axiosInstance.post("/reviews/add", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setModal({ isOpen: true, type: 'success', title: 'Submitted!', message: 'Thank you! Your feedback has been posted.' });
      }
      resetForm();
      fetchReviews();
    } catch (err) { 
        setModal({ isOpen: true, type: 'error', title: 'Failed', message: err.response?.data?.message || 'Something went wrong.' });
    } 
    finally { setSubmitting(false); }
  };

  const confirmDelete = (id) => {
    setPendingDeleteId(id);
    setModal({
        isOpen: true,
        type: 'warning',
        title: 'Delete Review?',
        message: 'This action is permanent and cannot be undone. Are you sure?'
    });
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/reviews/${pendingDeleteId}`);
      setReviews(reviews.filter(r => r._id !== pendingDeleteId));
      if (editReviewId === pendingDeleteId) resetForm();
      setModal({ isOpen: true, type: 'success', title: 'Deleted', message: 'The review has been removed.' });
    } catch (err) { 
        setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete review.' });
    } finally {
        setPendingDeleteId(null);
    }
  };

  const handleEdit = (rev) => {
    setEditMode(true);
    setEditReviewId(rev._id);
    setRating(rev.rating);
    setComment(rev.comment);
    setName(rev.customerName); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditMode(false);
    setEditReviewId(null);
    setComment("");
    setFile(null);
    setRating(5);
    if (currentUser) setName(currentUser.name);
  };

  const renderStars = (count) => [...Array(5)].map((_, i) => (
    <Star key={i} size={16} className={i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-500"} />
  ));

  return (
    <div className="relative min-h-screen w-full">
      {/* --- Modals --- */}
      <CustomModal 
        {...modal} 
        onConfirm={modal.type === 'warning' ? handleDelete : () => setModal({ ...modal, isOpen: false })}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />

      {/* --- Fixed Background Layer --- */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url(${bgImage})` 
        }}
      />

      <div className="relative z-10 pt-24 pb-20 px-4">
        
        {/* Back Button */}
        <div className="max-w-7xl mx-auto mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs transition-all bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Customer <span className="text-blue-500">Feedback</span>
          </h2>
          <p className="text-gray-400 text-2xl max-w-2xl mx-auto">
            Your trust is our engine. Read what our riders have to say.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- Form Section --- */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl sticky top-28">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                      {editMode ? <Edit2 size={20} className="text-orange-500"/> : <Send size={20} className="text-blue-500" />} 
                      {editMode ? "Edit Review" : "Write Review"}
                  </h3>
                  {editMode && (
                      <button onClick={resetForm} className="text-[10px] font-black uppercase tracking-tighter text-red-500 hover:text-red-400 flex items-center gap-1">
                        <X size={14}/> Cancel
                      </button>
                  )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Name" 
                  required 
                  disabled={editMode || !!currentUser} 
                  className={`w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 ${(editMode || !!currentUser) ? "cursor-not-allowed opacity-50" : ""}`} 
                />
                
                <div className="flex justify-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="transform hover:scale-125 transition-transform">
                      <Star size={28} className={rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} />
                    </button>
                  ))}
                </div>

                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="Share your experience..." 
                  required 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none placeholder:text-gray-600" 
                />

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 border-dashed">
                  <input 
                    type="file" 
                    id="reviewImageUpload"
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="reviewImageUpload" 
                    className="flex items-center justify-center gap-3 cursor-pointer py-2"
                  >
                    <div className="bg-blue-600 text-white py-2 px-4 rounded-full text-xs font-black">
                      {file ? "Change Photo" : "Add Photo"}
                    </div>
                    <span className="text-xs text-gray-400">
                      {file ? file.name : "(Optional)"}
                    </span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting} 
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${editMode ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {submitting ? "Processing..." : (editMode ? "Update Review" : "Submit Review")}
                </button>
              </form>
            </div>
          </div>

          {/* --- Review List --- */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Loading Feedback...</p>
              </div>
            ) : reviews.map((rev) => (
              <div key={rev._id} className={`bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border transition-all relative group ${editReviewId === rev._id ? "border-orange-500/50 ring-2 ring-orange-500/20" : "border-white/10 hover:border-white/20"}`}>
                
                {checkOwnership(rev.user) && (
                  <div className="absolute top-6 right-6 flex gap-3">
                      <button onClick={() => handleEdit(rev)} className="text-gray-500 hover:text-orange-400 transition-colors bg-white/5 p-2 rounded-xl border border-white/10" title="Edit"><Edit2 size={18} /></button>
                      <button onClick={() => confirmDelete(rev._id)} className="text-gray-500 hover:text-red-400 transition-colors bg-white/5 p-2 rounded-xl border border-white/10" title="Delete"><Trash2 size={18} /></button>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl flex items-center justify-center text-white shrink-0 font-black uppercase text-2xl shadow-lg border border-white/20">
                      {rev.customerName ? rev.customerName.charAt(0) : "U"}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col mb-4">
                      <h4 className="font-black text-xl text-white tracking-tight">{rev.customerName}</h4>
                      <div className="flex mt-1">{renderStars(rev.rating)}</div>
                    </div>
                    
                    <p className="text-gray-300 text-lg leading-relaxed mb-6 italic font-medium">"{rev.comment}"</p>
                    
                    {rev.image && (() => {
                      const src = rev.image.startsWith('http') ? rev.image : `${base}${rev.image}`;
                      return (
                        <img src={src} alt="Review" className="w-48 h-48 object-cover rounded-2xl border-4 border-white/10 cursor-pointer hover:border-blue-500 transition-all shadow-xl" onClick={() => window.open(src)} />
                      );
                    })()}

                    {rev.adminReply && (
                      <div className="mt-8 p-6 bg-blue-600/10 border-l-4 border-blue-500 rounded-r-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <ShieldCheck size={18} className="text-blue-500" />
                           <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Official Response</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium">{rev.adminReply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;