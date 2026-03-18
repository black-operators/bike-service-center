import React from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, Disc, Zap, Cog, 
  BatteryCharging, Wrench
} from "lucide-react";

const PartsOverview = () => {
  const categories = [
    {
      id: "accessories",
      title: "Bike Accessories",
      desc: "Upgrade your ride with premium helmets, seat covers, and riding gears.",
      icon: <ShoppingBag className="w-6 h-6 text-pink-400" />,
      color: "from-pink-500/20 to-slate-900/90 border-pink-500/30",
      glow: "hover:shadow-pink-500/20",
      features: ["Helmets & Safety Gear", "Seat Covers", "Mobile Holders", "Bike Covers"],
      featureColor: "bg-pink-400",
      link: "/shop/accessories"
    },
    {
      id: "brake",
      title: "Brake Systems",
      desc: "Ensure safety with high-performance brake pads, discs, and fluid lines.",
      icon: <Disc className="w-6 h-6 text-red-400" />,
      color: "from-red-500/20 to-slate-900/90 border-red-500/30",
      glow: "hover:shadow-red-500/20",
      features: ["Disc Plates", "Ceramic Pads", "Hydraulic Kits", "Brake Levers"],
      featureColor: "bg-red-400",
      link: "/shop/brake"
    },
    {
      id: "electrical",
      title: "Electrical Parts",
      desc: "Lighting, horns, and wiring harnesses for perfect visibility and control.",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      color: "from-yellow-500/20 to-slate-900/90 border-yellow-500/30",
      glow: "hover:shadow-yellow-500/20",
      features: ["LED Headlights", "Fog Lights", "Digital Meters", "Wiring Kits"],
      featureColor: "bg-yellow-400",
      link: "/shop/electrical"
    },
    {
      id: "engine",
      title: "Engine Components",
      desc: "Genuine core engine parts for maximum durability and performance.",
      icon: <Cog className="w-6 h-6 text-cyan-400" />,
      color: "from-cyan-500/20 to-slate-900/90 border-cyan-500/30",
      glow: "hover:shadow-cyan-500/20",
      features: ["Piston Kits", "Cylinder Blocks", "Clutch Plates", "Timing Chains"],
      featureColor: "bg-cyan-400",
      link: "/shop/engine"
    },
    {
      id: "ev",
      title: "EV Special Parts",
      desc: "High-performance components specifically designed for Electric Vehicles.",
      icon: <BatteryCharging className="w-6 h-6 text-green-400" />,
      color: "from-green-500/20 to-slate-900/90 border-green-500/30",
      glow: "hover:shadow-green-500/20",
      features: ["Lithium Batteries", "BLDC Controllers", "Throttles", "Chargers"],
      featureColor: "bg-green-400",
      link: "/shop/ev"
    },
    {
      id: "others",
      title: "Other Utilities",
      desc: "Miscellaneous tools, lubricants, and general maintenance parts.",
      icon: <Wrench className="w-6 h-6 text-purple-400" />,
      color: "from-purple-500/20 to-slate-900/90 border-purple-500/30",
      glow: "hover:shadow-purple-500/20",
      features: ["Lubricants & Oils", "Tool Kits", "Cleaning Sprays", "Nuts & Bolts"],
      featureColor: "bg-purple-400",
      link: "/shop/others"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pb-16">
      
      {/* Hero Section */}
      <div className="bg-transparent text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
          Genuine <span className="text-cyan-400">Spare Parts</span> Store
        </h1>
        <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg opacity-80">
          100% Authentic OEM parts and premium accessories delivered directly to you.
        </p>
      </div>

      {/* Categories Grid - Updated UI */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8 relative z-20">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {categories.map((item) => (
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
                    Browse Catalog
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

export default PartsOverview;