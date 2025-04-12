import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Menu, X, Stethoscope, Home, LayoutDashboard, PlusCircle, Info } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass-effect shadow-lg' 
          : 'bg-indigo-700/40 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <Pill className="h-8 w-8 mr-2 text-white transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110 animate-pulse-slow" />
              <span className="font-bold text-xl text-white tracking-wider transition-all duration-300 group-hover:text-indigo-200">
                MediDose AI
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {[
                  { to: "/", label: "Home", icon: <Home className="h-4 w-4 mr-1" /> },
                  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-1" /> },
                  { to: "/predict", label: "New Prediction", icon: <PlusCircle className="h-4 w-4 mr-1" /> },
                  { to: "/diagnose", label: "Diagnose", icon: <Stethoscope className="h-4 w-4 mr-1" /> },
                  { to: "/about", label: "About", icon: <Info className="h-4 w-4 mr-1" /> }
                ].map((item, index) => (
                  <Link 
                    key={index}
                    to={item.to} 
                    className="relative px-4 py-2 rounded-md text-sm font-medium text-white hover:text-white group overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      {item.icon}
                      {item.label}
                    </span>
                    <span className="absolute inset-0 rounded-md bg-white/0 group-hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100"></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-600/50 focus:outline-none transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with glass effect */}
      {isOpen && (
        <div className="md:hidden glass-effect animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {[
              { to: "/", label: "Home", icon: <Home className="h-5 w-5 mr-2" /> },
              { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
              { to: "/predict", label: "New Prediction", icon: <PlusCircle className="h-5 w-5 mr-2" /> },
              { to: "/diagnose", label: "Diagnose", icon: <Stethoscope className="h-5 w-5 mr-2" /> },
              { to: "/about", label: "About", icon: <Info className="h-5 w-5 mr-2" /> }
            ].map((item, index) => (
              <Link 
                key={index}
                to={item.to} 
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600/50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;