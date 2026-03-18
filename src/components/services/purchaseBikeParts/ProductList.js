import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useParts from '../../../hooks/useParts'; 
import { 
  ShoppingCart, ArrowLeft, PackageX, Loader2, 
  ShoppingBag, X, CheckCircle, AlertCircle, HelpCircle
} from 'lucide-react';

import bgImage from '../../../assets/gallery/services/BGImage.jpeg';

const ProductList = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { parts, loading } = useParts(category);
  
  const [cartCount, setCartCount] = useState(0);

  // Helper: return absolute url if cloudinary, otherwise prefix API host
  // ensure API endpoint includes `/api`
  const _rawBase = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const base = _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`;
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${base}${img}`;
  };

  // Helper: Get style based on category (Matches PartsOverview theme)
  const getCategoryStyle = (cat) => {
    const c = cat?.toLowerCase();
    if (c === 'accessories') return { color: "from-pink-500/20 to-slate-900/90 border-pink-500/30", glow: "hover:shadow-pink-500/20" };
    if (c === 'brake') return { color: "from-red-500/20 to-slate-900/90 border-red-500/30", glow: "hover:shadow-red-500/20" };
    if (c === 'electrical') return { color: "from-yellow-500/20 to-slate-900/90 border-yellow-500/30", glow: "hover:shadow-yellow-500/20" };
    if (c === 'engine') return { color: "from-cyan-500/20 to-slate-900/90 border-cyan-500/30", glow: "hover:shadow-cyan-500/20" };
    if (c === 'ev') return { color: "from-green-500/20 to-slate-900/90 border-green-500/30", glow: "hover:shadow-green-500/20" };
    return { color: "from-purple-500/20 to-slate-900/90 border-purple-500/30", glow: "hover:shadow-purple-500/20" };
  };
  
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [activeImage, setActiveImage] = useState(''); 
  const [productToConfirm, setProductToConfirm] = useState(null); 

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('myCart')) || [];
    setCartCount(savedCart.length);
  }, []);

  const handleAddToCartClick = (product, e) => {
    if(e) e.stopPropagation(); 
    setProductToConfirm(product);
  };

  const confirmAddToCart = () => {
    if (!productToConfirm) return;
    const savedCart = JSON.parse(localStorage.getItem('myCart')) || [];
    const newCart = [...savedCart, productToConfirm];
    localStorage.setItem('myCart', JSON.stringify(newCart));
    setCartCount(newCart.length);
    setProductToConfirm(null);
    setSelectedProduct(null); 
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    if (product.images && product.images.length > 0) {
      setActiveImage(getImageUrl(product.images[0]));
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setActiveImage('');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="font-semibold text-gray-400">Loading Store...</p>
      </div>
    </div>
  );

  const currentStyle = getCategoryStyle(category);

  return (
    <div className="min-h-screen bg-transparent pb-16"
    style={{ 
      backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url(${bgImage})` 
    }}
    >
      
      {/* Header Section */}
      <div className="bg-transparent text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 md:left-10 md:top-8 inline-flex items-center gap-2 text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-sm transition z-30"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 capitalize">
          {category === 'others' ? 'EV & Other' : category} <span className="text-cyan-400">Parts</span>
        </h1>
        <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg opacity-80">
          Browse our collection of genuine parts and premium accessories.
        </p>
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => navigate('/cart')} 
          className="relative bg-[#003B6A] text-white p-4 rounded-2xl shadow-2xl hover:bg-blue-700 transition flex items-center gap-3 group"
        >
          <ShoppingBag size={24} className="group-hover:scale-110 transition" />
          <span className="hidden md:inline font-bold">View Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-900 font-bold animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Product Grid - Updated UI */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8 relative z-20">
        {parts.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {parts.map((product) => (
              <div 
                key={product._id} 
                onClick={() => openProductModal(product)}
                className={`
                  relative group cursor-pointer rounded-3xl p-8 
                  border backdrop-blur-md transition-all duration-500 
                  hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                  bg-gradient-to-br ${currentStyle.color} ${currentStyle.glow}
                  flex flex-col justify-between h-full overflow-hidden
                `}
              >
                {/* Out of Stock Overlay */}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                    <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg transform -rotate-12">OUT OF STOCK</span>
                  </div>
                )}

                {/* Top Image Area */}
                <div className="w-full h-48 mb-6 relative z-0 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={getImageUrl(product.images[0])} 
                      alt={product.name} 
                      className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <PackageX size={48} strokeWidth={1} />
                      <span className="text-xs mt-2 opacity-50">No Image</span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="relative z-10 flex-grow flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-2 truncate">{product.name}</h2>
                  <p className="text-gray-300 text-xs leading-relaxed mb-12 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-xs text-gray-400 block font-medium">Price</span>
                      <span className="text-2xl font-black text-white">₹{product.price}</span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleAddToCartClick(product, e)}
                      disabled={product.stock <= 0}
                      className={`
                        px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition backdrop-blur-sm border border-white/20
                        ${product.stock > 0 
                          ? "bg-white/10 hover:bg-white/20 text-white hover:scale-105" 
                          : "bg-white/5 text-gray-500 cursor-not-allowed border-transparent"}
                      `}
                    >
                      <ShoppingCart size={18} /> {product.stock > 0 ? "Add" : "Sold"}
                    </button>
                  </div>
                </div>

                {/* Bottom Shine Effect */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/5 backdrop-blur-md rounded-3xl shadow-inner border border-dashed border-white/20 mt-10">
            <PackageX className="mx-auto text-gray-500 mb-4" size={80} />
            <h3 className="text-2xl font-bold text-white">No products found</h3>
            <p className="text-gray-400 mt-2">We are currently restocking this category.</p>
          </div>
        )}
      </div>

      {/* YES/NO CONFIRMATION POPUP */}
      {productToConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setProductToConfirm(null)}></div>
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-10 shadow-2xl text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={48} className="text-[#003B6A]" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">Add to Cart?</h3>
            <p className="text-gray-500 mb-8">
              Do you want to add <span className="font-bold text-gray-900">{productToConfirm.name}</span> to your shopping bag?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setProductToConfirm(null)}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition"
              >
                No
              </button>
              <button 
                onClick={confirmAddToCart}
                className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition"
              >
                Yes, Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={closeProductModal}
          ></div>

          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 animate-in zoom-in duration-200 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={closeProductModal}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 p-2 rounded-full transition z-20"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center border-r border-gray-100">
              <div className="w-full h-64 md:h-80 mb-6 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  {activeImage ? (
                    <img src={activeImage} alt={selectedProduct.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <PackageX size={64} className="text-gray-300" />
                  )}
              </div>
              
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-2 w-full justify-center">
                  {selectedProduct.images.map((img, index) => {
                    const url = getImageUrl(img);
                    return (
                      <div 
                        key={index}
                        onClick={() => setActiveImage(url)}
                        className={`w-16 h-16 rounded-lg border-2 cursor-pointer overflow-hidden flex-shrink-0 ${
                          activeImage === url ? 'border-[#003B6A] ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <span className="bg-blue-50 text-[#003B6A] text-xs font-bold px-3 py-1 rounded-full w-fit uppercase mb-3">
                {selectedProduct.category}
              </span>
              
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2">{selectedProduct.name}</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-[#003B6A]">₹{selectedProduct.price}</span>
                {selectedProduct.stock > 0 ? (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                    <CheckCircle size={16} /> In Stock ({selectedProduct.stock})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
                    <AlertCircle size={16} /> Out of Stock
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Product Description</h4>
                <p className="text-gray-600 leading-relaxed text-sm h-24 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedProduct.description || "No description available for this product."}
                </p>
              </div>

              <div className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-700 text-sm mb-1">Compatibility / Fits with:</h4>
                <p className="text-gray-600 text-sm italic">
                  {selectedProduct.compatibility || "Universal / Not specified"}
                </p>
              </div>

              <div className="mt-auto flex gap-4">
                  <button 
                    onClick={(e) => handleAddToCartClick(selectedProduct, e)}
                    disabled={selectedProduct.stock <= 0}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition shadow-xl ${
                      selectedProduct.stock > 0 
                      ? "bg-[#003B6A] text-white hover:bg-cyan-500 hover:text-black" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart size={24} /> Add to Cart
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;