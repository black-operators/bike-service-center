import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance'; 
import { Trash2, ArrowLeft, CheckCircle, Loader2, ShoppingBag, AlertCircle, HelpCircle, PartyPopper, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  // ensure backend base always includes /api
  const _rawBase = process.env.REACT_APP_BACK_URL || 'http://localhost:3001';
  const base = _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`;
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${base}${img}`;
  };
  const [showConfirm, setShowConfirm] = useState(false); 
  const [showLoginModal, setShowLoginModal] = useState(false); 
  const [showSuccess, setShowSuccess] = useState(false); // ✅ Success Modal state
  const [orderId, setOrderId] = useState(""); // ✅ To show ID in modal
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('myCart')) || [];
    setCartItems(savedCart);
  }, []);

  const removeItem = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    localStorage.setItem('myCart', JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const triggerCheckout = () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
        setShowLoginModal(true);
        return;
    }
    setShowConfirm(true);
  };

  const handleFinalCheckout = async () => {
    setShowConfirm(false);
    try {
      setLoading(true);
      const orderData = {
        items: cartItems.map(item => ({
          partId: item._id,
          name: item.name,
          price: item.price,
          image: item.images && item.images.length > 0 ? item.images[0] : ""
        })),
        totalAmount: totalPrice
      };

      const res = await axiosInstance.post('/parts-bookings/create', orderData);

      if (res.data.success) {
        setOrderId(res.data.bookingId); // Set ID for modal
        localStorage.removeItem('myCart');
        setCartItems([]);
        window.dispatchEvent(new Event("storage"));
        setShowSuccess(true); // ✅ Trigger Success Modal
      }
    } catch (error) {
      console.error("Booking Error:", error);
      showStatusPopup(error.response?.data?.message || "Booking Failed. Please try again.", true);
    } finally {
      setLoading(false);
    }
  };

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 font-bold hover:text-[#003B6A] transition">
          <ArrowLeft size={20} /> Continue Shopping
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <ShoppingBag className="text-[#003B6A]" /> My Shopping Cart
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border">
                    {item.images && item.images.length > 0 ? (
                        <img src={getImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                    <p className="text-gray-500 text-xs bg-gray-100 inline-block px-2 py-1 rounded uppercase font-bold mt-1">{item.category}</p>
                    <p className="font-bold text-[#003B6A] mt-2 text-lg">₹{item.price}</p>
                  </div>
                  <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-600 p-2 bg-gray-50 hover:bg-red-50 rounded-full transition">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-20 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Order Summary</h3>
                <div className="flex justify-between mb-2 text-gray-600">
                  <span>Items ({cartItems.length})</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between mb-6 text-gray-600">
                  <span>Pickup Charge</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                <div className="border-t border-dashed pt-4 flex justify-between font-black text-xl mb-6 text-[#003B6A]">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>

                <button 
                  onClick={triggerCheckout}
                  disabled={loading}
                  className="w-full bg-[#003B6A] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition flex justify-center items-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin"/> : <CheckCircle size={20}/>}
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
                
                <div className="mt-4 bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                    <p className="font-bold">Note:</p>
                    <p>No online payment required. Pay at the shop when you pick up your order.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <ShoppingBag className="mx-auto text-gray-200 mb-4" size={80} />
            <h2 className="text-2xl font-bold text-gray-400">Your cart is empty</h2>
            <button onClick={() => navigate('/services/parts-store')} className="bg-[#003B6A] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg mt-6">
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={48} className="text-[#003B6A]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Place Order?</h3>
            <p className="text-gray-500 mb-8">Are you sure you want to place this order for <span className="font-bold text-[#003B6A]">₹{totalPrice}</span>?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">No</button>
              <button onClick={handleFinalCheckout} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition">Yes, Order</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ORDER SUCCESS MODAL (Replaces default alert) */}
      {showSuccess && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
          <div className="bg-white rounded-[35px] p-10 max-w-md w-full relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper size={50} className="text-green-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h3>
            <p className="text-gray-500 mb-6">Your order has been successfully sent to<br></br><span className="font-bold text-[#ff0000]">Bosch</span><span className="font-bold text-[#175181]">-Maatara</span>.</p>
            
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 mb-8">
                <span className="text-xs uppercase text-gray-400 font-bold block mb-1">Your Booking ID</span>
                <span className="text-2xl font-mono font-black text-[#003B6A] tracking-wider">{orderId}</span>
            </div>

            <button 
                onClick={() => navigate('/user/parts-bookings')}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl"
            >
              View My Bookings
            </button>
          </div>
        </div>
      )}

      {/* ✅ LOGIN ALERT MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={48} className="text-amber-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-500 mb-8">You need to be logged in to place an order. Would you like to go to the login page?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={() => navigate('/login', { state: { from: '/cart' } })} className="flex-1 py-4 bg-[#003B6A] text-white rounded-2xl font-bold hover:bg-blue-800 transition">Login Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;