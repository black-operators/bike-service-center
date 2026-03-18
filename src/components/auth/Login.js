import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { setAuthToken, setUser } from "../../api/auth";

const Login = () => {
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRole, setSuccessRole] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", formData);
      
      setAuthToken(response.data.token);
      setUser(response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      const userRole = response.data.role;
      setSuccessRole(userRole);
      setShowSuccessModal(true); 
      
      setTimeout(() => {
        if (userRole === 'admin' || userRole === 'staff') {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }, 2000);

    } catch (err) {
      console.error("Login Error: ", err);
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        <div className="md:w-1/2 bg-[#003B6A] p-10 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-400 opacity-20 blur-3xl rounded-full"></div>
          
          <h2 className="text-3xl font-extrabold mb-4 relative z-10">
            Welcome to <br /> BOSCH<span className="text-red-500">-Maatara</span>
          </h2>
          <p className="text-blue-100 mb-8 relative z-10">
            Access your dashboard, track service status, and manage your bike profile.
          </p>
          <div className="relative z-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <p className="text-sm font-medium">✨ Secure Login</p>
            <p className="text-xs text-blue-200 mt-1">Role-based access control active.</p>
          </div>
        </div>

        <div className="md:w-1/2 p-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Sign In to Account
          </h3>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none transition-all" 
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password / Security Code</label>
                {/* ✅ Forgot Password Link Added Here */}
                <Link to="/forgot-password" className="text-xs font-bold text-[#003B6A] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button className="w-full bg-[#003B6A] hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2" type="submit" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={18}/> Authenticating...</> : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?
              <Link 
                to="/register" 
                className="text-[#003B6A] font-bold ml-1 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Login Successful!
              </h2>
              <p className="text-gray-600 font-medium mb-6">
                Redirecting to {successRole === 'admin' || successRole === 'staff' ? 'Admin Panel' : 'Dashboard'}...
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{
                  animation: 'expand 2s ease-in-out forwards'
                }} />
              </div>
          </div>
          <style>{`
            @keyframes expand {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Login;