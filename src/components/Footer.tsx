import React from 'react';
import { Github, Twitter, Linkedin, Heart, Mail, MapPin, Phone, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      {/* Wave effect at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg 
          className="relative block w-full h-12 text-white" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
            className="fill-white"
          ></path>
        </svg>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400 rounded-full opacity-10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Pill className="h-6 w-6 mr-2 text-indigo-300" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                MediDose AI
              </span>
            </h3>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Personalized drug dosage recommendations powered by AI and blockchain technology.
              Enhancing patient safety and treatment efficacy through data-driven insights.
            </p>
            
            <div className="mt-6 flex space-x-4">
              {[
                { icon: <Github className="h-5 w-5" />, href: "#" },
                { icon: <Twitter className="h-5 w-5" />, href: "#" },
                { icon: <Linkedin className="h-5 w-5" />, href: "#" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="text-indigo-200 hover:text-white transition-all duration-300 transform hover:scale-110 bg-white/10 p-2 rounded-full hover:bg-white/20"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
              Quick Links
            </h3>
            <ul className="space-y-2 text-indigo-200">
              {[
                { to: "/", label: "Home" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/predict", label: "New Prediction" },
                { to: "/diagnose", label: "Diagnose" },
                { to: "/about", label: "About" }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.to} 
                    className="hover:text-white transition-colors duration-300 inline-block relative group"
                  >
                    <span>{link.label}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="transform transition-all duration-500 hover:translate-y-[-5px]">
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
              Contact Us
            </h3>
            <ul className="space-y-3 text-indigo-200">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-indigo-300 flex-shrink-0" />
                <span>123 Innovation Drive, Medical District, CA 94103</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-indigo-300 flex-shrink-0" />
                <a href="mailto:contact@medidose.ai" className="hover:text-white transition-colors">
                  contact@medidose.ai
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-indigo-300 flex-shrink-0" />
                <a href="tel:+1-800-MEDIDOSE" className="hover:text-white transition-colors">
                  +1-800-MEDIDOSE
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-indigo-700/30 text-center">
          <p className="text-indigo-200 flex items-center justify-center text-sm">
            Made with <Heart className="h-4 w-4 mx-1 text-pink-400 animate-pulse" /> by MediDose AI Team
          </p>
          <p className="text-indigo-300/60 text-xs mt-2">
            © {new Date().getFullYear()} MediDose AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;