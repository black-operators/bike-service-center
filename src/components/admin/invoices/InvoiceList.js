import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { 
  Eye, Trash2, Plus, Wrench, ShoppingBag, Edit, 
  Loader2, AlertCircle, CheckCircle2, HelpCircle 
} from "lucide-react";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services"); 
  const [showRedDot, setShowRedDot] = useState(false);

  // ✅ Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalStatus, setModalStatus] = useState({ open: false, type: "", msg: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axiosInstance.get("/invoices");
      setInvoices(res.data);
      
      const partsOrders = res.data.filter(inv => inv.bikeModel === "Parts Order");
      const seenCount = parseInt(localStorage.getItem("seenPartsCount") || "0");
      
      if (partsOrders.length > seenCount) {
        setShowRedDot(true);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "parts") {
      const partsOrders = invoices.filter(inv => inv.bikeModel === "Parts Order");
      localStorage.setItem("seenPartsCount", partsOrders.length.toString());
      setShowRedDot(false);
    }
  };

  // ✅ Trigger Delete Confirmation Modal
  const triggerDeleteConfirm = (id) => {
    setPendingDeleteId(id);
    setShowConfirm(true);
  };

  const handleFinalDelete = async () => {
    setShowConfirm(false);
    try {
      await axiosInstance.delete(`/invoices/${pendingDeleteId}`);
      const updatedInvoices = invoices.filter((inv) => inv._id !== pendingDeleteId);
      setInvoices(updatedInvoices);
      
      if (activeTab === "parts") {
         const partsOrders = updatedInvoices.filter(inv => inv.bikeModel === "Parts Order");
         localStorage.setItem("seenPartsCount", partsOrders.length.toString());
      }
      setModalStatus({ open: true, type: "success", msg: "Invoice deleted successfully!" });
    } catch (err) {
      console.error("Error deleting invoice:", err);
      setModalStatus({ open: true, type: "error", msg: "Failed to delete invoice. Please try again." });
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/invoices/${id}/status`, { status: newStatus });
      setInvoices(invoices.map(inv => inv._id === id ? { ...inv, status: newStatus } : inv));
      setModalStatus({ open: true, type: "success", msg: `Status updated to ${newStatus}` });
    } catch (err) {
      console.error("Error updating status:", err);
      setModalStatus({ open: true, type: "error", msg: "Failed to update status" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid": case "Completed": case "Verified": return "text-green-600 bg-green-50 font-bold border-green-200";
      case "Pending": return "text-orange-600 bg-orange-50 font-bold border-orange-200";
      case "Cancelled": return "text-red-600 bg-red-50 font-bold border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-gray-100">
      <Loader2 className="animate-spin text-[#003B6A] mb-4" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Invoices...</p>
    </div>
  );

  const serviceInvoices = invoices.filter(inv => inv.bikeModel !== "Parts Order");
  const partsInvoices = invoices.filter(inv => inv.bikeModel === "Parts Order");
  const displayData = activeTab === "services" ? serviceInvoices : partsInvoices;

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px] relative">
      
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex bg-gray-100 p-1.5 rounded-xl overflow-x-auto w-full">
          <button 
            onClick={() => handleTabSwitch("services")} 
            className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 font-bold rounded-lg transition whitespace-nowrap ${activeTab === "services" ? "bg-white text-[#003B6A] shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            <Wrench size={18} /> <span className="hidden sm:inline">Service</span> Bills
          </button>
          
          <button 
            onClick={() => handleTabSwitch("parts")} 
            className={`relative flex items-center gap-2 px-3 sm:px-5 py-2.5 font-bold rounded-lg transition whitespace-nowrap ${activeTab === "parts" ? "bg-white text-[#003B6A] shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            <ShoppingBag size={18} /> <span className="hidden sm:inline">Parts</span> Orders
            {showRedDot && (
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>

        <Link to="/admin/invoices/create" className="w-full sm:w-auto">
          <button className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
            <Plus size={18} /> Generate New Bill
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#003B6A] text-white text-sm">
              <th className="p-4 font-bold">Invoice ID</th>
              <th className="p-4 font-bold">Customer</th>
              <th className="p-4 font-bold">Vehicle / Type</th>
              <th className="p-4 font-bold">Amount</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((invoice) => (
                <tr key={invoice._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 text-sm font-bold text-blue-600">{invoice.invoiceId}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{invoice.customerName}</div>
                    <div className="text-xs text-gray-400">{invoice.phoneNumber}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={invoice.bikeModel === "Parts Order" ? "bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold text-xs" : ""}>
                      {invoice.bikeModel}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-black text-gray-800">₹ {invoice.grandTotal?.toLocaleString()}</td>
                  
                  <td className="p-4">
                    <select 
                      value={invoice.status || "Unpaid"} 
                      onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                      className={`border p-1.5 rounded-lg text-xs outline-none cursor-pointer ${getStatusColor(invoice.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Completed">Completed</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="p-4 flex items-center justify-center gap-3">
                    <Link to={`/admin/invoices/view/${invoice._id}`}>
                      <button title="View Bill" className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition"><Eye size={18} /></button>
                    </Link>

                    <Link to={`/admin/invoices/edit/${invoice._id}`}>
                      <button title="Edit Bill" className="text-green-500 hover:bg-green-50 p-2 rounded-full transition"><Edit size={18} /></button>
                    </Link>

                    <button 
                      title="Delete Bill" 
                      onClick={() => triggerDeleteConfirm(invoice._id)} 
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">
                  No {activeTab === "services" ? "service bills" : "parts orders"} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ YES/NO CONFIRMATION MODAL (RED THEME) */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Delete Invoice?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              This action is permanent and cannot be undone. Are you sure you want to delete this record?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                Cancel
              </button>
              <button 
                onClick={handleFinalDelete} 
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

export default InvoiceList;