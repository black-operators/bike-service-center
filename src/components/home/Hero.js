import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

const Hero = () => {
  // start at 1 because we will prepend a clone of the last slide for seamless looping
  const [currentIndex, setCurrentIndex] = useState(1);
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false); // guard rapid clicks
  const [showContent, setShowContent] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true); // control sound on video slides

  // slide lists (public/assets/slider remains same as before)
  const mobileSlides = [
    "/assets/slider/slide1.jpg",
    "/assets/slider/slide8.jpeg",
    "/assets/slider/slide9.jpeg",
    "/assets/slider/slide2.jpg",
    "/assets/slider/image.png",
    "/assets/slider/slide11.jpeg",
    "/assets/slider/slide5.png",
    "/assets/slider/slide6.jpeg",
    "/assets/slider/slide7.jpeg",
    "/assets/slider/poster1.jpeg",
    "/assets/slider/poster2.jpeg",
    "/assets/slider/poster3.jpeg",
    "/assets/slider/bike_vid.mp4"
  ];


  const desktopSlides = [
    "/assets/slider/slide1.jpg",
    "/assets/slider/slide2.jpg",
    "/assets/slider/slide3.jpg",
    "/assets/slider/slide4.jpg",
    "/assets/slider/slide11.jpeg",
    "/assets/slider/slide12.jpeg",
    "/assets/slider/slide10.png",
    "/assets/slider/bike_vid.mp4"
  ];

  // update isMobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // reset index when switching between mobile/desktop slidesets
  useEffect(() => {
    setCurrentIndex(1); // go to first real slide
  }, [isMobile]);

  const slides = isMobile ? mobileSlides : desktopSlides;
  const realCount = slides.length; // number of actual images

  // build extended list with clones at both ends (memoized to avoid recreating on each render)
  const slidesExtended = useMemo(() => [
    slides[realCount - 1],
    ...slides,
    slides[0],
  ], [slides, realCount]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(i => i - 1);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(i => i + 1);
  }, [isAnimating]);

  // when reaching clones we will reset in transitionEnd handler

  // autoplay/auto-advance
  useEffect(() => {
    if (paused) return;

    // determine delay: default 3s mobile /4s desktop
    let delay = isMobile ? 3000 : 4000;

    // check if current visible slide is a video
    const content = slidesExtended[currentIndex];
    if (typeof content === 'string' && content.match(/\.mp4$/)) {
      // if video, use its length; fallback to 8000ms
      delay = 8000;
    }

    const timer = setTimeout(nextSlide, delay);
    return () => clearTimeout(timer);
  }, [paused, currentIndex, isMobile, slidesExtended, nextSlide]);

  // whenever the active slide is a video, rewind and play from start
  useEffect(() => {
    const content = slidesExtended[currentIndex];
    if (typeof content === 'string' && content.match(/\.mp4$/)) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.muted = videoMuted; // ensure element matches state
        // try to play, ignore promise errors (may be blocked if unmuted)
        video.play().catch(() => {});
      }
    }

    // toggle visibility of content container
    if (typeof content === 'string' && content.match(/\.mp4$/)) {
      setShowContent(false);
    } else {
      setShowContent(true);
    }
  }, [currentIndex, slidesExtended, videoMuted]);

  // when we jump from a clone back to real slide, temporarily disabled transition
  useEffect(() => {
    if (!transitionEnabled) {
      requestAnimationFrame(() => setTransitionEnabled(true));
    }
  }, [transitionEnabled]);

  // make sure the actual video element respects the mute toggle outside slide-change events
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = videoMuted;
    }
  }, [videoMuted]);

  return (
    <section className="relative w-full h-auto md:h-[80vh] overflow-hidden bg-white">
      
      {/* custom slider (replaces react-slick) */}
      <div
        className="relative w-full h-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* mute/unmute button for video slide */}
        {typeof slidesExtended[currentIndex] === 'string' && slidesExtended[currentIndex].match(/\.mp4$/) && (
          <button
            onClick={() => setVideoMuted(m => !m)}
            className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 p-2 rounded-full text-white"
            aria-label={videoMuted ? 'Unmute video' : 'Mute video'}
          >
            {videoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        )}
        {/* slides wrapper */}
          <div
          onTransitionEnd={() => {
            // normal slide finished
            if (currentIndex === 0) {
              setTransitionEnabled(false);
              setCurrentIndex(realCount);
            } else if (currentIndex === realCount + 1) {
              setTransitionEnabled(false);
              setCurrentIndex(1);
            }
            // allow next interaction after transition or jump
            setIsAnimating(false);
          }}
          className={`flex ${transitionEnabled ? "transition-transform duration-500 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slidesExtended.map((item, idx) => (
            <div
              key={idx}
              className={`w-full flex-shrink-0 ${isMobile ? "h-[80vh]" : "h-[80vh]"}`}
            >
              {typeof item === 'string' && item.match(/\.mp4$/) ? (
                <video
                  ref={idx === currentIndex ? videoRef : null}
                  src={item}
                  className="w-full h-full object-cover object-center"
                  autoPlay
                  muted={videoMuted}
                  playsInline
                />
              ) : (
                <img
                  src={item}
                  alt={`Hero background ${idx}`}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          ))}
        </div>

        {/* pagination bullets */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, idx) => {
            const realIndex = idx + 1; // offset because extended
            return (
              <button
                key={idx}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setCurrentIndex(realIndex);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentIndex === realIndex ? "bg-white" : "bg-gray-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            );
          })}
        </div>

        {/* navigation arrows */}
        <button
          onClick={() => !isAnimating && prevSlide()}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black bg-opacity-30 p-2 rounded-full"
          aria-label="Previous slide"
          disabled={isAnimating}
        >
          &lt;
        </button>
        <button
          onClick={() => !isAnimating && nextSlide()}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black bg-opacity-30 p-2 rounded-full"
          aria-label="Next slide"
          disabled={isAnimating}
        >
          &gt;
        </button>
      </div>

      {/* Content Container (আপনার ডিজাইন) */}
      <div className={`relative z-10 md:absolute md:inset-0 md:h-full max-w-7xl mx-10 my-20 md:mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center transform -translate-x-10 transition-opacity duration-500 ${
        showContent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xl">
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4 text-red-600">
            One Stop Solution for <br />
            <span className="text-blue-900">Bike Service & Care Every Generation</span>
          </h1>

          <p className="text-blue-700 mb-8 leading-relaxed text-lg md:text-xl">
            We provide specialized service for all engine types—including{" "}
            <strong className="text-red-600">BS-4, BS-6, and Electric Vehicles</strong>. Book washing,
            modification, spare parts, and buy/sell services easily from home.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/services"
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-400 transition-all transform hover:scale-105 shadow-lg"
            >
              Explore Services
            </Link>

            <Link
              to="/book-service"
              className="bg-blue-600 border-2 border-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-400 hover:text-white transition-all transform hover:scale-105 shadow-lg"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </section>
    
  );

};

export default Hero;