import React, { useState } from "react";
import { 
  MapPin, Phone, Clock, Send, Store, 
  CheckCircle2, AlertCircle, Loader2 
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

// ✅ Import your service center images here
import storeImg1 from "../../assets/gallery/home/DSC_2179.JPG";
import storeImg2 from "../../assets/gallery/home/DSC_2175.JPG";
import storeImg3 from "../../assets/gallery/home/DSC_2183.JPG";
import heroBg from "../../assets/gallery/about/IMG_2454.jpeg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: "error", msg: "Please fill in all required fields." });
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/contact", formData);
      setStatus({ type: "success", msg: "Thank you! We'll get back to you soon." });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setStatus({ type: "error", msg: "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const storePhotos = [
    { url: storeImg1 },
    { url: storeImg2 },
    { url: storeImg3 }
  ];

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* --- Full Page Fixed Background --- */}
      <div 
        className="fixed inset-0 z-0 bg-no-repeat bg-fixed bg-top"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundSize: '100% auto' 
        }}
      />

      {/* --- Main Content Layer --- */}
      <div className="relative z-10">
        
        {/* Transparent Hero Spacer - Reveal VIP Bazar sign */}
        <div className="h-[450px] flex flex-col items-center justify-start pt-24 text-center px-4">
          {/* Enhanced Blur Background for Heading */}
          <div className="bg-white/50 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/40 ring-1 ring-black/5">
            <h1 className="text-3xl md:text-5xl font-black mb-3 text-[#003B6A] tracking-tight">
              Contact Us
            </h1>
            <p className="text-gray-800 text-lg font-extrabold max-w-lg mx-auto">
              Visit our service center near Vip, 419, near Simla Briyani, Hastings Colony, VIP Nagar, Kolkata
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-32 pb-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/20">
            
            {/* Map Section */}
            <div className="w-full h-80 bg-gray-200">
              <iframe
                title="Bike Service Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3685.449143324255!2d88.39430527578773!3d22.524841879525813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02776f79b15c4f%3A0xca559d9676e7017d!2sMaa%20Tara%20Two%20wheeler%20services%20center!5e0!3m2!1sen!2sin!4v1769698579207!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* --- Left Side: Contact Info --- */}
              <div className="md:w-5/12 bg-gray-50/80 p-10 flex flex-col border-r border-gray-100">
                <h3 className="text-2xl font-bold text-[#003B6A] mb-8">Get In Touch</h3>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="bg-blue-100 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-[#003B6A]" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Address</h4>
                      <p className="text-gray-600 text-sm mt-1">Vip, 419, near Simla Briyani, Hastings Colony, VIP Nagar, <br />Kolkata, West Bengal 700100</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-green-100 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                      <Phone className="text-green-700" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Phone</h4>
                      <p className="text-gray-600 text-sm mt-1">+91 8240429417</p>
                     
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-orange-100 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                      <Clock className="text-orange-700" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Working Hours</h4>
                      <p className="text-gray-600 text-sm mt-1">Mon - Sun: 10:00 AM - 8:00 PM</p>
                      <p className="text-green-500 text-sm font-semibold">Break Time: 1:30 PM - 2:30 PM</p>
                      <p className="text-red-500 text-sm font-semibold">Tuesday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Right Side: Contact Form --- */}
              <div className="md:w-7/12 p-10 bg-white">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
                
                {status.msg && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
                    <span className="font-medium text-sm">{status.msg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Name</label>
                      <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003B6A] outline-none transition-all bg-gray-50/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Phone</label>
                      <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003B6A] outline-none transition-all bg-gray-50/50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Your Email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003B6A] outline-none transition-all bg-gray-50/50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Message</label>
                    <textarea name="message" rows="4" value={formData.message} onChange={handleChange} placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003B6A] outline-none transition-all bg-gray-50/50 resize-none"></textarea>
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#003B6A] hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ✅ Service Center Photos Section */}
          <div className="mt-16 bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-white">
            <div className="flex items-center gap-3 mb-8">
              <Store className="text-[#003B6A]" size={28} />
              <h2 className="text-3xl font-black text-gray-800">Visit Our Center</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {storePhotos.map((photo, idx) => (
                <div key={idx} className="group relative h-64 overflow-hidden rounded-[2rem] shadow-lg border-4 border-white">
                  <img 
                    src={photo.url} 
                    alt="Service Center" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-gray-800 text-sm mt-8 italic font-bold">
              Providing premium <span className="text-red-600 font-extrabold">BOSCH</span> certified two-wheeler care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;