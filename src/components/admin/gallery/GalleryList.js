import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { compressImage } from "../../../api/helpers";
import { 
  Plus, Trash2, Image as ImageIcon, Loader2, X, 
  AlertTriangle, CheckCircle2, PlayCircle, Video 
} from "lucide-react";
import AddVideo from "./AddVideo"; // ✅ AddVideo ফাইলটি ইমপোর্ট করা হলো (পাথ ঠিক আছে কিনা দেখে নেবেন)

const GalleryList = () => {
  const MAX_UPLOAD_MB = 1.8;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ফর্ম টগল স্টেট
  const [showAddForm, setShowAddForm] = useState(false); 
  const [showVideoForm, setShowVideoForm] = useState(false); // ✅ ভিডিও ফর্মের জন্য নতুন স্টেট
  
  // Modals
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  // ফর্ম ডাটা স্টেটস (ইমেজের জন্য)
  const [category, setCategory] = useState("General Service"); 
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axiosInstance.get("/gallery");
      setImages(res.data);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (message, isError = false) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  // helper for local/absolute urls
  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // use configured backend host (fall back to localhost)
    const base = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';
    return `${base}${url}`;
  };

  // ইমেজ আপলোড হ্যান্ডলার
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showStatus("Please select an image!", true);

    setUploading(true);

    try {
      let imageToUpload = file;
      try {
        imageToUpload = await compressImage(file, {
          maxSizeMB: MAX_UPLOAD_MB,
          maxWidthOrHeight: 1600,
          quality: 0.75,
          minQuality: 0.4,
          maxAttempts: 10,
        });
      } catch (compressionError) {
        console.error("Image compression failed:", compressionError);
        return showStatus("Image compression failed. Please try a smaller JPG/PNG image.", true);
      }

      if (imageToUpload.size > MAX_UPLOAD_MB * 1024 * 1024) {
        return showStatus(`Image is still too large after compression. Keep it under ${MAX_UPLOAD_MB}MB.`, true);
      }

      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);
      formData.append("image", imageToUpload);

      await axiosInstance.post("/gallery/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      showStatus("Image Uploaded Successfully!");
      
      setShowAddForm(false);
      setCategory("General Service");
      setDescription("");
      setFile(null);
      
      fetchImages(); 
    } catch (err) {
      console.error(err);
      showStatus("Upload Failed!", true);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/gallery/${confirmDelete.id}`);
      setImages(images.filter((img) => img._id !== confirmDelete.id));
      setConfirmDelete({ show: false, id: null });
      showStatus("Media deleted successfully!");
    } catch (err) {
      showStatus("Delete Failed!", true);
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px] relative">
      
      {statusPopup.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300 w-[90%] sm:w-auto">
          <div className={`flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold text-sm">{statusPopup.message}</span>
          </div>
        </div>
      )}

      {/* --- Header & Add Buttons --- */}
      <div className="flex flex-col gap-4 mb-6 border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon className="text-[#003B6A]" /> Gallery Management
        </h2>
        
        {/* ✅ এখানে ২টো বাটন দেওয়া হলো (Add Image এবং Add Video) */}
        <div className="flex flex-col sm:flex-row gap-3">
            <button 
            onClick={() => { setShowAddForm(!showAddForm); setShowVideoForm(false); }}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-bold shadow-md w-full sm:w-auto
                ${showAddForm ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-[#003B6A] text-white hover:bg-blue-800"}`}
            >
            {showAddForm ? <><X size={18} /> Close</> : <><Plus size={18} /> Add Image</>}
            </button>

            <button 
            onClick={() => { setShowVideoForm(!showVideoForm); setShowAddForm(false); }}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-bold shadow-md w-full sm:w-auto
                ${showVideoForm ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
            {showVideoForm ? <><X size={18} /> Close</> : <><Video size={18} /> Add Video</>}
            </button>
        </div>
      </div>

      {/* --- Add Image Form --- */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100 animate-fadeIn shadow-inner">
          <h3 className="font-bold text-lg mb-4 text-gray-700">Upload New Photo</h3>
          <form onSubmit={handleUpload} className="space-y-4 max-w-lg">
            

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="General Service">General Service</option>
                <option value="Engine Work">Engine Work</option>
                <option value="Modification">Modification</option>
                <option value="Painting & Wrap">Painting & Wrap</option>
                <option value="Restoration">Restoration</option>
                <option value="Accessories">Accessories Fitting</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Select Image</label>
              <input 
                type="file" 
                id="galleryImageUpload"
                accept="image/*" 
                onChange={(e) => setFile(e.target.files[0])} 
                required 
                className="hidden" 
              />
              <label 
                htmlFor="galleryImageUpload" 
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg bg-white flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition"
              >
                <Plus size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                  {file ? file.name : "Tap to select image"}
                </span>
              </label>
            </div>

            <button type="submit" disabled={uploading} className="bg-[#003B6A] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-70">
              {uploading ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : "Upload Image"}
            </button>
          </form>
        </div>
      )}

      {/* --- ✅ Add Video Form Component --- */}
      {showVideoForm && (
        <div className="mb-8 animate-fadeIn">
            {/* আমরা যে AddVideo.js বানিয়েছিলাম সেটা এখানে রেন্ডার হবে */}
            <AddVideo onSuccess={() => {
                setShowVideoForm(false);
                fetchImages(); // ভিডিও আপলোড হলে লিস্ট রিফ্রেশ হবে
            }} />
        </div>
      )}

      {/* --- Media List Grid --- */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((item) => (
            <div key={item._id} className="relative group rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white hover:shadow-xl transition-all">
              
              <div className="h-48 overflow-hidden relative bg-black">
                {isVideo(item.image) ? (
                  <>
                    <video 
                      src={getMediaUrl(item.image)} 
                      className="w-full h-full object-cover opacity-80" 
                      muted loop 
                      onMouseOver={(e) => e.target.play()}
                      onMouseOut={(e) => e.target.pause()}
                    />
                    <PlayCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80" size={32} />
                  </>
                ) : (
                  <img src={getMediaUrl(item.image)} alt="Gallery media" className="w-full h-full object-cover" />
                )}
                
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm uppercase font-bold z-10">
                  {item.category || "Service"}
                </span>
              </div>
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <button onClick={() => setConfirmDelete({ show: true, id: item._id })} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Media?</h3>
            <p className="text-gray-500 mb-6 text-sm">Are you sure you want to remove this from the gallery?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete({ show: false, id: null })} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">No, Keep it</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryList;