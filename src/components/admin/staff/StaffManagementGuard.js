import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { 
  Lock, Loader2, ShieldCheck, UserPlus, Users, AlertCircle, CheckCircle2,
} from 'lucide-react';
import StaffList from './StaffList';
import AddStaff from './AddStaff';

// --- Custom Modal Component ---
const CustomModal = ({ isOpen, type, title, message, onConfirm }) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle2 className="text-green-500 w-16 h-16" />,
    error: <AlertCircle className="text-red-500 w-16 h-16" />,
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 text-center">
        <div className="flex justify-center mb-6">{icons[type]}</div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>
        <button 
          onClick={onConfirm} 
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-colors"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

const StaffManagementGuard = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // ✅ Modal States
  const [modalStatus, setModalStatus] = useState({ open: false, type: "", title: "", msg: "" });

  const requestOTP = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/staff/request-access-otp');
      setOtpSent(true);
    } catch (err) {
      setModalStatus({ 
        open: true, 
        type: "error", 
        title: "OTP Failed", 
        msg: "Failed to send security OTP. Please refresh and try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVerified && !otpSent) requestOTP();
  }, [isVerified, otpSent]);

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/staff/verify-access-otp', { otp });
      if (res.data.success) {
        setIsVerified(true);
      }
    } catch (err) {
      setModalStatus({ 
        open: true, 
        type: "error", 
        title: "Access Denied", 
        msg: "The OTP entered is incorrect. Please check the Admin email." 
      });
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-fit">
           <button onClick={() => setActiveTab('list')} className={`px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 transition ${activeTab === 'list' ? 'bg-[#003B6A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
             <Users size={18}/> Staff List
           </button>
           <button onClick={() => setActiveTab('add')} className={`px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 transition ${activeTab === 'add' ? 'bg-[#003B6A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
             <UserPlus size={18}/> Add New Staff
           </button>
        </div>
        {activeTab === 'list' ? <StaffList /> : <AddStaff />}
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
      {/* ✅ SUCCESS / ERROR STATUS MODAL */}
      <CustomModal 
        isOpen={modalStatus.open}
        type={modalStatus.type}
        title={modalStatus.title}
        message={modalStatus.msg}
        onConfirm={() => setModalStatus({ ...modalStatus, open: false })}
      />

      <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-gray-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-50 text-[#003B6A] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Security Verification</h2>
        <p className="text-gray-500 text-sm mb-8">An OTP has been sent to the Admin's registered email to unlock this restricted area.</p>

        {otpSent ? (
          <form onSubmit={verifyOTP}>
            <input 
              type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="• • • • • •"
              className="w-full text-center text-4xl tracking-[0.5em] font-mono py-4 border-b-2 border-gray-300 focus:border-[#003B6A] outline-none mb-8 bg-transparent"
            />
            <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-[#003B6A] hover:bg-blue-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg text-lg">
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
              {loading ? 'Verifying...' : 'Unlock Management'}
            </button>
          </form>
        ) : (
          <Loader2 className="animate-spin text-[#003B6A] mx-auto" size={40} />
        )}
      </div>
    </div>
  );
};

export default StaffManagementGuard;