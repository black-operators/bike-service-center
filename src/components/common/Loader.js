import React from 'react';

const Loader = () => {
  return (
    // Updated z-index to 100 to cover the Sticky Navbar
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Spinner Container */}
      <div className="relative w-20 h-20">
        
        {/* Outer Ring (Blue) */}
        <div
          className="absolute inset-0 border-4 border-gray-200 border-t-[#003B6A] rounded-full animate-spin"
          style={{ animationDuration: '1.5s', animationTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)', animationDelay: '0s' }}
        ></div>

        {/* Inner Ring (Red) */}
        <div
          className="absolute inset-2 border-4 border-transparent border-t-red-600 rounded-full animate-spin"
          style={{ animationDuration: '1.5s', animationTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)', animationDelay: '0s' }}
        ></div>
        
        {/* Center Dot */}
        <div className="absolute inset-[30px] bg-gray-800 rounded-full"></div>
      </div>

      {/* Loading Text */}
      <div className="mt-6 text-center animate-pulse">
        <h2 className="text-2xl font-bold text-red-600 tracking-tight">
          BOSCH<span className="text-[#003B6A]">-Maatara</span>
        </h2>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.5s]"></span>
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.13s]"></span>
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};

export default Loader;