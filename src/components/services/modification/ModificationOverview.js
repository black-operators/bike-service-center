import React from "react";
import { Link } from "react-router-dom";
import { 
  Palette, Zap, Flame, Wrench, 
  ShieldCheck, Gauge
} from "lucide-react";

const ModificationOverview = () => {
  const modifications = [
    {
      id: "body",
      title: "Body Customization",
      desc: "Transform your bike's look with custom paint, wraps, and aerodynamic fairings.",
      icon: <Palette className="w-6 h-6 text-purple-400" />,
      color: "from-purple-500/20 to-slate-900/90 border-purple-500/30",
      glow: "hover:shadow-purple-500/20",
      features: ["Custom Paint & Wrap", "Tank Design", "Seat Customization", "Sticker & Decal Work"],
      link: "/services/modification/body"
    },
    {
      id: "engine",
      title: "Engine Tuning",
      desc: "Unlock maximum power with ECU remapping, air filters, and cooling upgrades.",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      color: "from-yellow-500/20 to-slate-900/90 border-yellow-500/30",
      glow: "hover:shadow-yellow-500/20",
      features: ["ECU Tuning", "Performance Air Filter", "Power Boosting", "Cooling Upgrade"],
      link: "/services/modification/engine"
    },
    {
      id: "exhaust",
      title: "Exhaust Systems",
      desc: "Enhance sound and performance with slip-ons and full system exhaust upgrades.",
      icon: <Flame className="w-6 h-6 text-red-400" />,
      color: "from-red-500/20 to-slate-900/90 border-red-500/30",
      glow: "hover:shadow-red-500/20",
      features: ["Slip-on Exhaust", "Full System Setup", "Sound Tuning", "Emission Control"],
      link: "/services/modification/exhaust"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pb-16">
      
      {/* Hero Section */}
      <div className="bg-transparent text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
          Custom <span className="text-yellow-400">Modification</span> Studio
        </h1>
        <p className="text-blue-100 max-w-3xl mx-auto text-base md:text-lg opacity-80">
          Premium aesthetic and performance upgrades for the ultimate riding experience.
        </p>
      </div>

      {/* Modification Services Grid - Updated UI */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8 relative z-20">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {modifications.map((item) => (
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
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                        item.id === 'body' ? 'bg-purple-400' : 
                        item.id === 'engine' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link to={item.link} className="block">
                  <button 
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition font-bold border border-white/20 backdrop-blur-sm"
                  >
                    Configure Now
                  </button>
                </Link>
              </div>

              {/* Bottom Shine Effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Tech & Quality Section */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-sm border border-white/10">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-black text-white leading-tight">
              Performance <br/><span className="text-blue-400">Tuning Standards</span>
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Every modification is tested for safety, durability, and performance. We use only dyno-tested parts and premium materials.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <Gauge className="text-red-400 mb-2" />
                <h4 className="font-bold text-white">Dyno Tested</h4>
                <p className="text-xs text-gray-400 mt-1">Verified power gains.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <ShieldCheck className="text-green-400 mb-2" />
                <h4 className="font-bold text-white">Legal Check</h4>
                <p className="text-xs text-gray-400 mt-1">RTO compliant mods.</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="w-full h-48 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border-4 border-white/10 shadow-2xl">
              <div className="text-center animate-pulse">
                <Wrench className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mx-auto mb-3 animate-bounce" />
                <p className="text-yellow-400 font-mono text-xs uppercase tracking-widest border border-yellow-400 px-4 py-1 rounded inline-block">
                  Ready to Customize
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ModificationOverview;