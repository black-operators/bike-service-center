import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { 
  Plus, Trash2, Save, User, Bike, Mail, 
  Loader2, AlertCircle, CheckCircle2, HelpCircle 
} from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    customerName: "", 
    phoneNumber: "", 
    email: "", 
    address: "", 
    bikeModel: "", 
    bikeNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0], 
    notes: ""
  });

  const [items, setItems] = useState([{ id: 1, description: "", quantity: 1, price: 0, partId: null }]);
  const [labourCharge, setLabourCharge] = useState(0);
  const [suggestions, setSuggestions] = useState({}); 
  const [submitting, setSubmitting] = useState(false);

  // ✅ Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalStatus, setModalStatus] = useState({ open: false, type: "", msg: "" });

  const subTotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const taxAmount = subTotal * 0.18;
  const grandTotal = subTotal + taxAmount + Number(labourCharge);

  const handleCustomerChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });

  const handleItemChange = async (id, field, value) => {
    const newItems = items.map(item => item.id === id ? { ...item, [field]: value } : item);
    setItems(newItems);

    if (field === "description" && value.length > 1) {
      try {
        const res = await axiosInstance.get(`/parts/search?query=${value}`);
        setSuggestions({ ...suggestions, [id]: res.data });
      } catch (err) { console.error("Search Error:", err); }
    } else {
      setSuggestions({ ...suggestions, [id]: [] });
    }
  };

  const selectPart = (itemId, part) => {
    const newItems = items.map(item => 
      item.id === itemId 
      ? { ...item, description: part.name, price: part.price, partId: part._id } 
      : item
    );
    setItems(newItems);
    setSuggestions({ ...suggestions, [itemId]: [] });
  };

  const addItem = () => setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0, partId: null }]);
  const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleFinalSave = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const payload = {
        ...customer,
        items: items.map(i => ({ 
          description: i.description,
          quantity: Number(i.quantity),
          price: Number(i.price),
          amount: Number(i.price) * Number(i.quantity),
          partId: i.partId 
        })),
        subTotal, 
        taxAmount, 
        labourCharge: Number(labourCharge) || 0, 
        grandTotal, 
        status: "Unpaid"
      };

      await axiosInstance.post("/invoices", payload);
      setModalStatus({ open: true, type: "success", msg: "Invoice generated and linked successfully!" });
    } catch (err) { 
      console.error(err);
      setModalStatus({ open: true, type: "error", msg: err.response?.data?.message || "Error saving invoice. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModalStatus({ ...modalStatus, open: false });
    if (modalStatus.type === "success") {
      navigate("/admin/invoices/list");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8 flex justify-center">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        
        <div className="bg-[#1e5aa0] p-6 text-white flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg"><img src="/logo2.jpg" alt="Logo" className="h-10 w-auto" /></div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">BOSCH - Maatara</h1>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Service Excellence</p>
          </div>
        </div>

        <form onSubmit={handlePreSubmit} className="p-4 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2"><User size={18} className="text-[#1e5aa0]"/> Customer Information</h3>
              <input type="text" name="customerName" placeholder="Customer Name *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              <input type="tel" name="phoneNumber" placeholder="Phone Number *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="email" name="email" placeholder="Customer Email (for user linking)" onChange={handleCustomerChange} className="w-full border p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              </div>
              <textarea name="address" placeholder="Customer Address" onChange={handleCustomerChange} rows="2" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2"><Bike size={18} className="text-[#1e5aa0]"/> Vehicle Details</h3>
              <input type="text" name="bikeModel" placeholder="Bike Model *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              <input type="text" name="bikeNumber" placeholder="Bike Registration No *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Invoice Date</label>
                  <input type="date" name="invoiceDate" value={customer.invoiceDate} onChange={handleCustomerChange} className="w-full border p-2.5 rounded-lg text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                  <input type="date" name="dueDate" value={customer.dueDate} onChange={handleCustomerChange} className="w-full border p-2.5 rounded-lg text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Billing Items / Spare Parts</h3>
              <button type="button" onClick={addItem} className="bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-green-200 transition font-bold text-xs uppercase tracking-wider">
                <Plus size={14} /> Add Line Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="relative group">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 transition hover:bg-white hover:shadow-md">
                    {/* Mobile Layout */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-bold text-xs">Item {index + 1}</span>
                        <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={18} /></button>
                      </div>
                      <div className="relative">
                        <input type="text" placeholder="Type Part Name..." value={item.description} onChange={(e) => handleItemChange(item.id, "description", e.target.value)} required className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0] text-sm" />
                        {suggestions[item.id] && suggestions[item.id].length > 0 && (
                          <div className="absolute left-0 right-0 top-14 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
                            {suggestions[item.id].map(p => (
                              <div key={p._id} onClick={() => selectPart(item.id, p)} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                                <div>
                                  <span className="font-bold text-sm text-gray-700">{p.name}</span>
                                  <span className="text-[10px] text-gray-400 ml-2 uppercase">Stock: {p.stock}</span>
                                </div>
                                <span className="font-black text-xs text-green-600">₹{p.price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Quantity</label>
                          <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)} required className="w-full border p-3 rounded-lg text-center text-sm outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Price (₹)</label>
                          <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, "price", e.target.value)} required className="w-full border p-3 rounded-lg text-right text-sm outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-700 text-sm bg-white px-3 py-1.5 rounded-lg border">Total: ₹ {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex gap-3 items-center">
                      <span className="text-gray-400 font-bold w-4 text-xs">{index + 1}.</span>
                      <div className="flex-grow relative">
                        <input type="text" placeholder="Type Part Name..." value={item.description} onChange={(e) => handleItemChange(item.id, "description", e.target.value)} required className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0] text-sm" />
                        {suggestions[item.id] && suggestions[item.id].length > 0 && (
                          <div className="absolute left-0 right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
                            {suggestions[item.id].map(p => (
                              <div key={p._id} onClick={() => selectPart(item.id, p)} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-none">
                                <div>
                                  <span className="font-bold text-sm text-gray-700">{p.name}</span>
                                  <span className="text-[10px] text-gray-400 ml-2 uppercase">Stock: {p.stock}</span>
                                </div>
                                <span className="font-black text-xs text-green-600">₹{p.price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)} required className="w-16 border p-2.5 rounded-lg text-center text-sm outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
                      <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, "price", e.target.value)} required className="w-24 border p-2.5 rounded-lg text-right text-sm outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
                      <span className="w-20 text-right font-bold text-gray-700 text-sm">₹ {(item.price * item.quantity).toLocaleString()}</span>
                      <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Internal Notes / Warranty Info:</label>
              <textarea name="notes" placeholder="Add warranty details..." onChange={handleCustomerChange} rows="4" className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1e5aa0] text-sm" />
            </div>
            <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-100 space-y-3 shadow-inner">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal:</span><span className="font-bold">₹ {subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-3"><span>GST (18%):</span><span className="font-bold">₹ {taxAmount.toLocaleString()}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-bold text-[#1e5aa0]">Labour Charge:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">₹</span>
                  <input type="number" value={labourCharge} onChange={(e) => setLabourCharge(e.target.value)} placeholder="0" className="w-24 border-none bg-blue-50 p-1.5 text-right font-black text-[#1e5aa0] rounded-lg outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-xl font-black text-gray-800 tracking-tight uppercase">Grand Total:</span>
                <span className="text-4xl font-black text-[#1e5aa0] tracking-tighter">₹ {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
             <button type="submit" className="bg-orange-500 text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-orange-600 transition flex items-center gap-3 active:scale-95 uppercase tracking-wider">
               <Save size={24} /> Save & Generate Bill
             </button>
          </div>
        </form>
      </div>

      {/* ✅ YES/NO CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={32} className="text-[#1e5aa0]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Finalize Invoice?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to generate this bill for <span className="font-bold text-gray-900">{customer.customerName}</span>? Total amount: <span className="font-bold text-[#1e5aa0]">₹{grandTotal.toLocaleString()}</span>
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                No, Review
              </button>
              <button 
                onClick={handleFinalSave} 
                disabled={submitting}
                className="flex-1 py-4 rounded-2xl font-bold bg-[#1e5aa0] text-white hover:bg-blue-800 shadow-lg transition flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SUCCESS / ERROR STATUS MODAL */}
      {modalStatus.open && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-10 shadow-2xl text-center animate-in zoom-in duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${modalStatus.type === "success" ? "bg-emerald-50" : "bg-rose-50"}`}>
              {modalStatus.type === "success" ? (
                <CheckCircle2 size={48} className="text-emerald-600" />
              ) : (
                <AlertCircle size={48} className="text-rose-600" />
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">
              {modalStatus.type === "success" ? "Done!" : "Error!"}
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
    </div>
  );
};

export default CreateInvoice;