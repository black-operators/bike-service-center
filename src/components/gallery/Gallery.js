import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Loader2, X, ZoomIn, Filter, PlayCircle } from "lucide-react";

const bgImage = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    "All", "General Service", "Engine Work", "Modification", 
    "Painting & Wrap", "Restoration", "Accessories", "Others"
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axiosInstance.get("/gallery");
      setImages(res.data);
      setFilteredImages(res.data);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => (img.category || "General Service") === activeCategory));
    }
  }, [activeCategory, images]);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") setSelectedImage(null); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i);
  const base = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';

  const getMediaUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${base}${url}`;
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url(${bgImage})` }}
      />

      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Our <span className="text-blue-500">Work Gallery</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Explore our finest works filtered by service type.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                activeCategory === cat ? "bg-blue-600 text-white scale-105" : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 max-w-7xl mx-auto">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Masterpieces...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((item) => (
              <div 
                key={item._id} 
                onClick={() => setSelectedImage(item)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md cursor-pointer transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Container: Removed fixed h-64 and aspect classes to avoid empty space */}
                <div className="relative overflow-hidden flex">
                  {isVideo(item.image) ? (
                    <div className="relative w-full h-64">
                      <video 
                        src={getMediaUrl(item.image)} 
                        className="w-full h-full object-cover opacity-90"
                        muted loop playsInline
                        onMouseOver={(e) => e.target.play()}
                        onMouseOut={(e) => e.target.pause()}
                      />
                      <PlayCircle className="absolute inset-0 m-auto text-white/70" size={48} />
                    </div>
                  ) : (
                    <img 
                      src={getMediaUrl(item.image)} 
                      alt="Work Detail" 
                      className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=No+Image"; }}
                    />
                  )}
                  
                  <span className="absolute top-4 left-4 bg-blue-600/80 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md uppercase font-black z-10 border border-white/20">
                    {item.category || "Service"}
                  </span>

                  <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <ZoomIn className="text-white" size={32} />
                  </div>
                </div>
              </div>
            ))}

            {filteredImages.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10">
                <Filter className="text-gray-500 mx-auto mb-4" size={32} />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">No media found</h3>
                <p className="text-gray-500">Try selecting a different category.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-20 mt-6 right-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all z-50 border border-white/10" onClick={() => setSelectedImage(null)}>
              <X size={40} />
            </button>

            <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="rounded-3xl overflow-hidden border-[8px] border-white/5 bg-black">
                {isVideo(selectedImage.image) ? (
                  <video src={getMediaUrl(selectedImage.image)} controls autoPlay className="max-h-[80vh] w-auto" />
                ) : (
                  <img src={getMediaUrl(selectedImage.image)} alt="Preview" className="max-h-[80vh] w-auto object-contain" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;