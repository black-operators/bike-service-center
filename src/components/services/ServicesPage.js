import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, Wrench, ShoppingCart, Repeat, Droplets, 
  Grid, ArrowLeft, ChevronRight 
} from "lucide-react";

// Sub-components Import (Assuming these exist in your project)
import EvMain from './evService/EvOverview';
import ModificationOverview from './modification/ModificationOverview';
import PartsOverview from './purchaseBikeParts/PartsOverview';
import SecondHandOverview from './secondHandBike/SecondHandOverview';
import WashingOverview from './washing/WashingOverview';

import bgImage from '../../assets/gallery/services/BGImage.jpeg';

const ServicesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    // prefer location state (set by Footer Link or elsewhere)
    const fromState = location.state?.selectedService;
    if (fromState) return fromState;

    const saved = sessionStorage.getItem('selectedService');
    if (saved) {
      sessionStorage.removeItem('selectedService');
      return saved;
    }
    return 'overview';
  });

  // clear location state after reading so it doesn't persist on back/refresh
  useEffect(() => {
    if (location.state?.selectedService) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // always scroll to top when page mounts or activeTab changes (including via link click)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const services = [
    {
      id: 'evservice',
      name: 'EV Service',
      icon: <Zap className="w-6 h-6 md:w-8 md:h-8 text-green-400" />,
      desc: 'Advanced diagnostics for Battery, Motor & Charging systems.',
      color: 'from-green-500/20 to-slate-900/90 border-green-500/30'
    },
    {
      id: 'modifications',
      name: 'Bike Custom Modification',
      icon: <Wrench className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />,
      desc: 'Performance tuning, body wraps & exhaust upgrades.',
      color: 'from-purple-500/20 to-slate-900/90 border-purple-500/30'
    },
    {
      id: 'parts',
      name: 'Bike Parts Store',
      icon: <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />,
      desc: 'Genuine OEM spare parts & premium accessories.',
      color: 'from-cyan-500/20 to-slate-900/90 border-cyan-500/30'
    },
    {
      id: 'secondhand',
      name: 'Second-Hand Bikes sale',
      icon: <Repeat className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />,
      desc: 'Buy, sell or exchange certified pre-owned bikes.',
      color: 'from-orange-500/20 to-slate-900/90 border-orange-500/30'
    },
    {
      id: 'washing',
      name: 'Bike Washing',
      icon: <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
      desc: 'Eco-friendly foam wash with premium detailing services.',
      color: 'from-blue-500/20 to-slate-900/90 border-blue-500/30'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'evservice': return <EvMain />;
      case 'modifications': return <ModificationOverview />;
      case 'parts': return <PartsOverview />;
      case 'secondhand': return <SecondHandOverview />;
      case 'washing': return <WashingOverview />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`
                  relative group cursor-pointer rounded-3xl p-8 
                  border backdrop-blur-md transition-all duration-500 
                  hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                  bg-gradient-to-br ${service.color}
                `}
              >
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl ring-1 ring-white/20">
                    {service.icon}
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                  {service.name}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                  {service.desc}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* --- Fixed Background --- */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url(${bgImage})` 
        }}
      />

      <div className="relative z-10 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
          Service <span className="text-blue-500">Hub</span>
        </h1>
        <p className="text-gray-400 text-2xl max-w-2xl mx-auto">
          Precision maintenance and expert care for every type of ride.
        </p>
      </div>

          {/* --- Fixed Navigation Tab Bar (No Scroller) --- */}
          <div className="mb-12">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('overview')}
                className={`
                  flex items-center justify-center gap-1 md:gap-2 py-3 rounded-xl transition-all
                  text-[10px] xs:text-xs md:text-sm font-bold
                  ${activeTab === 'overview' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-white/10'}
                `}
              >
                <Grid size={14} className="hidden xs:block" /> Overview
              </button>
              
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`
                    flex items-center justify-center py-3 rounded-xl transition-all
                    text-[10px] xs:text-xs md:text-sm font-bold text-center leading-tight
                    ${activeTab === s.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[500px]">
            {renderContent()}
          </div>

          {/* Return Button */}
          {activeTab !== 'overview' && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-3 px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all font-black uppercase tracking-widest text-sm"
              >
                <ArrowLeft size={18} /> Return to Service Hub
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;