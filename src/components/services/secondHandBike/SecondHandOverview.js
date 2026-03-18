import React from "react";
import { Link } from "react-router-dom";
import { 
  Bike, Banknote, ClipboardCheck
} from "lucide-react";

const SecondHandOverview = () => {
  const services = [
    {
      id: "buy",
      title: "Buy Certified Bikes",
      desc: "Browse our inventory of 150-point inspected, refurbished, and warranty-backed bikes.",
      icon: <Bike className="w-6 h-6 text-orange-400" />,
      color: "from-orange-500/20 to-slate-900/90 border-orange-500/30",
      glow: "hover:shadow-orange-500/20",
      features: ["7-Day Money Back", "6-Month Warranty", "Verified Documents", "Free First Service"],
      featureColor: "bg-orange-400",
      link: "/services/second-hand/buy",
      btnText: "View Showroom"
    },
    {
      id: "sell",
      title: "Sell Your Bike",
      desc: "Get the best market price for your bike in 30 minutes. Instant payment and paperwork transfer.",
      icon: <Banknote className="w-6 h-6 text-green-400" />,
      color: "from-green-500/20 to-slate-900/90 border-green-500/30",
      glow: "hover:shadow-green-500/20",
      features: ["Instant Valuation", "Doorstep Inspection", "Free RC Transfer", "Best Price Guarantee"],
      featureColor: "bg-green-400",
      link: "/services/second-hand/sell",
      btnText: "Get Quote"
    },
    {
      id: "inspection",
      title: "Expert Inspection",
      desc: "Planning to buy a bike elsewhere? Hire our experts for a complete health check-up.",
      icon: <ClipboardCheck className="w-6 h-6 text-blue-400" />,
      color: "from-blue-500/20 to-slate-900/90 border-blue-500/30",
      glow: "hover:shadow-blue-500/20",
      features: ["Engine Compression Test", "Chassis Alignment", "Accident History Check", "Digital Report"],
      featureColor: "bg-blue-400",
      link: "/services/second-hand/inspection",
      btnText: "Book Inspection"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pb-16">
      
      {/* Hero Section */}
      <div className="bg-transparent text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
          Certified <span className="text-orange-400">Exchange</span> Hub
        </h1>
        <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg opacity-80">
          Buy, Sell, or Exchange pre-owned bikes with complete transparency and trust.
        </p>
      </div>

      {/* Services Grid - Updated UI */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8 relative z-20">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {services.map((item) => (
            <div 
              key={item.id} 
              className={`
                relative group cursor-pointer rounded-3xl p-8 
                border backdrop-blur-md transition-all duration-500 
                hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                bg-gradient-to-br ${item.color} ${item.glow}
                flex flex-col justify-between h-full overflow-hidden
              `}
            >
              {/* Top Icon Area */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl ring-1 ring-white/20">
                  {item.icon}
                </div>
              </div>

              {/* Content Area */}
              <div className="relative z-10 flex-grow flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{item.desc}</p>
                
                <div className="space-y-2 mb-6 mt-auto">
                  {item.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-300 font-medium">
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${item.featureColor}`}></div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link to={item.link} className="block">
                  <button 
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition font-bold border border-white/20 backdrop-blur-sm"
                  >
                    {item.btnText}
                  </button>
                </Link>
              </div>

              {/* Bottom Shine Effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecondHandOverview;