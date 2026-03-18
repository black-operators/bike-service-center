import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ব্যাকএন্ডে রিকোয়েস্ট পাঠানো
      await axiosInstance.post("/auth/forgot-password", { email });
      setIsSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full p-8">
        
        <Link to="/login" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#003B6A] mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>

        {!isSent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-[#003B6A]" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mt-2">
                No worries, we'll send you reset instructions. Please enter your email address.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none transition-all" 
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !email}
                className="w-full bg-[#003B6A] hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-8">
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
            
            <p className="text-sm text-gray-500 mb-4">
              Didn't receive the email? Check your spam folder or
            </p>
            <button 
              onClick={() => setIsSent(false)} 
              className="text-[#003B6A] font-bold hover:underline"
            >
              try another email address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;