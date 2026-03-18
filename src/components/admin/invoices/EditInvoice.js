import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { Plus, Trash2, Save, FileText, User, Bike, Mail, AlertTriangle, CheckCircle } from "lucide-react";

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    customerName: "", 
    phoneNumber: "", 
    email: "", 
    address: "", 
    bikeModel: "", 
    bikeNumber: "",
    invoiceDate: "",
    dueDate: "", 
    notes: "",
    status: "Unpaid" // ✅ এডিটের জন্য স্ট্যাটাস
  });

  const [items, setItems] = useState([]);
  const [labourCharge, setLabourCharge] = useState(0);
  const [suggestions, setSuggestions] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  // ডাটাবেস থেকে ইনভয়েসের ডাটা নিয়ে আসা
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axiosInstance.get(`/invoices/${id}`);
        const data = res.data;
        
        setCustomer({
          customerName: data.customerName || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          address: data.address || "",
          bikeModel: data.bikeModel || "",
          bikeNumber: data.bikeNumber || "",
          invoiceDate: data.invoiceDate || "",
          dueDate: data.dueDate || "",
          notes: data.notes || "",
          status: data.status || "Unpaid"
        });

        // Items গুলো সেট করা
        if (data.items && data.items.length > 0) {
          setItems(data.items.map((item, index) => ({
            id: Date.now() + index, 
            description: item.description || "", 
            quantity: item.quantity || 1, 
            price: item.price || 0, 
            partId: item.partId || null
          })));
        }

        setLabourCharge(data.labourCharge || 0);
      } catch (err) {
        console.error("Fetch Error:", err);
        showStatusPopup("Failed to load invoice details.", true);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  // ক্যালকুলেশন
  const subTotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const taxAmount = subTotal * 0.18;
  const grandTotal = subTotal + taxAmount + Number(labourCharge);

  const handleCustomerChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });

  // আইটেম আপডেট এবং পার্টস সার্চ লজিক
  const handleItemChange = async (itemId, field, value) => {
    const newItems = items.map(item => item.id === itemId ? { ...item, [field]: value } : item);
    setItems(newItems);

    if (field === "description" && value.length > 1) {
      try {
        const res = await axiosInstance.get(`/parts/search?query=${value}`);
        setSuggestions({ ...suggestions, [itemId]: res.data });
      } catch (err) { console.error("Search Error:", err); }
    } else {
      setSuggestions({ ...suggestions, [itemId]: [] });
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
  const removeItem = (itemId) => items.length > 1 && setItems(items.filter(item => item.id !== itemId));

  // এডিট করে সেভ করা
  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
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
        grandTotal
      };

      await axiosInstance.put(`/invoices/${id}`, payload);
      showStatusPopup("Invoice Updated Successfully!", false);
      setTimeout(() => navigate("/admin/invoices/list"), 2000);
    } catch (err) { 
      console.error(err);
      showStatusPopup("Error updating invoice", true); 
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Invoice Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8 flex justify-center">
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold text-sm">{statusPopup.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        
        <div className="bg-[#1e5aa0] p-6 text-white flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg"><img src="/logo2.jpg" alt="Logo" className="h-10 w-auto" /></div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">BOSCH - Maatara</h1>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Service Excellence</p>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-blue-50/50 border-b flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1e5aa0]" />
            <h2 className="text-lg font-bold text-gray-700">Edit Invoice</h2>
        </div>

        <form onSubmit={handleUpdateInvoice} className="p-4 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2"><User size={18} className="text-[#1e5aa0]"/> Customer Information</h3>
              <input type="text" name="customerName" value={customer.customerName} placeholder="Customer Name *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              <input type="tel" name="phoneNumber" value={customer.phoneNumber} placeholder="Phone Number *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="email" name="email" value={customer.email} placeholder="Customer Email" onChange={handleCustomerChange} className="w-full border p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              </div>
              <textarea name="address" value={customer.address} placeholder="Customer Address" onChange={handleCustomerChange} rows="2" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2"><Bike size={18} className="text-[#1e5aa0]"/> Vehicle & Status Details</h3>
              <input type="text" name="bikeModel" value={customer.bikeModel} placeholder="Bike Model *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
              <input type="text" name="bikeNumber" value={customer.bikeNumber} placeholder="Bike Registration No *" required onChange={handleCustomerChange} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1e5aa0]" />
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
              
              {/* ✅ Status Dropdown */}
              <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Invoice Status</label>
                  <select name="status" value={customer.status} onChange={handleCustomerChange} className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1e5aa0] font-bold bg-white cursor-pointer text-gray-700">
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Completed">Completed</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
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
                  <div className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 transition hover:bg-white hover:shadow-md">
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
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Internal Notes / Warranty Info:</label>
              <textarea name="notes" value={customer.notes} placeholder="Add warranty details..." onChange={handleCustomerChange} rows="4" className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1e5aa0] text-sm" />
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
               <Save size={24} /> Save Changes
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInvoice;