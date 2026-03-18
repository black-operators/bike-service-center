import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { compressImages } from '../../../api/helpers';
import { 
  Save, X, UploadCloud, Loader2, CheckCircle2, 
  AlertCircle, HelpCircle 
} from 'lucide-react';

const AddParts = ({ onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    name: '', category: 'accessories', price: '', stock: '', description: '', compatibility: ''
  });
  
  const [files, setFiles] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [loading, setLoading] = useState(false);

  // backend base url for building image paths
  // make sure it always ends with `/api` to mirror axios instance
  const _rawBase = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';
  const base = _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`;

  // ✅ Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalStatus, setModalStatus] = useState({ open: false, type: "", msg: "" });

  const getImageUrl = useCallback((img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;

    return `${base}${img}`;
  }, [base]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        price: initialData.price,
        stock: initialData.stock || initialData.quantity,
        description: initialData.description,
        compatibility: initialData.compatibility || ''
      });
      if (initialData.images && initialData.images.length > 0) {
        setPreviews(initialData.images.map(img => getImageUrl(img)));
      }
    }
  }, [initialData, getImageUrl]);

  const categories = ['accessories', 'brake', 'electrical', 'engine', 'ev', 'others'];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (files.length > 0) {
      // Compress images before upload to stay under Vercel's 4.5MB limit
      try {
        const compressedFiles = await compressImages(files, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          quality: 0.8
        });
        compressedFiles.forEach((file) => {
          data.append("images", file);
        });
      } catch (compressionError) {
        console.error("Image compression failed:", compressionError);
        // Fallback to original files if compression fails
        files.forEach((file) => {
          data.append("images", file);
        });
      }
    }

    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" }
      };

      if (initialData) {
        await axiosInstance.put(`/parts/update/${initialData._id}`, data, config);
        setModalStatus({ open: true, type: "success", msg: "Part details updated successfully!" });
      } else {
        await axiosInstance.post('/parts/add', data, config);
        setModalStatus({ open: true, type: "success", msg: "New part added to inventory successfully!" });
      }
    } catch (error) {
      console.error("Submit Error:", error);
      setModalStatus({ 
        open: true, 
        type: "error", 
        msg: error.response?.data?.message || "An error occurred while saving the part." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalStatus({ ...modalStatus, open: false });
    if (modalStatus.type === "success") {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative animate-fadeIn mx-2 sm:mx-0">
      
      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={32} className="text-[#003B6A]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
              {initialData ? "Confirm Update?" : "Confirm Addition?"}
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to {initialData ? "update" : "add"} <span className="font-bold text-gray-900">{formData.name}</span> to the inventory?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                Cancel
              </button>
              <button 
                onClick={handleFinalSubmit} 
                className="flex-1 py-4 rounded-2xl font-bold bg-[#003B6A] text-white hover:bg-blue-800 shadow-lg transition active:scale-[0.98]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SUCCESS / ERROR STATUS MODAL */}
      {modalStatus.open && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleModalClose} />
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
              onClick={handleModalClose}
              className={`w-full py-4 rounded-2xl font-bold text-white transition shadow-xl ${modalStatus.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-800">{initialData ? "Edit Part" : "Add New Part"}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 bg-gray-100 p-2 rounded-full"><X size={20} /></button>
      </div>

      <form onSubmit={handlePreSubmit} className="p-6 space-y-5">
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition">
          <input 
            type="file" 
            id="partsImageUpload"
            accept="image/*" 
            multiple 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <label htmlFor="partsImageUpload" className="flex flex-col items-center cursor-pointer">
            <UploadCloud className="text-blue-500 mb-2" size={32} />
            <p className="text-sm font-medium text-gray-700">
              {files.length > 0 ? `${files.length} images selected` : "Tap to upload multiple images"}
            </p>
          </label>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previews.map((src, index) => (
              <img key={index} src={src} alt="Preview" className="w-20 h-20 object-cover rounded-lg border shadow-sm" />
            ))}
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-white uppercase outline-none focus:ring-2 focus:ring-blue-100">
              {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stock</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>
        
        <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Compatibility</label>
            <input type="text" name="compatibility" value={formData.compatibility} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg h-20 resize-none outline-none focus:ring-2 focus:ring-blue-100"></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#003B6A] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Update Part' : 'Save Part'}</>}
        </button>
      </form>
    </div>
  );
};

export default AddParts;