
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  PlusCircle, 
  Users, 
  Pill,
  ChevronRight
} from 'lucide-react';
import { usePredictionContext, Prediction } from '../context/PredictionContext';

const calculateMostPrescribedDrug = (predictions: Prediction[]) => {
  const frequency: { [drug: string]: number } = {};
  predictions.forEach(pred => {
    frequency[pred.drugName] = (frequency[pred.drugName] || 0) + 1;
  });
  let mostPrescribed = '';
  let maxCount = 0;
  Object.entries(frequency).forEach(([drug, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPrescribed = drug;
    }
  });
  return mostPrescribed;
};

const Dashboard = () => {
  const { predictions } = usePredictionContext();
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stats = {
    totalPredictions: predictions.length,
    averageConfidence: predictions.length
      ? predictions.reduce((acc, pred) => acc + pred.confidence, 0) / predictions.length
      : 0,
    uniquePatients: new Set(predictions.map(p => p.patientId)).size,
    mostPrescribedDrug: calculateMostPrescribedDrug(predictions)
  };

  const filteredPredictions = predictions.filter(pred =>
    pred.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pred.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pred.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Canvas background animation
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
      canvas.height = window.innerHeight;
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
            <p className="text-indigo-700 text-lg">
              Overview of dosage predictions and system performance
            </p>
          </div>
          <Link 
            to="/predict" 
            className="mt-4 md:mt-0 group relative px-6 py-3 rounded-full font-medium text-center text-white overflow-hidden transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 btn-glow animate-fadeInUp"
          >
            <span className="relative z-10 flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              New Prediction
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </Link>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fadeInUp delay-200">
          <div className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-indigo-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Total Predictions</p>
                <p className="text-2xl font-semibold text-indigo-900">{stats.totalPredictions}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Average Confidence</p>
                <p className="text-2xl font-semibold text-indigo-900">
                  {(stats.averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Unique Patients</p>
                <p className="text-2xl font-semibold text-indigo-900">{stats.uniquePatients}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Pill className="h-6 w-6 text-purple-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Most Prescribed</p>
                <p className="text-2xl font-semibold text-indigo-900 truncate max-w-[120px]" title={stats.mostPrescribedDrug}>
                  {stats.mostPrescribedDrug || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Predictions Table */}
        <div className="glass-effect rounded-xl overflow-hidden animate-fadeInUp delay-400">
          <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-indigo-900">Recent Predictions</h2>
            <div className="text-sm text-indigo-600">
              {filteredPredictions.length} {filteredPredictions.length === 1 ? 'result' : 'results'}
            </div>
          </div>
          
          <div className="px-6 py-4 border-b border-indigo-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-indigo-400" />
              </div>
              <input
                type="text"
                placeholder="Search by patient ID, drug name, or prediction ID"
                className="pl-10 pr-4 py-2 border border-indigo-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-indigo-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Prediction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Drug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-indigo-100">
                {filteredPredictions.length > 0 ? (
                  filteredPredictions.map((prediction) => (
                    <tr key={prediction.id} className="hover:bg-indigo-50/80 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-indigo-900">{prediction.id}</td>
                      <td className="px-6 py-4 text-sm text-indigo-700">{prediction.patientId}</td>
                      <td className="px-6 py-4 text-sm text-indigo-700">{prediction.drugName}</td>
                      <td className="px-6 py-4 text-sm text-indigo-700">{prediction.dosage}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-2 w-16 bg-indigo-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                              style={{ width: `${prediction.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-indigo-700">
                            {(prediction.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-700">
                        {new Date(prediction.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link 
                            to={`/results/${prediction.id}`} 
                            className="text-indigo-600 hover:text-indigo-900 flex items-center group"
                          >
                            <span>View</span>
                            <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </Link>
                          <Link 
                            to={`/verify/${prediction.blockchainHash}`} 
                            className="text-green-600 hover:text-green-900 flex items-center group"
                          >
                            <span>Verify</span>
                            <ExternalLink className="h-4 w-4 ml-1 transform group-hover:translate-y-[-2px] transition-transform" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-indigo-500">
                      <div className="flex flex-col items-center">
                        <AlertTriangle className="h-8 w-8 mb-2 text-indigo-400" />
                        <p>No predictions found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

export default Dashboard;
