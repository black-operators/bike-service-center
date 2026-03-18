import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { ShieldCheck, X, Loader2, MailCheck, UserPlus } from 'lucide-react';

const AddStaff = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', position: 'Manager',
    department: 'Admin', salary: '', joinDate: '', experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ✅ নতুন পজিশন ও ডিপার্টমেন্ট
  const positions = ['Manager', 'Technician', 'Accountant', 'Supervisor', 'Mechanic', 'Helper'];
  const departments = ['Admin', 'Service Staff'];

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/staff/add', formData);
      setMessage({ type: 'success', text: 'Staff added! 6-digit security code sent to their email.' });
      setFormData({ name: '', email: '', phone: '', position: 'Manager', department: 'Admin', salary: '', joinDate: '', experience: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add staff.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <div className="bg-green-100 p-2 sm:p-3 rounded-full text-green-600"><MailCheck size={24}/></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Add New Staff</h2>
            <p className="text-gray-500 text-sm">An automated email with a 6-digit code will be sent.</p>
          </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.type === 'error' ? <X size={20}/> : <ShieldCheck size={20}/>} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Position</label>
            <select name="position" value={formData.position} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none">
              {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Department</label>
            <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none">
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Salary (₹)</label>
            <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Experience (Yrs)</label>
            <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} required step="0.5" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Joining Date</label>
            <input type="date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003B6A] outline-none" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#003B6A] hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg text-lg transition mt-4">
          {loading ? <Loader2 className="animate-spin"/> : <UserPlus size={24}/>}
          {loading ? 'Processing...' : 'Add Staff & Send Code'}
        </button>
      </form>
    </div>
  );
};
export default AddStaff;