import { useRef, useLayoutEffect } from "react";
import bgImage from "./india-map.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "./translationContext";
import { Button } from "./components/ui/button";
gsap.registerPlugin(ScrollTrigger);

export default function Test() {
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const secondDivRef = useRef<HTMLDivElement>(null);
  const scrollSpaceRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const navigator = useNavigate();

  // Language dropdown handler

  useLayoutEffect(() => {
    if (wrapperRef.current && textRef.current && secondDivRef.current) {
      const letters = textRef.current.querySelectorAll("span");

      // Create a timeline without ScrollTrigger for automatic animation
      const tl = gsap.timeline();

      // 1) Letters fade and move out over 3 seconds
      tl.fromTo(
        letters,
        { x: 0, scale: 1, rotation: 0, opacity: 1 },
        {
          x: (i) => (i % 2 === 0 ? "-20vw" : "20vw"),
          scale: 5,
          rotation: (i) => (i % 2 === 0 ? 180 : -180),
          opacity: 0,
          ease: "power2.out",
          duration: 3,
          stagger: 0.2
        }
      );

      // 2) After 3 seconds, hide first div and show departments
      tl.add(() => {
        gsap.set(wrapperRef.current, { display: "none" });
        gsap.set(scrollSpaceRef.current, { display: "none" });
        gsap.set(secondDivRef.current, {
          display: "block",
          opacity: 1,
          overflow: "auto",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100vh",
          zIndex: 10
        });
        document.body.style.overflow = "hidden"; // Hide body scrollbar, use container scroll
      }, 3);
    }

    return () => {
      // Clean up any existing animations
      gsap.killTweensOf("*");
    };
  }, []);

  const toggleList = (id: number) => {
    if(id !== 5){
      navigator('/chat')
    }else{
      navigator('/complaints') // Navigate to the new complaints page
    }
    
  }

  return (
    <div>
      <div
        ref={mainWrapperRef}
        className="relative h-screen overflow-hidden"
        style={{ position: "relative" }}
      >
        <div
          ref={wrapperRef}
          className="flex flex-col justify-center items-center h-screen w-full bg-cover bg-center absolute top-0 left-0"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div
            ref={textRef}
            className="flex text-4xl md:text-8xl font-bold text-[#0a3d91] tracking-widest drop-shadow-lg"
          >
            <span>K</span>
            <span>A</span>
            <span>R</span>
            <span>T</span>
            <span>H</span>
            <span>V</span>
            <span>Y</span>
          </div>

        </div>








      </div>

      <div
        ref={secondDivRef}
        className="department-container w-full bg-gradient-to-b from-blue-50 via-white to-blue-50 absolute inset-0 font-sans overflow-y-auto"
        style={{ display: "none" }}
      >
        <div className="relative py-20 text-center z-10 px-4 w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0a3d91] mb-12 drop-shadow-sm">
            {t('selectDepartment')}
          </h1>
          <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 flex-wrap max-w-7xl mx-auto">
            <div
              className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group"
              onClick={() => toggleList(1)}
            >
              <div className="text-6xl mb-4 transform hover:rotate-12 transition-transform duration-300 group-hover:animate-bounce">
                🚰
              </div>
              <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
                {t('waterDepartment')}
              </h2>
              <p className="text-gray-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {t('waterdetail')}
              </p>
            </div>
            <div
              className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group"
              onClick={() => toggleList(2)}
            >
              <div className="text-6xl mb-4 transform hover:rotate-12 transition-transform duration-300 group-hover:animate-pulse">
                ⚡
              </div>
              <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
                {t('electricityDepartment')}
              </h2>
              <p className="text-gray-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {t('electricitydetail')}
              </p>
            </div>
            <div
              className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group"
              onClick={() => toggleList(3)}
            >
              <div className="text-6xl mb-4 transform hover:rotate-12 transition-transform duration-300 group-hover:animate-ping">
                🏛️
              </div>
              <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
                {t('municipalDepartment')}
              </h2>
              <p className="text-gray-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {t('municipaldetail')}
              </p>
            </div>
            <div
              className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group"
              onClick={() => toggleList(4)}
            >
              <div className="text-6xl mb-4 transform hover:rotate-12 transition-transform duration-300 group-hover:animate-spin">
                ❓
              </div>
              <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
                {t('queryDepartment')}
              </h2>
              <p className="text-gray-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {t('querydetail')}
              </p>
            </div>
<div
              className="department-card bg-orange-400 rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group"
              onClick={() => toggleList(5)}
            >
              <div className="text-6xl mb-4 transform">
                📝
              </div>
              <h2 className="text-3xl font-bold text-[#0a3d91] mb-2">
                My Complaints
              </h2>

            </div>
          </div>

          {/* Enhanced styles */}
          <style>{`
             .department-card {
               position: relative;
               overflow: hidden;
             }
             
             .department-card::before {
               content: '';
               position: absolute;
               top: 0;
               left: -100%;
               width: 100%;
               height: 100%;
               background: linear-gradient(90deg, transparent, rgba(10, 61, 145, 0.1), transparent);
               transition: left 0.5s;
             }
             
             .department-card:hover::before {
               left: 100%;
             }
             
             @media (max-width: 768px) {
               .department-card {
                 width: 280px !important;
                 padding: 1.5rem !important;
               }
             }
             
             @media (max-width: 640px) {
               .department-card {
                 width: 260px !important;
                 padding: 1.25rem !important;
               }
             }
             
                           /* Ensure proper scrolling on mobile */
              @media (max-width: 1024px) {
                [ref="secondDivRef"] {
                  overflow-y: auto !important;
                  height: auto !important;
                  min-height: auto !important;
                  padding-bottom: 2rem !important;
                  
                }
              }
              
              /* Force proper scrolling behavior */
              .department-container {
                height: 100vh !important;
                min-height: 100vh !important;
                overflow-y: auto !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                z-index: 10 !important;
                scrollbar-width: none !important; /* Firefox */
                -ms-overflow-style: none !important; /* IE and Edge */
              }
              
              /* Hide scrollbar for Webkit browsers */
              .department-container::-webkit-scrollbar {
                display: none !important;
              }
              
              /* Ensure content is scrollable */
              .department-container > div {
                min-height: 100vh !important;
                padding-bottom: 4rem !important;
              }
              
              /* Hide all scrollbars globally when departments are active */
              body {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              
              body::-webkit-scrollbar {
                display: none !important;
              }
              
              /* Smooth scrolling for the department container */
              .department-container {
                scroll-behavior: smooth !important;
              }
           `}</style>
        </div>

      </div>
    </div>
  );
}