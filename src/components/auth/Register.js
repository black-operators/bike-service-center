import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Loader2, Phone, Shield, Key, CheckCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user", 
    secretCode: "" 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/register", formData);
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-[#003B6A] p-10 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-red-500 opacity-20 blur-3xl rounded-full"></div>
          <h2 className="text-3xl font-extrabold mb-4 relative z-10">Join BOSCH<span className="text-red-500">-Maatara</span></h2>
          <p className="text-blue-100 relative z-10">Create an account to track services & offers.</p>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Account</h3>

          {error && <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="name" type="text" required placeholder="John Doe" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="email" type="email" required placeholder="name@example.com" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="phone" type="tel" required placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Register As</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none bg-white">
                  <option value="user">Customer (User)</option>
                  <option value="staff">Staff (Employee)</option>
                </select>
              </div>
            </div>

            {/* ✅ 6-Digit Code Field for Staff */}
            {formData.role === "staff" && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-red-600 mb-1">6-Digit Verification Code (Sent by Admin)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-red-400" size={18} />
                  <input name="secretCode" type="text" required placeholder="e.g. 123456" value={formData.secretCode} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-red-50 font-mono tracking-widest" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Set New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="password" type="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003B6A] outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#003B6A] hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Already have an account? <Link to="/login" className="text-[#003B6A] font-bold ml-1 hover:underline">Sign In</Link></p>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
            <p className="text-gray-600">Redirecting you to login...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;