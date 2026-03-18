import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { FileText, Eye, Calendar, IndianRupee, Clock } from "lucide-react";

const InvoiceList = () => {
  const [myInvoices, setMyInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axiosInstance.get("/invoices/my-invoices");
        setMyInvoices(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Verified") return "bg-blue-100 text-blue-700";
    if (status === "Completed") return "bg-green-100 text-green-700";
    return "bg-orange-100 text-orange-700";
  };

  if (loading) return <div className="p-10 text-center font-bold">LOADING BILLS...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border min-h-[400px]">
      <h2 className="text-2xl font-bold text-[#003B6A] mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-orange-500" /> My Service History & Bills
      </h2>

      {myInvoices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {myInvoices.map((inv) => (
            <div key={inv._id} className="border p-5 rounded-xl hover:shadow-md transition bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800 uppercase">{inv.bikeModel}</h3>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusStyle(inv.status)}`}>
                  {inv.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2"><Calendar size={14}/> {inv.invoiceDate}</div>
                <div className="flex items-center gap-2 font-black text-[#003B6A]"><IndianRupee size={14}/> ₹ {inv.grandTotal.toLocaleString()}</div>
              </div>
              
              {/* ✅ অ্যাডমিন রুটের বদলে ইউজারের নিজস্ব রুট দেওয়া হলো */}
              <Link to={`/my-invoices/view/${inv._id}`}>
                <button className="w-full py-2 bg-white border border-[#003B6A] text-[#003B6A] rounded-lg font-bold hover:bg-[#003B6A] hover:text-white transition flex justify-center items-center gap-2">
                  <Eye size={16} /> View Bill
                </button>
              </Link>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No service invoices found.</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;