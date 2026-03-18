import React from 'react';
import { Link } from 'react-router-dom';

const ServicesPreview = () => {
  const services = [
    {
      id: 1,
      title: "General Service & Wash",
      image: "https://images.unsplash.com/photo-1605218427368-243f11599308?q=80&w=2066&auto=format&fit=crop", // Replace with local asset if available
      description: "Comprehensive check-up, oil change, and foam washing.",
      link: "/services/washing"
    },
    {
      id: 2,
      title: "Custom Modifications",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
      description: "Performance upgrades, aesthetic changes, and accessories.",
      link: "/services/modification"
    },
    {
      id: 3,
      title: "EV Service Hub",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2072&auto=format&fit=crop",
      description: "Specialized diagnostics and battery health checks for EVs.",
      link: "/services/ev-service"
    },
    {
			id: 4,
			title: "Purchase Bike Parts",
			image: "https://images.unsplash.com/photo-1617814076667-7a6c1f07c4a6?q=80&w=2070&auto=format&fit=crop",
			description: "Buy genuine spare parts including brakes, chains, tyres, batteries and more.",
			link: "/services/purchase-bike-parts",
		},
		{
			id: 5,
			title: "Second Hand Bikes",
			image: "https://images.unsplash.com/photo-1508973378895-28cfa2e8b9a9?q=80&w=2070&auto=format&fit=crop",
			description: "Certified used bikes with inspection reports and best pricing.",
			link: "/services/second-hand-bike",
		},
  ];

  return (
    <section className="bg-gray-50 py-16 mb-60 h-[75rem] bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/slider/desk2.png')" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our Services</h2>
            <div className="h-1 w-20 bg-red-600 mt-2 rounded-full"></div>
            <p className="mt-4 text-white max-w-2xl">
              From routine maintenance to complex repairs, we handle everything your bike needs.
            </p>
          </div>
          
          <Link 
            to="/services" 
            className="text-[#003B6A] font-semibold flex items-center gap-2 hover:text-blue-700 transition-colors group"
          >
            View All Services 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              {/* Image Container */}
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#003B6A] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm line-clamp-2">
                  {service.description}
                </p>
                
                <Link 
                  to={service.link}
                  className="inline-block w-full text-center bg-gray-50 hover:bg-[#003B6A] hover:text-white text-gray-800 font-medium py-3 rounded-lg transition-all duration-300 border border-gray-200 hover:border-transparent"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
        
      </div>
      
    </section>
  );
};

export default ServicesPreview;