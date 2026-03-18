import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { ArrowLeft, Printer, Download } from "lucide-react";
import html2pdf from "html2pdf.js";

const UserInvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axiosInstance.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) { console.error(err); }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    element.classList.add("generating-pdf");

    const opt = {
      margin: 0,
      filename: `Invoice_${invoice.invoiceId}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove("generating-pdf");
    });
  };

  if (!invoice) return <div className="p-20 text-center font-black uppercase text-gray-400">Loading Bill...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 flex flex-col items-center">
      
      {/* অ্যাকশন বাটন */}
      <div className="w-full max-w-[800px] flex justify-between mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="font-bold flex items-center gap-2 text-gray-600 hover:text-[#1e5aa0] transition uppercase text-[12px] tracking-widest">
          <ArrowLeft size={16}/> Back
        </button>
        <div className="flex gap-3">
          <button onClick={handleDownloadPDF} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 transition uppercase text-[10px] tracking-widest"><Download size={16} /> Download</button>
          <button onClick={handlePrint} className="bg-[#1e5aa0] text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-800 transition uppercase text-[10px] tracking-widest"><Printer size={16}/> Print</button>
        </div>
      </div>

      {/* ইনভয়েস পেপার বডি */}
      <div ref={invoiceRef} className="bg-white w-full max-w-[794px] flex flex-col font-sans shadow-xl print:shadow-none overflow-hidden" style={{ background: "white", margin: "0 auto", padding: "0" }}>
        
        {/* Header */}
        <div className="bg-[#1e5aa0] text-white p-10 flex justify-between items-start print:p-6" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          <div>
            <img src="/logo2.jpg" alt="Logo" className="w-28 h-auto mb-4 rounded print:w-20 print:mb-2" />
            <h2 className="text-5xl font-black tracking-tighter leading-none uppercase print:text-4xl">INVOICE</h2>
            <p className="text-base font-bold tracking-[0.4em] uppercase opacity-80 mt-2 print:text-xs print:mt-1">Original Receipt</p>
          </div>
          <div className="text-right space-y-1">
            <h3 className="text-lg font-black uppercase print:text-sm">BOSCH - Maatara</h3>
            <p className="text-[10px] opacity-90 font-bold tracking-tight print:text-[8px]">Vip, 419, near Simla Briyani, Hastings Colony, VIP Nagar, Kolkata, West Bengal 700100</p>
            <p className="text-[10px] opacity-90 font-bold tracking-tight print:text-[8px]">+91 98314 81579</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-10 flex justify-between border-b-2 border-gray-100 bg-white print:p-5">
          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">BILL TO:</h4>
            <h2 className="text-3xl font-black uppercase text-gray-900 leading-none mb-1 print:text-2xl">{invoice.customerName}</h2>
            <p className="text-gray-700 font-bold text-base print:text-sm">{invoice.phoneNumber}</p>
            <p className="text-gray-500 font-bold text-[11px] w-64 leading-tight print:text-[9px]">{invoice.address}</p>
          </div>
          <div className="text-right flex flex-col justify-end space-y-4 print:space-y-2">
            <div className="text-right border-b-2 border-gray-50 pb-1 w-48 print:w-40"><span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block">INVOICE #</span><span className="text-sm font-black text-gray-900 uppercase print:text-xs">{invoice.invoiceId}</span></div>
            <div className="text-right w-48 print:w-40"><span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block">DATE</span><span className="text-sm font-black text-gray-900 print:text-xs">{invoice.invoiceDate}</span></div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-10 py-4 flex-grow bg-white print:px-5 print:py-2" style={{ minHeight: "200px" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] border-b-2">
                <th className="py-4 print:py-2">ITEM</th><th className="py-4 print:py-2">DESCRIPTION</th><th className="py-4 print:py-2 text-center">QTY</th><th className="py-4 print:py-2 text-center">PRICE</th><th className="py-4 print:py-2 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold">
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-4 uppercase text-[9px] font-black text-gray-900 print:py-2">#{i+1}</td>
                  <td className="py-4 text-gray-600 font-black uppercase print:py-2">{item.description}</td>
                  <td className="py-4 text-center font-black text-gray-900 print:py-2">{item.quantity}</td>
                  <td className="py-4 text-center font-black text-gray-900 print:py-2">₹{item.price.toLocaleString()}</td>
                  <td className="py-4 text-right font-black text-gray-900 text-sm print:py-2">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-5 mt-auto print:grid-cols-5">
          <div className="col-span-3 bg-[#d3e4f3] p-10 print:p-3 print:col-span-3" style={{ backgroundColor: "#d3e4f3 !important", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
            <h4 className="text-[9px] font-black text-gray-500 uppercase mb-3 tracking-[0.3em]">REMARKS:</h4>
            <p className="text-sm italic font-bold text-[#1e5aa0] mb-6 leading-relaxed print:text-xs print:mb-2">{invoice.notes || "Thanks for your business!"}</p>
            <div className="text-[10px] grid grid-cols-2 gap-2 border-t border-blue-200 pt-4 font-black uppercase tracking-wider print:text-[8px] print:pt-2">
                <div className="text-gray-600 space-y-1"><p>Subtotal:</p><p>Tax (18%):</p><p className="text-[#1e5aa0]">Labour Charge:</p></div>
                <div className="text-right text-gray-800 space-y-1 pr-2">
                    <p>₹{invoice.subTotal?.toLocaleString()}</p>
                    <p>₹{invoice.taxAmount?.toLocaleString()}</p>
                    <p className="text-[#1e5aa0]">₹{invoice.labourCharge?.toLocaleString() || 0}</p>
                </div>
            </div>
          </div>
          <div className="col-span-2 bg-[#1e5aa0] p-10 text-white flex flex-col justify-center items-end print:p-3 print:col-span-2" style={{ backgroundColor: "#1e5aa0 !important", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
            <span className="text-[10px] font-black uppercase opacity-70 mb-4 tracking-[0.4em] print:mb-1 print:text-[8px]">GRAND TOTAL</span>
            <div className="flex items-start">
              <span className="text-3xl font-black mt-1 mr-3 opacity-80 print:text-2xl">₹</span>
              <h2 className="text-7xl font-black tracking-tighter leading-none print:text-5xl">{invoice.grandTotal?.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInvoiceDetails;