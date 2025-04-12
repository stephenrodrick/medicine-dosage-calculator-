import React, { useEffect, useRef, Suspense, useState, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Shield, Brain, Activity, Stethoscope, Home as HomeIcon, LayoutDashboard, PlusCircle, Info, Database, Zap, Users } from 'lucide-react';

// Lazy load Spline to improve initial load time
const Spline = lazy(() => import('@splinetool/react-spline'));

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    // Skip canvas animation if Spline is loaded or on mobile devices
    if (isSplineLoaded || isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles: Particle[] = [];
    let animationFrameId: number;
    let lastTime = 0;
    const FPS = 30; // Limit FPS for better performance
    const fpsInterval = 1000 / FPS;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.2; // Reduce height calculation for better performance
    };
    
    // Initialize particles with reduced count
    const initParticles = () => {
      particles = [];
      // Reduce particle count significantly for better performance
      const particleCount = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 25000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          color: `rgba(${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, ${Math.random() * 0.5 + 0.1})`,
          speedX: Math.random() * 0.5 - 0.25, // Slower movement
          speedY: Math.random() * 0.5 - 0.25  // Slower movement
        });
      }
    };
    
    // Optimized animation loop with frame limiting
    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Calculate elapsed time and skip frames if needed
      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(238, 242, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(224, 231, 255, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
      });
      
      // Draw connections between particles - limit connections for performance
      for (let i = 0; i < particles.length; i++) {
        // Only check every other particle
        if (i % 2 !== 0) continue;
        
        for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasDimensions();
        initParticles();
      }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    setCanvasDimensions();
    initParticles();
    animate(0);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
    };
  }, [isSplineLoaded, isMobile]);

  // Handle Spline load completion
  const handleSplineLoad = () => {
    setIsSplineLoaded(true);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Conditional rendering based on device capability */}
      {!isMobile && (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
          <Suspense fallback={<div className="w-full h-full bg-indigo-50"></div>}>
            <Spline 
              scene="https://prod.spline.design/O2SansMkJzuCeg-P/scene.splinecode" 
              onLoad={handleSplineLoad}
            />
          </Suspense>
        </div>
      )}
      
      {/* Fallback Canvas Background - will show while Spline loads or on mobile */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 opacity-50"></canvas>
      
      {/* Content with higher z-index */}
      <div className="relative z-10 flex flex-col min-h-screen pt-20">
        {/* Hero Section */}
        <section className="glass-effect text-indigo-900 py-32 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
                <span className="block text-gradient animate-fadeIn">
                  Personalized Drug Dosage
                </span>
                <span className="block text-gradient mt-2 animate-fadeIn delay-200">
                  Powered by AI
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-12 text-indigo-700 animate-fadeInUp delay-400 leading-relaxed font-light">
                Leveraging AI and blockchain technology to provide precise, 
                personalized medication dosages for improved patient outcomes.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fadeInUp delay-600">
                <Link 
                  to="/predict" 
                  className="group relative px-8 py-4 rounded-full font-medium text-center text-white overflow-hidden transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 btn-glow"
                >
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </Link>
                
                <Link 
                  to="/about" 
                  className="group relative px-8 py-4 rounded-full font-medium text-center text-indigo-700 overflow-hidden transition-all duration-500 transform hover:scale-105 glass-effect"
                >
                  <span className="relative z-10">Learn More</span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full"></span>
                  <span className="absolute -inset-x-10 -bottom-10 h-40 bg-gradient-to-t from-indigo-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* New Mission Section */}
        <section className="py-24 bg-white/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-4">Our Mission</h2>
              <p className="text-xl text-indigo-700 max-w-3xl mx-auto">
                Revolutionizing healthcare through personalized medicine and cutting-edge technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Mission Card 1 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="p-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:animate-float">
                    <Brain className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Precision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our advanced machine learning algorithms analyze patient data to recommend optimal drug dosages with high confidence, reducing adverse effects and improving treatment outcomes.
                  </p>
                </div>
              </div>
              
              {/* Mission Card 2 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:animate-float">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Blockchain Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every dosage recommendation is securely recorded on the blockchain, ensuring complete transparency, immutability, and auditability throughout the treatment process.
                  </p>
                </div>
              </div>
              
              {/* Mission Card 3 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <div className="h-3 bg-gradient-to-r from-pink-500 to-indigo-500"></div>
                <div className="p-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6 group-hover:animate-float">
                    <Users className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Patient-Centered Care</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We prioritize individual patient characteristics including genetics, medical history, and current medications to deliver truly personalized medicine for better health outcomes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* New Functions Section */}
        <section className="py-24 glass-effect text-indigo-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-indigo-700 max-w-3xl mx-auto">
                Our comprehensive platform offers multiple functions to support healthcare professionals
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Function Card 1 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <div className="relative bg-white ring-1 ring-gray-200 rounded-lg p-6 overflow-hidden">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Pill className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Dosage Prediction</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Input patient data and receive AI-generated dosage recommendations based on individual characteristics and the latest medical research.
                  </p>
                  <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-32 w-32 bg-indigo-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <Link to="/predict" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                    Try it now →
                  </Link>
                </div>
              </div>
              
              {/* Function Card 2 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <div className="relative bg-white ring-1 ring-gray-200 rounded-lg p-6 overflow-hidden">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Stethoscope className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Symptom Analysis</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Analyze patient symptoms and receive potential diagnoses with recommended treatments, helping healthcare providers make informed decisions.
                  </p>
                  <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-32 w-32 bg-purple-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <Link to="/diagnose" className="text-purple-600 font-medium hover:text-purple-800 transition-colors">
                    Explore now →
                  </Link>
                </div>
              </div>
              
              {/* Function Card 3 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <div className="relative bg-white ring-1 ring-gray-200 rounded-lg p-6 overflow-hidden">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-pink-100 p-3 rounded-full">
                      <Database className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Treatment History</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Access and manage patient treatment history with a comprehensive dashboard that tracks dosage recommendations and treatment outcomes over time.
                  </p>
                  <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-32 w-32 bg-pink-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <Link to="/dashboard" className="text-pink-600 font-medium hover:text-pink-800 transition-colors">
                    View dashboard →
                  </Link>
                </div>
              </div>
              
              {/* Function Card 4 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-indigo-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <div className="relative bg-white ring-1 ring-gray-200 rounded-lg p-6 overflow-hidden">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Activity className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Verification System</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Verify the authenticity of dosage recommendations through our blockchain-based verification system, ensuring trust and transparency in healthcare.
                  </p>
                  <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-32 w-32 bg-red-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <Link to="/verify/0x1a2b3c4d5e6f7g8h9i0j" className="text-red-600 font-medium hover:text-red-800 transition-colors">
                    Verify now →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of the sections remain the same */}
      </div>
    </div>
  );
};

// TypeScript interface for particles
interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
}

export default Home;