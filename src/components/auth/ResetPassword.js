import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.put(`/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full p-8">
        
        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-[#003B6A]" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Set New Password</h2>
              <p className="text-gray-500 text-sm mt-2">Enter your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none" 
                    required
                  />
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}

              <button type="submit" disabled={loading || !password} className="w-full bg-[#003B6A] hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle size={50} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
            <p className="text-gray-600 mb-6">Your password has been changed successfully.</p>
            <p className="text-sm text-gray-400">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;