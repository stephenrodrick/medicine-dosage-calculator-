import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  AlertCircle, 
  Loader, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  Brain,
  Shield,
  Activity,
  Heart,
  Pill,
  Users,
  Thermometer,
  Droplets,
  Dna,
  Clock
} from 'lucide-react';
import { 
  PatientSymptoms, 
  symptomOptions, 
  familyHistoryOptions, 
  lifestyleOptions,
  initializeDiseaseModel,
  getMockDiagnosisResult
} from '../ml/diseaseModel';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
}

const DiagnosePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Form sections expanded state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    vitals: false,
    symptoms: false,
    history: false,
    lifestyle: false,
    bloodTests: false
  });
  
  // Form data
  const [formData, setFormData] = useState<PatientSymptoms>({
    id: `P${Math.floor(Math.random() * 10000)}`,
    age: 35,
    gender: 'male',
    weight: 70,
    height: 170,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 75,
    bodyTemperature: 36.6,
    symptoms: [],
    familyHistory: [],
    lifestyle: [],
    bloodTests: {
      glucose: 95,
      cholesterol: 180,
      hemoglobin: 14,
      whiteBloodCellCount: 7000,
      plateletCount: 250000
    }
  });
  
  // Load model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        // In a production app, we would load a pre-trained model
        // For demo purposes, we'll use a mock model or initialize a simple one
        setModelLoading(true);
        
        // Try to initialize the model (this will either load a saved model or train a new one)
        // For demo purposes, we'll just simulate loading time
        setTimeout(() => {
          setModelLoading(false);
        }, 2000);
        
        // Uncomment this for actual model loading:
        // const loadedModel = await initializeDiseaseModel();
        // setModel(loadedModel);
        // setModelLoading(false);
      } catch (err) {
        setError('Failed to load diagnosis model. Please try again later.');
        setModelLoading(false);
      }
    };
    
    loadModel();
  }, []);
  
  // Canvas background animation - similar to Home and Dashboard
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles: Particle[] = [];
    let animationFrameId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // Limit to 30 FPS for better performance
    
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
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (['age', 'weight', 'height', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'heartRate'].includes(name)) {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else if (name === 'bodyTemperature') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleBloodTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      bloodTests: {
        ...formData.bloodTests!,
        [name]: parseInt(value) || 0
      }
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'symptoms' | 'familyHistory' | 'lifestyle') => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        [category]: [...formData[category], value]
      });
    } else {
      setFormData({
        ...formData,
        [category]: formData[category].filter(item => item !== value)
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Generate a diagnosis result
      // In a real app, we would use the trained model to make a prediction
      // For demo purposes, we'll use the mock diagnosis function
      const diagnosisResult = getMockDiagnosisResult(formData);
      
      // Navigate to results page with form data and diagnosis result
      navigate('/diagnosis-results', { 
        state: { 
          patientData: formData,
          diagnosisResult: diagnosisResult
        } 
      });
    } catch (err) {
      setError('An error occurred while processing your diagnosis. Please try again.');
      setLoading(false);
    }
  };
  
  if (modelLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-700 mb-4"></div>
          <p className="text-indigo-700 font-medium">Loading diagnosis model...</p>
          <p className="text-indigo-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative pt-24 pb-12">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0"></canvas>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-effect rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
            <h1 className="text-white text-3xl font-bold flex items-center">
              <Stethoscope className="h-8 w-8 mr-3" />
              Medical Diagnosis
            </h1>
            <p className="text-indigo-100 mt-2">
              Enter patient information to receive an AI-powered diagnosis
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Basic Information Section */}
            <div className="glass-effect rounded-xl p-6 border border-indigo-100">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('basic')}
              >
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Basic Information
                </h2>
                {expandedSections.basic ? 
                  <ChevronUp className="h-5 w-5 text-indigo-600" /> : 
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                }
              </div>
              
              {expandedSections.basic && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      min="1"
                      max="300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      min="50"
                      max="250"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Vital Signs Section */}
            <div className="glass-effect rounded-xl p-6 border border-indigo-100">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('vitals')}
              >
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-indigo-600" />
                  Vital Signs
                </h2>
                {expandedSections.vitals ? 
                  <ChevronUp className="h-5 w-5 text-indigo-600" /> : 
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                }
              </div>
              
              {expandedSections.vitals && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Blood Pressure (Systolic)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="bloodPressureSystolic"
                        value={formData.bloodPressureSystolic}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                        min="70"
                        max="250"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">mmHg</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Blood Pressure (Diastolic)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="bloodPressureDiastolic"
                        value={formData.bloodPressureDiastolic}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                        min="40"
                        max="150"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">mmHg</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Heart Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="heartRate"
                        value={formData.heartRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                        min="40"
                        max="200"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">bpm</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Body Temperature
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="bodyTemperature"
                        value={formData.bodyTemperature}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                        min="35"
                        max="42"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">°C</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Symptoms Section */}
            <div className="glass-effect rounded-xl p-6 border border-indigo-100">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('symptoms')}
              >
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                  Symptoms
                </h2>
                {expandedSections.symptoms ? 
                  <ChevronUp className="h-5 w-5 text-indigo-600" /> : 
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                }
              </div>
              
              {expandedSections.symptoms && (
                <div className="mt-4">
                  <p className="text-indigo-600 mb-4 text-sm">Select all symptoms that apply:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {symptomOptions.map(symptom => (
                      <div key={symptom} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`symptom-${symptom}`}
                          value={symptom}
                          checked={formData.symptoms.includes(symptom)}
                          onChange={e => handleCheckboxChange(e, 'symptoms')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                        />
                        <label htmlFor={`symptom-${symptom}`} className="ml-2 text-sm text-indigo-700">
                          {symptom}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Family History Section */}
            <div className="glass-effect rounded-xl p-6 border border-indigo-100">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('history')}
              >
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                  <Dna className="h-5 w-5 mr-2 text-indigo-600" />
                  Family History
                </h2>
                {expandedSections.history ? 
                  <ChevronUp className="h-5 w-5 text-indigo-600" /> : 
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                }
              </div>
              
              {expandedSections.history && (
                <div className="mt-4">
                  <p className="text-indigo-600 mb-4 text-sm">Select all conditions that run in your family:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {familyHistoryOptions.map(history => (
                      <div key={history} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`history-${history}`}
                          value={history}
                          checked={formData.familyHistory.includes(history)}
                          onChange={e => handleCheckboxChange(e, 'familyHistory')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                        />
                        <label htmlFor={`history-${history}`} className="ml-2 text-sm text-indigo-700">
                          {history}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Lifestyle Section */}
            <div className="glass-effect rounded-xl p-6 border border-indigo-100">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('lifestyle')}
              >
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Lifestyle Factors
                </h2>
                {expandedSections.lifestyle ? 
                  <ChevronUp className="h-5 w-5 text-indigo-600" /> : 
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                }
              </div>
              
              {expandedSections.lifestyle && (
                <div className="mt-4">
                  <p className="text-indigo-600 mb-4 text-sm">Select all lifestyle factors that apply:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {lifestyleOptions.map(lifestyle => (
                      <div key={lifestyle} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`lifestyle-${lifestyle}`}
                          value={lifestyle}
                          checked={formData.lifestyle.includes(lifestyle)}
                          onChange={e => handleCheckboxChange(e, 'lifestyle')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                        />
                        <label htmlFor={`lifestyle-${lifestyle}`} className="ml-2 text-sm text-indigo-700">
                          {lifestyle}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Blood Tests Section */}
            <div className="glass-effect rounded-xl p-6 border border-indigo-100">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('bloodTests')}
              >
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-indigo-600" />
                  Blood Tests
                </h2>
                {expandedSections.bloodTests ? 
                  <ChevronUp className="h-5 w-5 text-indigo-600" /> : 
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                }
              </div>
              
              {expandedSections.bloodTests && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Glucose
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="glucose"
                        value={formData.bloodTests?.glucose}
                        onChange={handleBloodTestChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">mg/dL</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Cholesterol
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="cholesterol"
                        value={formData.bloodTests?.cholesterol}
                        onChange={handleBloodTestChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">mg/dL</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Hemoglobin
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="hemoglobin"
                        value={formData.bloodTests?.hemoglobin}
                        onChange={handleBloodTestChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">g/dL</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      White Blood Cell Count
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="whiteBloodCellCount"
                        value={formData.bloodTests?.whiteBloodCellCount}
                        onChange={handleBloodTestChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">cells/μL</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Platelet Count
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="plateletCount"
                        value={formData.bloodTests?.plateletCount}
                        onChange={handleBloodTestChange}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                        min="50000"
                        max="500000"
                        step="1000"
                      />
                      <span className="absolute right-3 top-2 text-indigo-400 text-sm">cells/μL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit button */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`
                  px-8 py-3 rounded-lg text-white font-medium text-lg shadow-lg
                  ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}
                  transition-all duration-200 flex items-center
                `}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-3" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-5 w-5 mr-3" />
                    Generate Diagnosis
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Information Panel */}
          <div className="bg-indigo-50/70 p-6 border-t border-indigo-100">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-full mr-4">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-indigo-800 mb-1">How It Works</h3>
                <p className="text-indigo-600 text-sm">
                  Our AI-powered diagnosis system analyzes patient data to identify potential conditions. 
                  The more information you provide, the more accurate the diagnosis will be. 
                  This tool is designed to assist healthcare professionals and should not replace professional medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="glass-effect rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">AI-Powered Analysis</h3>
            <p className="text-indigo-600 text-sm">
              Our advanced machine learning algorithms analyze patient data to identify potential conditions with high accuracy.
            </p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Privacy Protected</h3>
            <p className="text-indigo-600 text-sm">
              All patient data is encrypted and processed securely. We prioritize privacy and comply with healthcare data regulations.
            </p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Comprehensive Results</h3>
            <p className="text-indigo-600 text-sm">
              Receive detailed diagnosis reports with potential conditions, confidence scores, and recommended next steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosePage;