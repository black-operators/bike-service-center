import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Package, Plus, Edit2, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import AddParts from './AddParts'; 

const PartsLists = () => {
  const [parts, setParts] = useState([]);

  // backend base for building image urls; ensure `/api` present
  const _rawBase = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';
  const base = _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`;

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${base}${img}`;
  };
  const [filteredParts, setFilteredParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // ✅ Modal & Popup States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null); 
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredParts(parts);
    } else {
      setFilteredParts(parts.filter(part => part.category === filter));
    }
  }, [filter, parts]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/parts');
      setParts(response.data);
      setFilteredParts(response.data);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to show status notification
  const showStatus = (message, isError = false) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  // ✅ Updated Delete Handler
  const handleDelete = async () => {
    try {
      const id = confirmDelete.id;
      await axiosInstance.delete(`/parts/delete/${id}`);
      setParts(parts.filter(p => p._id !== id));
      setConfirmDelete({ show: false, id: null });
      showStatus("Part removed from inventory!");
    } catch (error) {
      console.error('Delete error:', error);
      showStatus("Failed to delete part.", true);
      setConfirmDelete({ show: false, id: null });
    }
  };

  const handleEditClick = (part) => {
    setEditData(part);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditData(null); 
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchParts(); 
    showStatus(editData ? "Part updated successfully!" : "New part added to stock!");
  };

  const categories = ['all', 'accessories', 'brake', 'electrical', 'engine', 'ev'];

  return (
    <div className="p-3 sm:p-6 min-h-screen bg-gray-50 relative">
      
      {/* ✅ Status Notification Toast */}
      {statusPopup.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Parts Inventory</h1>
          <p className="text-gray-500 text-sm">Manage bike parts stock</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-[#003B6A] hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition font-bold w-full sm:w-auto justify-center"
        >
          <Plus size={20} /> Add New Part
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition capitalize whitespace-nowrap ${
              filter === cat
                ? 'bg-blue-100 text-[#003B6A] border-b-2 border-[#003B6A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Compatibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr><td colSpan="6" className="p-10 text-center"><Loader2 className="animate-spin inline mr-2 text-[#003B6A]"/>Loading...</td></tr>
            ) : filteredParts.length > 0 ? (
              filteredParts.map(part => (
              <tr key={part._id} className="hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                        {part.images && part.images.length > 0 ? (
                            <img 
                              src={getImageUrl(part.images[0])} 
                              alt={part.name} 
                              className="w-full h-full object-cover"
                            />
                        ) : (<Package className="w-6 h-6 m-auto mt-3 text-gray-400"/>)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{part.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{part.description}</p>
                    </div>
                </td>
                <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold uppercase">{part.category}</span></td>
                <td className="p-4 font-medium">₹{part.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    part.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {part.stock} Left
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{part.compatibility || "Universal"}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(part)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 size={18}/></button>
                    <button onClick={() => setConfirmDelete({ show: true, id: part._id })} className="p-2 text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))) : (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400">No parts found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* ✅ Action Modal (Add/Edit Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <AddParts 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleSuccess}
                initialData={editData} 
            />
        </div>
      )}

      {/* ✅ Confirmation Modal (Delete) */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Part?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to remove this item from the inventory? This cannot be undone.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete({ show: false, id: null })} 
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartsLists;