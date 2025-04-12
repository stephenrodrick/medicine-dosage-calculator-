import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Shield, Database, Activity, Zap, Users, ChevronRight } from 'lucide-react';

const AboutPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas background animation - similar to Home and Dashboard
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles: Particle[] = [];
    let animationFrameId: number;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.2;
    };
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(30, Math.floor((window.innerWidth * window.innerHeight) / 30000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          color: `rgba(99, 102, 241, ${Math.random() * 0.2 + 0.1})`,
          speedX: Math.random() * 0.3 - 0.15,
          speedY: Math.random() * 0.3 - 0.15
        });
      }
    };
    
    // Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
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
      
      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
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
    
    setCanvasDimensions();
    initParticles();
    animate();
    
    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions();
      initParticles();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0"></canvas>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-bold text-gradient mb-6">About MediDose AI</h1>
          <p className="text-xl text-indigo-700 max-w-3xl mx-auto">
            Revolutionizing personalized medicine through AI and blockchain technology
          </p>
        </div>
        
        {/* Mission Section */}
        <div className="glass-effect rounded-2xl overflow-hidden mb-16 transform transition-all duration-500 hover:shadow-lg animate-fadeInUp">
          <div className="md:flex">
            <div className="md:w-1/2 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Medical Research" 
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30"></div>
            </div>
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gradient mb-6">Our Mission</h2>
              <p className="text-indigo-700 mb-6 leading-relaxed">
                At MediDose AI, we're committed to enhancing patient safety and treatment efficacy through 
                personalized medicine. Our platform combines cutting-edge machine learning with blockchain 
                technology to provide healthcare professionals with accurate, transparent, and secure drug 
                dosage recommendations.
              </p>
              <p className="text-indigo-700 leading-relaxed">
                By analyzing individual patient characteristics including age, weight, genetic markers, and 
                medical history, our AI models can predict optimal drug dosages with high confidence. Every 
                prediction is securely recorded on the blockchain, ensuring complete transparency and 
                auditability throughout the treatment process.
              </p>
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mb-16 animate-fadeInUp delay-200">
          <h2 className="text-3xl font-bold text-gradient mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="h-8 w-8 text-indigo-600" />,
                title: "Data Collection & Processing",
                description: "Our system collects relevant patient data including age, weight, height, gender, genetic markers, and medical history. This data is securely processed and anonymized to protect patient privacy."
              },
              {
                icon: <Brain className="h-8 w-8 text-indigo-600" />,
                title: "AI Analysis & Prediction",
                description: "Our advanced machine learning models analyze the patient data to determine the optimal drug dosage. The system considers multiple factors and learns from historical outcomes to improve accuracy over time."
              },
              {
                icon: <Shield className="h-8 w-8 text-indigo-600" />,
                title: "Blockchain Verification",
                description: "Each prediction is recorded on the blockchain with a unique hash, creating an immutable record. Healthcare providers can verify the authenticity and integrity of dosage recommendations at any time."
              }
            ].map((item, index) => (
              <div key={index} className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
                <div className="bg-indigo-100/80 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-indigo-900 mb-3">{item.title}</h3>
                <p className="text-indigo-700">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Key Benefits Section */}
        <div className="mb-16 animate-fadeInUp delay-300">
          <h2 className="text-3xl font-bold text-gradient mb-8 text-center">Key Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Activity className="h-8 w-8 text-indigo-600" />,
                title: "Enhanced Patient Outcomes",
                description: "Personalized dosing leads to improved treatment efficacy and reduced adverse effects, resulting in better overall patient outcomes and satisfaction."
              },
              {
                icon: <Shield className="h-8 w-8 text-indigo-600" />,
                title: "Increased Safety",
                description: "By considering individual patient factors, our system helps prevent overdosing and underdosing, significantly reducing medication errors."
              },
              {
                icon: <Zap className="h-8 w-8 text-indigo-600" />,
                title: "Efficiency & Cost Reduction",
                description: "Optimized dosing reduces waste, shortens hospital stays, and minimizes readmissions, leading to substantial cost savings for healthcare providers."
              },
              {
                icon: <Users className="h-8 w-8 text-indigo-600" />,
                title: "Collaborative Healthcare",
                description: "Our platform facilitates collaboration between healthcare providers, allowing for shared insights and improved patient care coordination."
              }
            ].map((item, index) => (
              <div key={index} className="glass-effect rounded-xl p-6 flex items-start transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
                <div className="bg-indigo-100/80 p-3 rounded-full flex-shrink-0 mr-4">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-900 mb-2">{item.title}</h3>
                  <p className="text-indigo-700">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Team Section */}
        <div className="mb-16 animate-fadeInUp delay-400">
          <h2 className="text-3xl font-bold text-gradient mb-8 text-center">Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Dr. Sarah Chen",
                role: "Chief Medical Officer",
                image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              },
              {
                name: "Alex Rodriguez",
                role: "Lead AI Engineer",
                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              },
              {
                name: "Dr. Maya Patel",
                role: "Pharmaceutical Specialist",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              },
              {
                name: "James Wilson",
                role: "Blockchain Developer",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              }
            ].map((member, index) => (
              <div key={index} className="glass-effect rounded-xl overflow-hidden transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-indigo-200">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="glass-effect rounded-2xl p-12 text-center mb-16 animate-fadeInUp delay-500 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-300 rounded-full opacity-20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-gradient mb-6">Ready to Experience the Future of Personalized Medicine?</h2>
            <p className="text-indigo-700 text-lg max-w-3xl mx-auto mb-8">
              Join healthcare providers worldwide who are using MediDose AI to improve patient outcomes through personalized drug dosing.
            </p>
            <Link 
              to="/predict" 
              className="group relative px-8 py-4 rounded-full font-medium text-center text-white overflow-hidden transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 btn-glow inline-flex items-center"
            >
              <span className="relative z-10 flex items-center">
                Try MediDose AI
                <ChevronRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </Link>
          </div>
        </div>
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

export default AboutPage;
