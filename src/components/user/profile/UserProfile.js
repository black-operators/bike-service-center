import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { 
  User, Mail, Phone, MapPin, Edit2, Save, X, 
  Camera, Shield, CheckCircle, AlertCircle, HelpCircle 
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import { getUser, setUser as storeUser } from "../../../api/auth";
import { compressImage } from "../../../api/helpers";

// --- Custom Modal Component ---
const CustomModal = ({ isOpen, type, title, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="text-green-500 w-12 h-12" />,
    error: <AlertCircle className="text-red-500 w-12 h-12" />,
    confirm: <HelpCircle className="text-blue-500 w-12 h-12" />,
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200 text-center">
        <div className="flex justify-center mb-4">{icons[type]}</div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>
        
        <div className="flex gap-3">
          {type === 'confirm' ? (
            <>
              <button 
                onClick={onCancel} 
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                No, Back
              </button>
              <button 
                onClick={onConfirm} 
                disabled={loading}
                className="flex-1 bg-[#003B6A] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-200"
              >
                {loading ? "Saving..." : "Yes, Save"}
              </button>
            </>
          ) : (
            <button 
              onClick={onConfirm} 
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
            >
              Okay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const storedUser = getUser() || {
    name: "User Name", email: "user@example.com", phone: "",
    role: "user", address: "", image: ""
  };

  const [user, setUser] = useState(storedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(storedUser);
  const [previewUrl, setPreviewUrl] = useState(storedUser.image || null);
  const [file, setFile] = useState(null);
  
  // booking statistics
  const [bookingStats, setBookingStats] = useState({
    totalServices: 0,
    nextMainText: 'Not Scheduled',
    nextSubText: '',
    lastCompletedText: ''
  });

  // Modal States
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/user/me');
        setUser(res.data);
        setFormData(res.data);
        setPreviewUrl(res.data.image || null);
        storeUser(res.data);
      } catch (err) {
        console.error('Unable to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // compute booking statistics when user available
  useEffect(() => {
    if (!user) return;

    const computeStats = (bookings) => {
      const totalServices = bookings.length;
      let nextMainText = 'Not Scheduled';
      let nextSubText = '';

      // upcoming bookings: pending/confirmed/in_progress with date >= today
      const today = new Date();
      today.setHours(0,0,0,0);
      const upcoming = bookings
        .filter(b => ['PENDING','CONFIRMED','IN_PROGRESS'].includes(b.status))
        .filter(b => {
          const d = new Date(b.bookingDate);
          d.setHours(0,0,0,0);
          return d.getTime() >= today.getTime();
        })
        .sort((a,b) => new Date(a.bookingDate) - new Date(b.bookingDate));

      if (upcoming.length) {
        const nxt = upcoming[0];
        const dateObj = new Date(nxt.bookingDate);
        const formattedDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        nextMainText = `${formattedDate} (${nxt.timeSlot})`;
      }

      // compute last completed if any
      let lastCompletedText = '';
      const completed = bookings
        .filter(b => b.status === 'COMPLETED' && b.bookingDate)
        .sort((a,b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      if (completed.length) {
        const last = completed[0];
        const d0 = new Date(last.bookingDate);
        lastCompletedText = d0.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }

      setBookingStats({ totalServices, nextMainText, nextSubText, lastCompletedText });
    };

    const fetchBookings = async () => {
      try {
        const res = await axiosInstance.get('/bookings/my-bookings');
        computeStats(res.data);
      } catch (err) {
        console.error('Unable to fetch user bookings for stats:', err);
      }
    };

    fetchBookings();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Show confirmation first
  const triggerSaveConfirm = () => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Update Profile?',
      message: 'Are you sure you want to save these changes to your profile?'
    });
  };

  // 2. Perform actual API call
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone || '');
      payload.append('address', formData.address || '');
      
      // Compress image before upload to stay under Vercel's 4.5MB limit
      if (file) {
        let imageToUpload = file;
        try {
          imageToUpload = await compressImage(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            quality: 0.8
          });
        } catch (compressionError) {
          console.error('Image compression failed, using original:', compressionError);
        }
        payload.append('image', imageToUpload);
      }

      const res = await axiosInstance.put('/user/me', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUser(res.data);
      setFormData(res.data);
      setPreviewUrl(res.data.image || null);
      storeUser(res.data);
      setFile(null);
      setIsEditing(false);
      
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: 'Your profile has been updated successfully.'
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Something went wrong while saving.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setPreviewUrl(user.image || null);
    setFile(null);
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(f);
  };

  const displayProfileSrc = previewUrl || formData.image || null;

  return (
    <div className="relative">
      {/* Modals */}
      <CustomModal 
        {...modal} 
        loading={loading}
        onConfirm={modal.type === 'confirm' ? handleSave : () => setModal({ ...modal, isOpen: false })}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        Welcome back, {user.name}! <span className="text-2xl">👋</span>
      </h1>
      
      {/* Stats Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm transition hover:shadow-md">
          <h3 className="text-blue-600 text-xs font-bold uppercase tracking-widest">Membership Status</h3>
          <p className="text-2xl font-black text-gray-800 mt-2">Active Member</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm transition hover:shadow-md">
          <h3 className="text-green-600 text-xs font-bold uppercase tracking-widest">Wallet Balance</h3>
          <p className="text-2xl font-black text-gray-800 mt-2">0 Points</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm transition hover:shadow-md">
          <h3 className="text-purple-600 text-xs font-bold uppercase tracking-widest">Next Service</h3>
          <p className="text-lg font-bold text-gray-800 mt-2">Not Scheduled</p>
        </div>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm transition hover:shadow-md">
          <h3 className="text-blue-600 text-xs font-bold uppercase tracking-widest">Membership Status</h3>
          <p className="text-2xl font-black text-gray-800 mt-2">Active Member</p>
        </div>
        
        {/* ✅ Wallet Balance এর জায়গায় Total Services */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm transition hover:shadow-md">
          <h3 className="text-green-600 text-xs font-bold uppercase tracking-widest">Total Services</h3>
          <p className="text-2xl font-black text-gray-800 mt-2">{bookingStats.totalServices} Services</p>
        </div>

        {/* ✅ Next Service এর ডাইনামিক লজিক */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm transition hover:shadow-md flex flex-col justify-center">
          <h3 className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-2">Next Service</h3>
          <p className="text-lg font-bold text-gray-800 leading-tight">{bookingStats.nextMainText}</p>
        {bookingStats.lastCompletedText && (
          <p className="text-xs font-bold text-gray-500 mt-1">Last Completed: {bookingStats.lastCompletedText}</p>
        )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8 relative">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-[#003B6A]" size={24} /> Profile Details
          </h2>
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                  <X size={16} /> Cancel
                </button>
                <button onClick={triggerSaveConfirm} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center w-full md:w-56 flex-shrink-0">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {displayProfileSrc ? (
                        <img src={displayProfileSrc} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-gray-400">{user.name?.charAt(0)}</span>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-1 right-1 bg-[#003B6A] p-2 rounded-full cursor-pointer hover:bg-blue-700 text-white shadow-md transition-all flex items-center">
                        <Camera size={16} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                </div>
                <p className="mt-3 font-bold text-gray-700">{user.name}</p>
                <span className="text-xs bg-blue-100 text-[#003B6A] px-2 py-0.5 rounded-full font-bold uppercase mt-1">{user.role}</span>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><User size={12}/> Full Name</label>
                    {isEditing ? (
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-b-2 border-blue-100 focus:border-[#003B6A] outline-none py-1 font-bold text-gray-800 bg-gray-50 px-2 rounded-t" />
                    ) : (
                        <p className="text-lg font-bold text-gray-800">{user.name}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Mail size={12}/> Email Address</label>
                    <p className="text-lg font-bold text-gray-800">{user.email}</p>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Phone size={12}/> Phone Number</label>
                    {isEditing ? (
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..." className="w-full border-b-2 border-blue-100 focus:border-[#003B6A] outline-none py-1 font-bold text-gray-800 bg-gray-50 px-2 rounded-t" />
                    ) : (
                        <p className="text-lg font-bold text-gray-800">{user.phone || <span className="text-gray-400 italic text-sm">Not Added</span>}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Shield size={12}/> Role</label>
                    <p className="text-lg font-bold text-gray-500 capitalize">{user.role}</p>
                </div>

                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><MapPin size={12}/> Address</label>
                    {isEditing ? (
                        <textarea name="address" rows="2" value={formData.address || ""} onChange={handleChange} placeholder="Enter your full address..." className="w-full border-2 border-blue-50 focus:border-[#003B6A] outline-none p-2 font-medium text-gray-700 rounded-lg resize-none" />
                    ) : (
                        <p className="text-base font-medium text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {user.address || <span className="text-gray-400 italic">No address provided.</span>}
                        </p>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/book-service" className="group block p-6 bg-gradient-to-r from-[#003B6A] to-blue-800 rounded-xl text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <h3 className="text-xl font-bold mb-2 flex items-center">
            Book A New Service 
            <span className="ml-2 group-hover:translate-x-1 transition">→</span>
          </h3>
          <p className="text-blue-100 text-sm">Schedule a wash, repair, or modification for your bike.</p>
        </Link>
        <Link to="/my-bookings" className="group block p-6 bg-gray-800 rounded-xl text-white shadow-lg hover:bg-gray-900 transition transform hover:-translate-y-1">
          <h3 className="text-xl font-bold mb-2 flex items-center">
            Check History
            <span className="ml-2 group-hover:translate-x-1 transition">→</span>
          </h3>
          <p className="text-gray-400 text-sm">View your past services and ongoing repair status.</p>
        </Link>
      </div>
    </div>
  );
};

export default UserProfile;