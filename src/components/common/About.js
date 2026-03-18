import React from "react";
import { 
  ShieldCheck, HeartHandshake, Zap, 
  Wrench, Droplets, BatteryCharging, ShoppingBag, 
  CheckCircle, Users, PlayCircle 
} from "lucide-react";

import ownerImg from "../../assets/gallery/about/owner.jpeg";
import teamImg from "../../assets/gallery/about/team.png";
// ✅ Replace this with your actual video path
import interviewVideo from "../../assets/gallery/about/bike_vid_v2.mp4";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      
      {/* --- Hero Section --- */}
      <div className="bg-[#003B6A] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400 opacity-10 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            About <span className="text-cyan-400">Us</span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg font-light">
            Your trusted partner in advanced bike care and maintenance technology.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
        
        {/* --- Our Story / Owner Section --- */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Owner</h2>
          <img
            src={ownerImg}
            alt="Owner"
            className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-gray-200 shadow-lg"
          />
          <p className="text-gray-600 text-lg leading-relaxed">
            Ravi Rajak is the proud owner of this bike maintenance service center, bringing over a decade of experience in the automotive industry. With a passion for bikes and a commitment to excellence, Mr. Rajak has built a reputation for providing great service and customer satisfaction.
          </p>
        </div>

        {/* ✅ UPDATED SECTION: Owner Interview Video --- */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <PlayCircle className="w-8 h-8 text-[#003B6A]" />
            <h2 className="text-3xl font-bold text-gray-900 text-center">Meet the Visionary</h2>
          </div>
          
          <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border-[12px] border-white bg-black aspect-video">
            <video 
              className="w-full h-full object-cover"
              controls
              poster={ownerImg} // Shows owner's photo until video plays
            >
              <source src={interviewVideo} type="video/mp4" />
              {/* Optional fallback for .MOV files if you haven't converted them yet */}
              <source src={interviewVideo.replace('.mp4', '.mov')} type="video/quicktime" />
              Your browser does not support the video tag.
            </video>

            {/* Video Overlay Caption */}
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none transition-opacity duration-500 group-hover:opacity-0">
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 inline-block">
                <p className="text-white font-bold text-lg">In Conversation with Ravi Rajak</p>
                <p className="text-blue-200 text-sm">Owner & Founder • Maa Tara Two Wheeler Service Center</p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-500 mt-6 italic text-sm">
            Watch the full interview to learn more about our commitment to the cycling community.
          </p>
        </div>

        {/* --- Our Values --- */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Quality", icon: <ShieldCheck className="w-8 h-8 text-purple-500"/>, text: "We use genuine parts and follow industry standards for every service." },
              { title: "Honesty", icon: <HeartHandshake className="w-8 h-8 text-yellow-500"/>, text: "Transparent pricing and no hidden charges. We believe in fair dealing." },
              { title: "Speed", icon: <Zap className="w-8 h-8 text-orange-500"/>, text: "Efficient service delivery without compromising on quality of work." }
            ].map((val, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-transform duration-300 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{val.title}</h3>
                <p className="text-gray-600 text-sm">{val.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- What We Offer --- */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "General Maintenance & Repair", icon: <Wrench className="text-gray-600"/> },
              { label: "Engine Repair & Modification", icon: <Users className="text-purple-500"/> },
              { label: "Washing & Detailing", icon: <Droplets className="text-blue-500"/> },
              { label: "EV Bike Services", icon: <BatteryCharging className="text-green-500"/> },
              { label: "Genuine Spare Parts", icon: <ShoppingBag className="text-orange-500"/> },
              { label: "Customization & Modification", icon: <Zap className="text-yellow-500"/> }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="bg-gray-50 p-2 rounded-lg">{item.icon}</div>
                <span className="font-semibold text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Our Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
        </div>
        <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border-[12px] border-white bg-black max-w-4xl mx-auto">
          <img src={teamImg} alt="Our Team" className="w-full h-auto object-cover rounded-lg" />
        </div>

        {/* --- Why Choose Us --- */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-10 border border-yellow-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {[
              "Experienced technicians with 15+ years of combined expertise",
              "State-of-the-art diagnostic and repair equipment",
              "Warranty on all parts and services",
              "Competitive pricing with transparent billing",
              "Same-day service for most repairs",
              "Online booking and tracking system"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;