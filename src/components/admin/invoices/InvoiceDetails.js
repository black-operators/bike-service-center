import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { ArrowLeft, Printer, Download, Mail, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import html2pdf from "html2pdf.js";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [statusPopup, setStatusPopup] = useState({ show: false, message: "", isError: false });
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

  const showStatusPopup = (message, isError) => {
    setStatusPopup({ show: true, message, isError });
    setTimeout(() => setStatusPopup({ show: false, message: "", isError: false }), 3000);
  };

  const handlePrint = () => window.print();

  // 📧 ✅ ফ্রন্টএন্ড থেকে PDF তৈরি করে ব্যাকএন্ডে ইমেইল করার লজিক
  const handleSendEmail = async () => {
    if (!invoice.email) {
      showStatusPopup("No email address found for this customer!", true);
      return;
    }
    
    setSendingEmail(true);
    const element = invoiceRef.current;
    element.classList.add("generating-pdf");

    const opt = {
      margin: 0,
      filename: `Invoice_${invoice.invoiceId}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // PDF টা ডাউনলোড না করে, ডেটা হিসেবে (Base64) নেওয়া হলো
      const pdfBase64 = await html2pdf().set(opt).from(element).output('datauristring');
      element.classList.remove("generating-pdf");

      // API এর মাধ্যমে ব্যাকএন্ডে পাঠানো
      await axiosInstance.post(`/invoices/${invoice._id}/send-email`, {
        email: invoice.email,
        customerName: invoice.customerName,
        invoiceId: invoice.invoiceId,
        pdfBase64: pdfBase64
      });

      setEmailSent(true);
      showStatusPopup("Email sent successfully!", false);
      setTimeout(() => setEmailSent(false), 5000); // ৫ সেকেন্ড পর সাকসেস মেসেজ গায়েব হয়ে যাবে
    } catch (err) {
      console.error("Email Sending Error:", err);
      showStatusPopup("Failed to send email. Please try again.", true);
      element.classList.remove("generating-pdf");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    element.classList.add("generating-pdf");
    const opt = {
      margin: 0, filename: `Invoice_${invoice.invoiceId}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove("generating-pdf");
    }).catch(err => {
      console.error(err); element.classList.remove("generating-pdf");
    });
  };

  if (!invoice) return <div className="p-20 text-center font-black uppercase text-gray-400">Loading Bill...</div>;

  return (
    <div className="min-h-screen bg-gray-200 p-2 md:p-10 flex flex-col items-center overflow-x-hidden print:bg-white print:p-0 print:m-0 print:w-full print:h-0 print:min-h-0 print:overflow-hidden">
      
      {/* STATUS POPUP */}
      {statusPopup.show && (
        <div className="fixed top-20 right-5 z-[1001] animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 ${statusPopup.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {statusPopup.isError ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold">{statusPopup.message}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-[800px] flex flex-col sm:flex-row justify-between gap-3 mb-4 print:hidden px-2 sm:px-4">
        <button onClick={() => navigate(-1)} className="font-bold flex items-center gap-2 hover:text-[#1e5aa0] transition uppercase text-[10px] tracking-widest"><ArrowLeft size={14}/> Back</button>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
          {/* ✅ নতুন Email Button */}
          {invoice.email && (
            <button 
              onClick={handleSendEmail} 
              disabled={sendingEmail}
              className={`${emailSent ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'} text-white px-3 sm:px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition uppercase text-[10px] tracking-widest disabled:opacity-70`}
            >
              {sendingEmail ? <Loader2 size={16} className="animate-spin" /> : (emailSent ? <CheckCircle size={16} /> : <Mail size={16} />)}
              <span className="hidden sm:inline">{sendingEmail ? 'Sending...' : (emailSent ? 'Sent!' : 'Email to Customer')}</span>
              <span className="sm:hidden">{sendingEmail ? '...' : (emailSent ? 'Sent' : 'Email')}</span>
            </button>
          )}

          <button onClick={handleDownloadPDF} className="bg-green-600 text-white px-3 sm:px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 transition uppercase text-[10px] tracking-widest"><Download size={16} /> <span className="hidden sm:inline">Download</span></button>
          <button onClick={handlePrint} className="bg-[#1e5aa0] text-white px-4 sm:px-8 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-800 transition uppercase text-[10px] tracking-widest"><Printer size={16}/> Print</button>
        </div>
      </div>

      {/* --- ইনভয়েস পেপার মূল বডি (আগের মতোই থাকবে) --- */}
      <div 
        ref={invoiceRef} 
        id="invoice-paper" 
        className="bg-white w-full max-w-[794px] flex flex-col font-sans print:shadow-none overflow-hidden print:max-w-full print:w-full print:m-0 print:p-0 print:absolute print:top-0 print:left-0" 
        style={{ background: "white", margin: "0 auto", padding: "0" }}
      >
        
        <div className="bg-[#1e5aa0] text-white p-10 flex justify-between items-start print:p-6 print:py-3" 
             style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", boxShadow: "0 2px 0 #1e5aa0", zIndex: 30, position: "relative" }}>
          <div>
            <img src="/logo2.jpg" alt="Logo" className="w-28 h-auto mb-4 rounded print:w-20 print:mb-2" />
            <h2 className="text-5xl font-black tracking-tighter leading-none uppercase print:text-4xl">INVOICE</h2>
            <p className="text-base font-bold tracking-[0.4em] uppercase opacity-80 mt-2 print:text-xs print:mt-1">Original Receipt</p>
          </div>
          <div className="text-right space-y-1">
            <h3 className="text-lg font-black uppercase print:text-sm">Maa Tara Two Wheeler Services</h3>
            <p className="text-[15px] opacity-90 font-bold tracking-tight print:text-[8px]">Vip, 419, near Simla Briyani, Hastings Colony, VIP Nagar, Kolkata, West Bengal 700100</p>
            <p className="text-[15px] opacity-90 font-bold tracking-tight print:text-[8px]">+91 8240429417</p>
          </div>
        </div>

        <div className="p-10 flex justify-between border-b-2 border-gray-100 bg-white relative z-20 print:p-5 print:py-2 print:flex-row" 
             style={{ marginTop: "-2px", borderTop: "none" }}>
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

        <div className="px-10 py-4 flex-grow bg-white relative z-10 print:px-5 print:py-2" style={{ minHeight: "200px" }}>
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

        <div className="grid grid-cols-5 mt-auto relative z-20 print:grid-cols-5" style={{ marginTop: "-2px" }}>
          <div className="col-span-3 bg-[#d3e4f3] p-10 print:p-3 print:col-span-3" 
               style={{ backgroundColor: "#d3e4f3 !important", boxShadow: "0 -2px 0 #d3e4f3, 0 2px 0 #d3e4f3" }}>
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
          <div className="col-span-2 bg-[#1e5aa0] p-10 text-white flex flex-col justify-center items-end print:p-3 print:col-span-2" 
               style={{ backgroundColor: "#1e5aa0 !important", boxShadow: "0 -2px 0 #1e5aa0, 0 2px 0 #1e5aa0" }}>
            <span className="text-[10px] font-black uppercase opacity-70 mb-4 tracking-[0.4em] print:mb-1 print:text-[8px]">GRAND TOTAL</span>
            <div className="flex items-start">
              <span className="text-3xl font-black mt-1 mr-3 opacity-80 print:text-2xl">₹</span>
              <h2 className="text-7xl font-black tracking-tighter leading-none print:text-5xl">{invoice.grandTotal?.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        <div className="p-12 text-center bg-[#d3e4f3] relative z-30 print:p-3 print:py-2" 
             style={{ backgroundColor: "#d3e4f3 !important", marginTop: "-2px", boxShadow: "0 -2px 0 #d3e4f3" }}>
          <h3 className="text-xl font-black text-[#1e5aa0] uppercase tracking-tighter leading-none mb-4 print:mb-2 print:text-sm">THANK YOU FOR CHOOSING BOSCH-MAATARA!</h3>
          <div className="h-1.5 w-24 bg-[#1e5aa0] mx-auto mb-4 rounded-full print:h-1 print:w-16 print:mb-2 mt-2 print:mt-1"></div>
          <p className="text-gray-500 font-black text-[8px] tracking-[0.4em] uppercase opacity-70 print:text-[6px]">Official Service Partner • Bosch Automotive</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0mm; }
          html, body { 
            margin: 0 !important; padding: 0 !important; background: white !important; 
            width: 210mm !important; height: 296mm !important; overflow: hidden !important; 
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
          nav, aside, header, footer, button, .print\\:hidden { display: none !important; visibility: hidden !important; height: 0 !important; }
          #invoice-paper {
            width: 210mm !important; height: 295mm !important; margin: 0 !important; padding: 0 !important;
            transform: none !important; transform-origin: top center !important; box-shadow: none !important; border: none !important;
            position: absolute !important; top: 0 !important; left: 0 !important; overflow: hidden !important; 
          }
        }
        #invoice-paper.generating-pdf { width: 794px !important; height: 1100px !important; overflow: hidden !important; position: relative !important; }
        #invoice-paper.generating-pdf > div:nth-child(1) { padding: 4px 10px !important; }
        #invoice-paper.generating-pdf > div:nth-child(1) img { width: 60px !important; height: auto !important; margin-bottom: 2px !important; }
        #invoice-paper.generating-pdf > div:nth-child(1) h2 { font-size: 32px !important; }
        #invoice-paper.generating-pdf > div:nth-child(1) p { font-size: 10px !important; margin-top: 2px !important; }
        #invoice-paper.generating-pdf > div:nth-child(2) { padding: 5px 10px !important; }
        #invoice-paper.generating-pdf > div:nth-child(2) h2 { font-size: 20px !important; }
        #invoice-paper.generating-pdf > div:nth-child(2) .text-base { font-size: 14px !important; }
        #invoice-paper.generating-pdf > div:nth-child(3) { padding: 5px 10px !important; min-height: 140px !important; }
        #invoice-paper.generating-pdf > div:nth-child(3) th, #invoice-paper.generating-pdf > div:nth-child(3) td { padding: 4px 2px !important; font-size: 10px !important; }
        #invoice-paper.generating-pdf > div:nth-child(4) > div { padding: 5px 10px !important; }
        #invoice-paper.generating-pdf > div:nth-child(4) .text-7xl { font-size: 40px !important; }
        #invoice-paper.generating-pdf > div:nth-child(5) { padding: 4px 10px !important; }
        #invoice-paper.generating-pdf > div:nth-child(5) h3 { font-size: 14px !important; margin-bottom: 12px !important; }
      `}</style>
    </div>
  );
};

export default InvoiceDetails;