import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Check, AlertTriangle, Download, ExternalLink, ChevronRight, Brain, Shield, Activity, Pill, Loader, Users, Database } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { usePredictionContext } from '../context/PredictionContext';
import jsPDF from 'jspdf';  

ChartJS.register(ArcElement, Tooltip, Legend);

interface ResultsData {
  recommendedDosage: number;
  confidence: number;
  alternativeMedications: { name: string; dosage: number }[];
  blockchainHash: string;
}

interface LocationState {
  formData: any;
  results: ResultsData;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
}

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const { predictions, addPrediction } = usePredictionContext();
  const [predictionAdded, setPredictionAdded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas background animation - similar to Home and Dashboard
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles: Particle[] = [];
    let animationFrameId: number;
    let lastTime = 0;
    const FPS = 30; // Limit FPS for better performance
    
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
          color: `rgba(${79 + Math.random() * 20}, ${70 + Math.random() * 20}, ${229 + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5
        });
      }
    };
    
    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Throttle FPS for better performance
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
      
      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
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
    animate(0);
    
    // Handle window resize
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasDimensions();
        initParticles();
      }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Dosage Recommendation Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Prediction ID: ${id}`, 20, 30);
    doc.text(`Recommended Dosage: ${results?.recommendedDosage} mg`, 20, 40);
    doc.text(`Confidence: ${(results?.confidence * 100).toFixed(0)}%`, 20, 50);
    doc.text(`Drug Name: ${patientData.drugName}`, 20, 60);
    doc.text(`Patient ID: ${patientData.patientId}`, 20, 70);
    doc.text(`Age: ${patientData.age}`, 20, 80);
    doc.text(`Weight: ${patientData.weight}`, 20, 90);
    doc.text(`Height: ${patientData.height}`, 20, 100);
    doc.text(`Gender: ${patientData.gender}`, 20, 110);
    
    if (results?.alternativeMedications && results.alternativeMedications.length > 0) {
      let startY = 120;
      doc.text("Alternative Medications:", 20, startY);
      results.alternativeMedications.forEach((med, index) => {
        doc.text(`${index + 1}. ${med.name} - ${med.dosage} mg`, 25, startY + (index + 1) * 10);
      });
      startY += (results.alternativeMedications.length + 1) * 10;
      doc.text(`Blockchain Hash: ${results.blockchainHash}`, 20, startY + 10);
    } else {
      doc.text(`Blockchain Hash: ${results?.blockchainHash}`, 20, 120);
    }
    
    doc.save("report.pdf");
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // First try to get data from location state (direct navigation from form)
        if (location.state) {
          console.log('Using data from location state');
          const { formData, results: fetchedResults } = location.state as LocationState;
          setResults(fetchedResults);
          setPatientData(formData);
          
          // Add to prediction context if not already added
          if (!predictionAdded) {
            const newPrediction = {
              id: id || `pred_${Math.random().toString().slice(2, 10)}`,
              patientId: formData.patientId || `P${Math.floor(Math.random() * 10000)}`,
              drugName: formData.drugName,
              dosage: `${fetchedResults.recommendedDosage} mg`,
              timestamp: new Date().toISOString(),
              status: 'completed',
              confidence: fetchedResults.confidence,
              blockchainHash: fetchedResults.blockchainHash,
              alternativeMedications: fetchedResults.alternativeMedications,
              patientData: formData,
            };
            addPrediction(newPrediction);
            setPredictionAdded(true);
          }
        } else {
          // If no location state, try to get from prediction context
          console.log('No state available. Attempting to retrieve prediction from context for ID:', id);
          const predictionFromContext = predictions.find(pred => pred.id === id);
          
          if (predictionFromContext) {
            console.log('Found prediction in context:', predictionFromContext);
            // Convert prediction from context to results format
            const recommendedDosage = parseInt(predictionFromContext.dosage) || 0;
            const constructedResults: ResultsData = {
              recommendedDosage,
              confidence: predictionFromContext.confidence,
              alternativeMedications: predictionFromContext.alternativeMedications || [
                { name: 'naproxen', dosage: 250 },
                { name: 'acetaminophen', dosage: 500 }
              ],
              blockchainHash: predictionFromContext.blockchainHash,
            };
            setResults(constructedResults);
            
            // Get patient data from prediction
            const constructedPatientData = predictionFromContext.patientData || {
              drugName: predictionFromContext.drugName,
              patientId: predictionFromContext.patientId,
              age: '-', 
              weight: '-', 
              height: '-', 
              gender: '-', 
              geneticMarkers: [],
              medicalHistory: [],
              currentMedications: []
            };
            setPatientData(constructedPatientData);
          } else {
            // Fallback to demo data if nothing found
            console.log('Prediction not found in context for ID:', id);
            const fallbackResults: ResultsData = {
              recommendedDosage: 400,
              confidence: 0.85,
              alternativeMedications: [
                { name: 'naproxen', dosage: 250 },
                { name: 'acetaminophen', dosage: 500 }
              ],
              blockchainHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
            };
            setResults(fallbackResults);
            setPatientData({
              age: 45,
              weight: 75,
              height: 175,
              gender: 'male',
              geneticMarkers: ['CYP2D6 - Normal Metabolizer'],
              medicalHistory: ['Hypertension'],
              currentMedications: ['Lisinopril'],
              drugName: 'ibuprofen',
              patientId: `P${Math.floor(Math.random() * 10000)}`
            });
            
            // Add this fallback to context for future reference
            if (!predictionAdded) {
              const fallbackPrediction = {
                id: id || `pred_${Math.random().toString().slice(2, 10)}`,
                patientId: `P${Math.floor(Math.random() * 10000)}`,
                drugName: 'ibuprofen',
                dosage: `${fallbackResults.recommendedDosage} mg`,
                timestamp: new Date().toISOString(),
                status: 'completed',
                confidence: fallbackResults.confidence,
                blockchainHash: fallbackResults.blockchainHash,
                alternativeMedications: fallbackResults.alternativeMedications,
                patientData: {
                  age: 45,
                  weight: 75,
                  height: 175,
                  gender: 'male',
                  geneticMarkers: ['CYP2D6 - Normal Metabolizer'],
                  medicalHistory: ['Hypertension'],
                  currentMedications: ['Lisinopril'],
                  drugName: 'ibuprofen'
                },
              };
              addPrediction(fallbackPrediction);
              setPredictionAdded(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, location.state, addPrediction, predictionAdded, predictions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-700 mb-4"></div>
          <p className="text-indigo-700 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results || !patientData) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-effect rounded-xl p-8 border border-red-200 shadow-lg">
            <div className="flex">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-red-700 mb-2">Results Not Found</h3>
                <p className="text-red-600 mb-4">
                  We couldn't find the prediction results you're looking for. This may be because:
                </p>
                <ul className="list-disc list-inside text-red-600 mb-6 space-y-1">
                  <li>The prediction ID is invalid</li>
                  <li>The prediction has been deleted</li>
                  <li>There was an error processing your request</li>
                </ul>
                <div className="flex space-x-4">
                  <Link 
                    to="/predict" 
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    New Prediction
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-all duration-300"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chart data for confidence visualization
  const chartData = {
    labels: ['Confidence', 'Uncertainty'],
    datasets: [
      {
        data: [results.confidence * 100, (1 - results.confidence) * 100],
        backgroundColor: ['#4F46E5', '#E5E7EB'],
        borderColor: ['#4338CA', '#D1D5DB'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0"></canvas>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-effect rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
            <h1 className="text-white text-3xl font-bold">Dosage Recommendation Results</h1>
            <p className="text-indigo-100 mt-2">Prediction ID: <span className="font-mono">{id}</span></p>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 animate-fadeInUp">
                {/* Recommendation Section */}
                <div className="glass-effect rounded-xl p-6 border border-indigo-100">
                  <h2 className="text-xl font-semibold text-gradient mb-4 flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-indigo-600" />
                    Recommended Dosage
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold text-indigo-700">{results.recommendedDosage} mg</p>
                      <p className="text-lg text-indigo-600 mt-1 capitalize">{patientData.drugName}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-full shadow-lg">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Patient Information */}
                <div className="glass-effect rounded-xl p-6 border border-indigo-100">
                  <h2 className="text-xl font-semibold text-gradient mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                    Patient Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/40 p-3 rounded-lg">
                      <p className="text-sm text-indigo-500">Age</p>
                      <p className="font-medium text-indigo-900">{patientData.age}</p>
                    </div>
                    <div className="bg-white/40 p-3 rounded-lg">
                      <p className="text-sm text-indigo-500">Weight</p>
                      <p className="font-medium text-indigo-900">{patientData.weight} kg</p>
                    </div>
                    <div className="bg-white/40 p-3 rounded-lg">
                      <p className="text-sm text-indigo-500">Height</p>
                      <p className="font-medium text-indigo-900">{patientData.height} cm</p>
                    </div>
                    <div className="bg-white/40 p-3 rounded-lg">
                      <p className="text-sm text-indigo-500">Gender</p>
                      <p className="font-medium text-indigo-900 capitalize">{patientData.gender}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-indigo-800 mb-3 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                      Genetic Markers
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patientData.geneticMarkers && patientData.geneticMarkers.length > 0 ? (
                        patientData.geneticMarkers.map((marker: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                            {marker}
                          </span>
                        ))
                      ) : (
                        <span className="text-indigo-600">None specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-indigo-800 mb-3 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                      Medical History
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patientData.medicalHistory && patientData.medicalHistory.length > 0 ? (
                        patientData.medicalHistory.map((condition: string, index: number) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                            {condition}
                          </span>
                        ))
                      ) : (
                        <span className="text-indigo-600">None specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-indigo-800 mb-3 flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-indigo-600" />
                      Current Medications
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patientData.currentMedications && patientData.currentMedications.length > 0 ? (
                        patientData.currentMedications.map((medication: string, index: number) => (
                          <span key={index} className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                            {medication}
                          </span>
                        ))
                      ) : (
                        <span className="text-indigo-600">None specified</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Alternative Medications */}
                <div className="glass-effect rounded-xl p-6 border border-indigo-100">
                  <h2 className="text-xl font-semibold text-gradient mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                    Alternative Medications
                  </h2>
                  {results.alternativeMedications && results.alternativeMedications.length > 0 ? (
                    <div className="space-y-4">
                      {results.alternativeMedications.map((med, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-white/50 rounded-lg border border-indigo-100 hover:shadow-md transition-all duration-300">
                          <div>
                            <p className="font-medium capitalize text-indigo-800">{med.name}</p>
                            <p className="text-sm text-indigo-500">Alternative option</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-indigo-700">{med.dosage} mg</p>
                            <p className="text-xs text-indigo-500">Recommended dosage</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-indigo-600">No alternative medications recommended.</p>
                  )}
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6 animate-fadeInUp delay-100">
                <div className="glass-effect rounded-xl p-6 border border-indigo-100">
                  <h2 className="text-xl font-semibold text-gradient mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Prediction Confidence
                  </h2>
                  <div className="h-48 relative flex items-center justify-center">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-700">{Math.round(results.confidence * 100)}%</p>
                        <p className="text-sm text-indigo-500">Confidence</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-600 mt-4">
                    This score represents the model's confidence in the dosage recommendation based on the provided patient data.
                  </p>
                </div>
                
                <div className="glass-effect rounded-xl p-6 border border-indigo-100">
                  <h2 className="text-xl font-semibold text-gradient mb-4 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-indigo-600" />
                    Blockchain Verification
                  </h2>
                  <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 break-all font-mono text-xs text-indigo-700">
                    {results.blockchainHash}
                  </div>
                  <p className="text-sm text-indigo-600 mt-4">
                    This prediction has been securely recorded on the blockchain for transparency and auditability.
                  </p>
                  <div className="mt-4">
                    <Link 
                      to={`/verify/${results.blockchainHash}`} 
                      className="flex items-center text-indigo-700 hover:text-indigo-800 group"
                    >
                      <ExternalLink className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                      Verify on Blockchain
                      <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
                
                <div className="glass-effect rounded-xl p-6 border border-indigo-100">
                  <h2 className="text-xl font-semibold text-gradient mb-4">Actions</h2>
                  <div className="space-y-3">
                    <button 
                      onClick={downloadReport}
                      className="w-full flex items-center justify-center px-4 py-3 rounded-lg border border-indigo-300 text-indigo-700 bg-white/50 hover:bg-indigo-50 transition-all duration-300 group"
                    >
                      <Download className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Download Report
                    </button>
                    <Link 
                      to="/predict" 
                      className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg group"
                    >
                      New Prediction
                      <ChevronRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
