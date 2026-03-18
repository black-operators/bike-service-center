import React from "react";
import { 
  Wrench, 
  UserCheck, 
  Settings, 
  IndianRupee, 
  BatteryCharging, 
  CalendarCheck 
} from "lucide-react";
import bgImage from '../../assets/gallery/services/BGImage.jpeg';

const features = [
  {
    title: "Expert Technicians",
    description:
      "Certified and experienced mechanics to handle all types of bikes, including EVs.",
    icon: <UserCheck className="w-8 h-8 text-blue-400" />,
    color: "bg-slate-900/40 border-purple-500/30"
  },
  {
    title: "Expert Service",
    description:
      "Bike services performed by technicians with years of experience.",
    icon: <Wrench className="w-8 h-8 text-purple-400" />,
    color: "bg-slate-900/40 border-blue-500/30"
  },
  {
    title: "Genuine Spare Parts",
    description:
      "We use only genuine and high-quality spare parts for better performance.",
    icon: <Settings className="w-8 h-8 text-cyan-400" />,
    color: "bg-slate-900/40 border-cyan-500/30"
  },
  {
    title: "Affordable Pricing",
    description:
      "Transparent pricing with no hidden charges and easy invoice generation.",
    icon: <IndianRupee className="w-8 h-8 text-green-400" />,
    color: "bg-slate-900/40 border-green-500/30"
  },
  {
    title: "EV Bike Support",
    description:
      "Specialized services for electric bikes including battery and motor care.",
    icon: <BatteryCharging className="w-8 h-8 text-emerald-400" />,
    color: "bg-slate-900/40 border-emerald-500/30"
  },
  {
    title: "Easy Online Booking",
    description:
      "Book, track, and manage your service requests anytime through our platform.",
    icon: <CalendarCheck className="w-8 h-8 text-orange-400" />,
    color: "bg-slate-900/40 border-orange-500/30"
  }
];

const Features = () => {
  return (
    <section
      className="relative py-24 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Subtle Overlay to ensure text readability against the background image */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Heading Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Why Choose <span className="text-blue-500">Our Bike Service?</span>
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            We provide reliable, affordable, and professional bike services.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                relative rounded-3xl p-8 
                border backdrop-blur-md transition-all duration-500 
                hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                ${feature.color}
              `}
            >
              <div className="mb-6">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl ring-1 ring-white/20 w-fit">
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom accent line for a premium finish */}
              <div className="mt-6 w-12 h-1 bg-white/20 rounded-full group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;