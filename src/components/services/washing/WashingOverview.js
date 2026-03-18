import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axiosInstance from "../../../api/axiosInstance"; 
import { 
  Droplets, Sparkles, Clock, 
  Wind, Zap, Loader2
} from "lucide-react";

const WashingOverview = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axiosInstance.get('/services?category=washing');
        setPackages(res.data);
      } catch (error) {
        console.error("Error fetching services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBookNow = (service) => {
    navigate(`/services/washing/book/${service._id}`, { state: { service } });
  };

  // Helper to determine style based on package popularity
  const getPackageStyle = (pack) => {
    if (pack.isPopular) return {
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      color: "from-purple-500/20 to-slate-900/90 border-purple-500/30",
      glow: "hover:shadow-purple-500/20",
      featureColor: "bg-purple-400"
    };
    return {
      icon: <Droplets className="w-6 h-6 text-cyan-400" />,
      color: "from-cyan-500/20 to-slate-900/90 border-cyan-500/30",
      glow: "hover:shadow-cyan-500/20",
      featureColor: "bg-cyan-400"
    };
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
        <Loader2 className="animate-spin text-blue-500" size={48}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-16">
      
      {/* Hero Section */}
      <div className="bg-transparent text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
          Bike <span className="text-cyan-400">Washing</span>
        </h1>
        <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg opacity-80">
          Give your bike the showroom shine it deserves with our eco-friendly washing technology.
        </p>
      </div>

      {/* Packages Grid - Updated UI */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8 relative z-20">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 auto-rows-fr">
          {packages.map((pack) => {
            const style = getPackageStyle(pack);
            return (
              <div 
                key={pack._id} 
                className={`
                  relative group cursor-pointer rounded-3xl p-8 
                  border backdrop-blur-md transition-all duration-500 
                  hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                  bg-gradient-to-br ${style.color} ${style.glow}
                  flex flex-col justify-between h-full overflow-hidden
                `}
              >
                {/* Top Icon Area */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl ring-1 ring-white/20">
                    {style.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">₹{pack.price}</span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="relative z-10 flex-grow flex flex-col">
                  <h2 className="text-2xl font-bold text-white mb-2">{pack.name}</h2>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">{pack.description}</p>
                  
                  <div className="space-y-2 mb-6 mt-auto">
                    {pack.features && pack.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-xs text-gray-300 font-medium">
                        <div className={`w-1.5 h-1.5 rounded-full mr-3 ${style.featureColor}`}></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleBookNow(pack)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition font-bold border border-white/20 backdrop-blur-sm"
                  >
                    Book This Wash
                  </button>
                </div>

                {/* Bottom Shine Effect */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tech Section */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-sm border border-white/10">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-black text-white leading-tight">
              The Science of <br/><span className="text-blue-400">Cleaning</span>
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              We don't just use water; we use scientifically formulated pH-neutral shampoos and microfiber technology to prevent swirl marks on your paint.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <Wind className="text-cyan-400 mb-2" />
                <h4 className="font-bold text-white">Air Drying</h4>
                <p className="text-xs text-gray-400 mt-1">High-speed blowers prevent spots.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <Clock className="text-purple-400 mb-2" />
                <h4 className="font-bold text-white">20-Min Express</h4>
                <p className="text-xs text-gray-400 mt-1">Quick service while you wait.</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="w-full h-48 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border-4 border-white/10 shadow-2xl">
              <div className="text-center animate-pulse">
                <Zap className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mx-auto mb-3 animate-bounce" />
                <p className="text-yellow-400 font-mono text-xs uppercase tracking-widest border border-yellow-400 px-4 py-1 rounded inline-block">
                  Touchless Tech
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WashingOverview;