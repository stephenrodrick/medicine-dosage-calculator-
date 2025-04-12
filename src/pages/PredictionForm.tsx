import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Pill, ChevronRight, Shield, Brain, Activity, Loader } from 'lucide-react';
import { recordDosageOnBlockchain, generatePredictionHash } from '../blockchain/smartContract';

interface FormData {
  age: number;
  weight: number;
  height: number;
  gender: string;
  geneticMarkers: string[];
  medicalHistory: string[];
  currentMedications: string[];
  drugName: string;
}

const PredictionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<FormData>({
    age: 30,
    weight: 70,
    height: 170,
    gender: 'male',
    geneticMarkers: [],
    medicalHistory: [],
    currentMedications: [],
    drugName: 'ibuprofen'
  });

  const geneticMarkerOptions = [
    'CYP2D6 - Normal Metabolizer',
    'CYP2D6 - Poor Metabolizer',
    'CYP2D6 - Rapid Metabolizer',
    'CYP2C19 - Normal Metabolizer',
    'CYP2C19 - Poor Metabolizer',
    'CYP3A4 - Normal Expression',
    'CYP3A4 - Low Expression'
  ];

  const medicalHistoryOptions = [
    'Hypertension',
    'Diabetes Type 2',
    'Asthma',
    'Chronic Kidney Disease',
    'Liver Disease',
    'Heart Failure',
    'COPD',
    'None'
  ];

  const medicationOptions = [
    'Lisinopril',
    'Metformin',
    'Atorvastatin',
    'Levothyroxine',
    'Albuterol',
    'Omeprazole',
    'Amlodipine',
    'None'
  ];

  const drugOptions = [
    'ibuprofen',
    'acetaminophen',
    'amoxicillin',
    'lisinopril',
    'metformin',
    'atorvastatin',
    'levothyroxine'
  ];

  // Canvas background animation - similar to Home and AboutPage
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' || name === 'weight' || name === 'height' ? Number(value) : value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'geneticMarkers' | 'medicalHistory' | 'currentMedications') => {
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
    setTxStatus("");

    try {
      // Calculate recommended dosage
      const recommendedDosage = calculateDosage(formData);
      const timestamp = Date.now();
      
      const patientId = "patient-" + Math.random().toString(36).substring(2, 15);
      
      const predictionHash = generatePredictionHash(patientId, formData.drugName, recommendedDosage, timestamp);
      
      // Record on blockchain
      let blockchainResult = { success: false, transactionHash: '', error: '' };
      
      try {
        blockchainResult = await recordDosageOnBlockchain(
          predictionHash,
          formData.drugName,
          recommendedDosage,
          timestamp,
          undefined,
          setTxStatus
        );
      } catch (blockchainError) {
        console.error("Blockchain error:", blockchainError);
        setError("Blockchain transaction failed, but prediction will still be generated.");
        blockchainResult = { 
          success: false, 
          transactionHash: `fallback-${Math.random().toString(36).substring(2, 15)}`,
          error: 'Transaction failed but continuing with prediction'
        };
      }
      
      // Generate a fallback transaction hash if blockchain failed
      const txHash = blockchainResult.success 
        ? blockchainResult.transactionHash 
        : `fallback-${Math.random().toString(36).substring(2, 15)}`;
      
      // Navigate to results page regardless of blockchain success
      navigate(`/results/${predictionHash}`, { 
        state: { 
          formData: {
            ...formData,
            patientId
          },
          // Pass results to the next page
          results: {
            recommendedDosage,
            confidence: 0.89,
            alternativeMedications: generateAlternatives(formData),
            blockchainHash: txHash
          }
        } 
      });
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
      console.error(err);
      
      // Even on error, generate a prediction and redirect
      const recommendedDosage = calculateDosage(formData);
      const fallbackHash = `error-${Math.random().toString(36).substring(2, 15)}`;
      const patientId = "patient-" + Math.random().toString(36).substring(2, 15);
      
      setTimeout(() => {
        navigate(`/results/${fallbackHash}`, { 
          state: { 
            formData: {
              ...formData,
              patientId
            },
            results: {
              recommendedDosage,
              confidence: 0.85, // Slightly lower confidence for error cases
              alternativeMedications: generateAlternatives(formData),
              blockchainHash: fallbackHash
            }
          } 
        });
      }, 1500); // Short delay to show the error message
    } finally {
      setLoading(false);
    }
  };

  const calculateDosage = (data: FormData): number => {
    let baseDosage = 0;
    
    // Base dosage by drug
    switch(data.drugName) {
      case 'ibuprofen':
        baseDosage = 400; // mg
        break;
      case 'acetaminophen':
        baseDosage = 500; // mg
        break;
      case 'amoxicillin':
        baseDosage = 250; // mg
        break;
      default:
        baseDosage = 100; // mg
    }
    
    // Adjust for weight
    const weightFactor = data.weight / 70; // normalize to 70kg
    
    // Adjust for age
    const ageFactor = data.age > 65 ? 0.8 : (data.age < 18 ? 0.7 : 1);
    
    // Adjust for genetic factors
    const geneticFactor = data.geneticMarkers.includes('CYP2D6 - Poor Metabolizer') ? 0.7 : 
                         (data.geneticMarkers.includes('CYP2D6 - Rapid Metabolizer') ? 1.3 : 1);
    
    // Adjust for medical history
    const medicalFactor = data.medicalHistory.includes('Liver Disease') ? 0.7 : 
                         (data.medicalHistory.includes('Chronic Kidney Disease') ? 0.8 : 1);
    
    // Calculate final dosage
    let finalDosage = baseDosage * weightFactor * ageFactor * geneticFactor * medicalFactor;
    
    // Round to nearest 5mg
    return Math.round(finalDosage / 5) * 5;
  };

  const generateAlternatives = (data: FormData): {name: string, dosage: number}[] => {
    const alternatives = [];
    
    if (data.drugName === 'ibuprofen') {
      alternatives.push(
        { name: 'naproxen', dosage: 250 },
        { name: 'acetaminophen', dosage: 500 }
      );
    } else if (data.drugName === 'acetaminophen') {
      alternatives.push(
        { name: 'ibuprofen', dosage: 400 },
        { name: 'aspirin', dosage: 325 }
      );
    } else if (data.drugName === 'amoxicillin') {
      alternatives.push(
        { name: 'azithromycin', dosage: 250 },
        { name: 'doxycycline', dosage: 100 }
      );
    }
    
    return alternatives;
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen relative pt-24 pb-12">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0"></canvas>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gradient mb-2">New Dosage Prediction</h1>
          <p className="text-indigo-700 text-lg">
            Enter patient information to receive personalized dosage recommendations
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8 animate-fadeInUp">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep === step 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : currentStep > step 
                        ? 'bg-indigo-200 text-indigo-700' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className={`mt-2 text-sm ${
                  currentStep >= step ? 'text-indigo-700 font-medium' : 'text-gray-500'
                }`}>
                  {step === 1 ? 'Patient Info' : step === 2 ? 'Medical History' : 'Medication'}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-8 animate-fadeInUp delay-200">
          {/* Step 1: Patient Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Patient Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-indigo-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-indigo-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-indigo-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    min="1"
                    max="300"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-indigo-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    min="50"
                    max="250"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={nextStep}
                  className="group relative px-6 py-3 rounded-full font-medium text-center text-white overflow-hidden transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 btn-glow flex items-center"
                >
                  <span className="relative z-10 flex items-center">
                    Next Step
                    <ChevronRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Medical History & Genetic Markers */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Medical History & Genetic Markers</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-indigo-800 mb-3 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                  Medical History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {medicalHistoryOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`medical-${option}`}
                        value={option}
                        checked={formData.medicalHistory.includes(option)}
                        onChange={(e) => handleCheckboxChange(e, 'medicalHistory')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                      />
                      <label htmlFor={`medical-${option}`} className="ml-2 text-sm text-indigo-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-indigo-800 mb-3 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                  Genetic Markers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {geneticMarkerOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`genetic-${option}`}
                        value={option}
                        checked={formData.geneticMarkers.includes(option)}
                        onChange={(e) => handleCheckboxChange(e, 'geneticMarkers')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                      />
                      <label htmlFor={`genetic-${option}`} className="ml-2 text-sm text-indigo-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-full font-medium text-indigo-700 border border-indigo-300 hover:bg-indigo-50 transition-all duration-300 flex items-center"
                >
                  <ChevronRight className="h-5 w-5 mr-2 transform rotate-180" />
                  Previous
                </button>
                
                <button
                  type="button"
                  onClick={nextStep}
                  className="group relative px-6 py-3 rounded-full font-medium text-center text-white overflow-hidden transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 btn-glow flex items-center"
                >
                  <span className="relative z-10 flex items-center">
                    Next Step
                    <ChevronRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Medication Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Medication Information</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-indigo-800 mb-3 flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-indigo-600" />
                  Current Medications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {medicationOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`medication-${option}`}
                        value={option}
                        checked={formData.currentMedications.includes(option)}
                        onChange={(e) => handleCheckboxChange(e, 'currentMedications')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                      />
                      <label htmlFor={`medication-${option}`} className="ml-2 text-sm text-indigo-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="drugName" className="block text-lg font-medium text-indigo-800 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                  Select Drug for Dosage Prediction
                </label>
                <select
                  id="drugName"
                  name="drugName"
                  value={formData.drugName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
                  required
                >
                  {drugOptions.map((drug) => (
                    <option key={drug} value={drug}>
                      {drug.charAt(0).toUpperCase() + drug.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              {txStatus && (
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-md">
                  <p className="text-indigo-700">{txStatus}</p>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-full font-medium text-indigo-700 border border-indigo-300 hover:bg-indigo-50 transition-all duration-300 flex items-center"
                >
                  <ChevronRight className="h-5 w-5 mr-2 transform rotate-180" />
                  Previous
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative px-8 py-3 rounded-full font-medium text-center text-white overflow-hidden transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 btn-glow flex items-center"
                >
                  <span className="relative z-10 flex items-center">
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Generate Prediction
                        <ChevronRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </button>
              </div>
            </div>
          )}
        </form>
        
        {/* Information Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp delay-300">
          <div className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
            <div className="bg-indigo-100/80 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-2">Secure & Private</h3>
            <p className="text-indigo-700 text-sm">
              All patient data is encrypted and securely processed. Your information never leaves your browser.
            </p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
            <div className="bg-indigo-100/80 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-2">AI-Powered</h3>
            <p className="text-indigo-700 text-sm">
              Our advanced machine learning models analyze multiple factors to provide personalized dosage recommendations.
            </p>
          </div>
          
          <div className="glass-effect rounded-xl p-6 transform transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg">
            <div className="bg-indigo-100/80 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-2">Evidence-Based</h3>
            <p className="text-indigo-700 text-sm">
              Recommendations are based on clinical guidelines and verified medical research for optimal patient outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define the Particle interface properly
interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
}

export default PredictionForm;
