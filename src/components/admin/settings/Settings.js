import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { Save, Building, Mail, Phone, MapPin, DollarSign, Percent, ShieldAlert, Loader2 } from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    taxRate: 18,
    currency: "INR",
    maintenanceMode: false
  });

  // 1. Load Settings from Backend
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("/settings");
      // যদি ডাটা থাকে তবে সেট করো, নাহলে ডিফল্ট থাকবে
      if (res.data) {
        setFormData({
            companyName: res.data.companyName || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            address: res.data.address || "",
            taxRate: res.data.taxRate || 18,
            currency: res.data.currency || "INR",
            maintenanceMode: res.data.maintenanceMode || false
        });
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setMessage({ type: "error", text: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Input Change
  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // 3. Save Settings to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await axiosInstance.post("/settings", formData);
      setMessage({ type: "success", text: "Settings updated successfully!" });
    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building className="text-[#003B6A]" /> General Settings
        </h2>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Company Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="BOSCH-Maatara" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="support@bosch.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="text" name="address" value={formData.address} onChange={handleChange}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Kolkata, West Bengal" />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Financial Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
            <div className="relative">
              <Percent className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
              <select name="currency" value={formData.currency} onChange={handleChange}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Danger Zone */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full text-red-500 shadow-sm"><ShieldAlert size={20} /></div>
            <div>
              <h4 className="font-bold text-red-800">Maintenance Mode</h4>
              <p className="text-xs text-red-600">Disable customer access temporarily.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving}
            className="bg-[#003B6A] hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-70">
            {saving ? <><Loader2 className="animate-spin" /> Saving...</> : <><Save size={20} /> Save Changes</>}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;