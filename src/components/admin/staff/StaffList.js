import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { 
  X, Edit, Trash2, Save, 
  CheckCircle2, AlertCircle, HelpCircle, Loader2 
} from 'lucide-react';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // ✅ Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalStatus, setModalStatus] = useState({ open: false, type: "", msg: "" });
  const [itemToDelete, setItemToDelete] = useState(null);

  // ✅ Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const departments = ['All', 'Admin', 'Service Staff'];
  const positions = ['Manager', 'Technician', 'Accountant', 'Supervisor', 'Mechanic', 'Helper'];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Trigger Delete Confirmation
  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    if (!itemToDelete) return;
    try {
      await axiosInstance.delete(`/staff/${itemToDelete}`);
      setStaff(staff.filter(s => s._id !== itemToDelete));
      setModalStatus({ open: true, type: "success", msg: "Staff member removed successfully!" });
    } catch (error) {
      setModalStatus({ open: true, type: "error", msg: "Error deleting staff member." });
    } finally {
      setItemToDelete(null);
    }
  };

  // ✅ Edit Logic
  const handleEditClick = (member) => {
    setEditData({ ...member });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`/staff/${editData._id}`, editData);
      setStaff(staff.map(s => s._id === editData._id ? res.data.staff : s));
      setEditModalOpen(false);
      setModalStatus({ open: true, type: "success", msg: "Staff details updated successfully!" });
    } catch (error) {
      setModalStatus({ open: true, type: "error", msg: "Error updating staff details." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = filter === 'All' ? staff : staff.filter(s => s.department === filter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100">
      <Loader2 className="animate-spin text-[#003B6A] mb-4" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Staff...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 relative">
      
      {/* Filter Bar */}
      <div className="mb-8 flex gap-2 sm:gap-3 overflow-x-auto pb-2">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setFilter(dept)}
            className={`px-4 sm:px-6 py-2 rounded-xl font-bold transition-all shadow-sm whitespace-nowrap ${
              filter === dept ? 'bg-[#003B6A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name & Email</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Position & Dept</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Salary</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStaff.map(member => (
              <tr key={member._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{member.phone}</td>
                <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#003B6A]">{member.position}</p>
                    <p className="text-xs text-gray-500">{member.department}</p>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800">₹{member.salary}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleEditClick(member)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="Edit">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(member._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Delete">
                        <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStaff.length === 0 && <div className="text-center text-gray-400 py-10 font-medium">No staff members found.</div>}
      </div>

      {/* ✅ EDIT MODAL */}
      {editModalOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-100 p-2 rounded-full transition">
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Edit className="text-[#003B6A]" /> Edit Staff Details
            </h3>

            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                    <input type="text" name="name" value={editData.name} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                    <input type="tel" name="phone" value={editData.phone} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position</label>
                    <select name="position" value={editData.position} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white">
                      {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                    <select name="department" value={editData.department} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white">
                      <option value="Admin">Admin</option>
                      <option value="Service Staff">Service Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salary (₹)</label>
                    <input type="number" name="salary" value={editData.salary} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience (Yrs)</label>
                    <input type="number" name="experience" value={editData.experience} onChange={handleEditChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" required />
                  </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-[#003B6A] hover:bg-blue-800 text-white font-bold py-3 rounded-xl mt-4 transition flex justify-center items-center gap-2 shadow-lg active:scale-[0.98]">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ YES/NO CONFIRMATION MODAL (RED THEME) */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Delete Staff Member?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              This action cannot be undone. Are you sure you want to remove this member from the system?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-4 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20 transition active:scale-[0.98]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SUCCESS / ERROR STATUS MODAL */}
      {modalStatus.open && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setModalStatus({ ...modalStatus, open: false })} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-10 shadow-2xl text-center animate-in zoom-in duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${modalStatus.type === "success" ? "bg-emerald-50" : "bg-rose-50"}`}>
              {modalStatus.type === "success" ? (
                <CheckCircle2 size={48} className="text-emerald-600" />
              ) : (
                <AlertCircle size={48} className="text-rose-600" />
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">
              {modalStatus.type === "success" ? "Done!" : "Oops!"}
            </h3>
            <p className="text-gray-500 mb-8">{modalStatus.msg}</p>
            <button
              onClick={() => setModalStatus({ ...modalStatus, open: false })}
              className={`w-full py-4 rounded-2xl font-bold text-white transition shadow-xl ${modalStatus.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffList;