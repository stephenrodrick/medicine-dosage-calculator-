import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  AlertCircle, 
  Pill, 
  Heart, 
  Apple, 
  Calendar, 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  Check,
  X,
  Brain,
  Shield,
  Activity,
  Zap,
  Users,
  Database
} from 'lucide-react';
import { 
  PatientSymptoms, 
  DiagnosisResult,
  getMockDiagnosisResult
} from '../ml/diseaseModel';
import { jsPDF } from 'jspdf';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Particle interface
interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
}

const DiagnosisResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientSymptoms | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  
  // Canvas animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  
  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    diagnosis: true,
    medications: true,
    diet: true,
    lifestyle: true,
    followUp: true
  });
  
  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Load diagnosis data on component mount
  useEffect(() => {
    const loadDiagnosisData = async () => {
      try {
        // Get data from location state
        if (location.state?.patientData) {
          const patient = location.state.patientData as PatientSymptoms;
          setPatientData(patient);
          
          // Check if diagnosis result was passed from previous page
          if (location.state?.diagnosisResult) {
            setDiagnosisResult(location.state.diagnosisResult);
            setLoading(false);
          } else {
            // If no diagnosis result was passed, generate one
            // In a real app, we would use the trained model
            // For demo purposes, we'll use the mock diagnosis function
            const result = getMockDiagnosisResult(patient);
            setDiagnosisResult(result);
            setLoading(false);
          }
        } else {
          setError('No patient data provided. Please go back and fill out the diagnosis form.');
          setLoading(false);
        }
      } catch (err) {
        setError('An error occurred while processing the diagnosis. Please try again.');
        setLoading(false);
      }
    };
    
    loadDiagnosisData();
  }, [location.state]);
  
  // Download PDF report
  const downloadReport = () => {
    if (!patientData || !diagnosisResult) return;
    
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(62, 64, 149); // Indigo color
    doc.text("MediDose AI - Medical Diagnosis Report", 20, 20);
    
    // Add patient information
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Patient Information", 20, 35);
    
    doc.setFontSize(10);
    doc.text(`Patient ID: ${patientData.id}`, 20, 45);
    doc.text(`Age: ${patientData.age}`, 20, 50);
    doc.text(`Gender: ${patientData.gender}`, 20, 55);
    doc.text(`Weight: ${patientData.weight} kg`, 20, 60);
    doc.text(`Height: ${patientData.height} cm`, 20, 65);
    doc.text(`Blood Pressure: ${patientData.bloodPressureSystolic}/${patientData.bloodPressureDiastolic} mmHg`, 20, 70);
    
    // Add diagnosis
    doc.setFontSize(14);
    doc.text("Diagnosis", 20, 85);
    
    doc.setFontSize(12);
    doc.setTextColor(62, 64, 149);
    doc.text(`Primary Diagnosis: ${diagnosisResult.disease}`, 20, 95);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Confidence: ${Math.round(diagnosisResult.probability * 100)}%`, 20, 105);
    
    // Add related conditions
    doc.text("Related Conditions:", 20, 115);
    diagnosisResult.relatedDiseases.forEach((disease, index) => {
      doc.text(`- ${disease.name} (${Math.round(disease.probability * 100)}%)`, 25, 125 + (index * 5));
    });
    
    // Add medications
    doc.setFontSize(14);
    doc.text("Recommended Medications", 20, 145);
    
    doc.setFontSize(10);
    diagnosisResult.recommendedMedications.forEach((med, index) => {
      doc.text(`- ${med.name}: ${med.dosage}, ${med.frequency}, for ${med.duration}`, 25, 155 + (index * 5));
    });
    
    // Add diet recommendations
    doc.setFontSize(14);
    doc.text("Diet Recommendations", 20, 175);
    
    doc.setFontSize(10);
    doc.text(`Diet Type: ${diagnosisResult.recommendedDiet.type}`, 20, 185);
    doc.text(`Daily Calories: ${diagnosisResult.recommendedDiet.dailyCalories} kcal`, 20, 190);
    doc.text(`Water Intake: ${diagnosisResult.recommendedDiet.waterIntake} liters per day`, 20, 195);
    
    // Add lifestyle changes
    doc.setFontSize(14);
    doc.text("Recommended Lifestyle Changes", 20, 215);
    
    doc.setFontSize(10);
    diagnosisResult.recommendedLifestyleChanges.forEach((change, index) => {
      // Limit to 5 recommendations to fit on page
      if (index < 5) {
        doc.text(`- ${change}`, 25, 225 + (index * 5));
      }
    });
    
    // Add follow-up information
    doc.setFontSize(14);
    doc.text("Follow-up", 20, 255);
    
    doc.setFontSize(10);
    doc.text(`Recommended follow-up in ${diagnosisResult.followUpInDays} days`, 20, 265);
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This report was generated by MediDose AI and should be reviewed by a healthcare professional.", 20, 280);
    
    // Save the PDF
    doc.save(`diagnosis_report_${patientData.id}.pdf`);
  };
  
  // Prepare chart data for diagnosis probability
  const prepareProbabilityChartData = () => {
    if (!diagnosisResult) return null;
    
    return {
      labels: ['Diagnosed', 'Uncertainty'],
      datasets: [
        {
          data: [
            Math.round(diagnosisResult.probability * 100),
            Math.round((1 - diagnosisResult.probability) * 100)
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(209, 213, 219, 0.5)'
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(209, 213, 219, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare chart data for related diseases
  const prepareRelatedDiseasesChartData = () => {
    if (!diagnosisResult) return null;
    
    return {
      labels: diagnosisResult.relatedDiseases.map(d => d.name),
      datasets: [
        {
          label: 'Probability (%)',
          data: diagnosisResult.relatedDiseases.map(d => Math.round(d.probability * 100)),
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Canvas animation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles: Particle[] = [];
    let lastTime = 0;
    const FPS = 30; // Limit FPS for better performance
    const fpsInterval = 1000 / FPS;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.2;
    };
    
    setCanvasDimensions();
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 20)); // Responsive particle count
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          color: `rgba(${99 + Math.random() * 20}, ${102 + Math.random() * 20}, ${241 + Math.random() * 14}, ${0.2 + Math.random() * 0.3})`,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5
        });
      }
      
      particlesRef.current = particles;
    };
    
    initParticles();
    
    // Animation loop
    const animate = (timestamp: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
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
      particlesRef.current.forEach(particle => {
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
    };
    
    // Start animation
    animationFrameIdRef.current = requestAnimationFrame(animate);
    
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
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-indigo-800">Processing Diagnosis...</h2>
          <p className="text-indigo-600 mt-2">Analyzing patient data and generating recommendations</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/diagnose')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Diagnosis Form
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render main content
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full -z-10"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/diagnose')}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Diagnosis Form
        </button>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Stethoscope className="h-8 w-8 mr-3 text-indigo-600" />
            Diagnosis Results
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered diagnosis and personalized recommendations for patient {patientData?.id}
          </p>
        </div>
        
        {/* Patient information card */}
        <div className="glass-effect rounded-xl p-6 mb-8 border border-indigo-100">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            Patient Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-indigo-400">Patient ID</div>
              <div className="font-medium text-indigo-900">{patientData?.id}</div>
            </div>
            <div>
              <div className="text-sm text-indigo-400">Age & Gender</div>
              <div className="font-medium text-indigo-900">{patientData?.age} years, {patientData?.gender}</div>
            </div>
            <div>
              <div className="text-sm text-indigo-400">Body Metrics</div>
              <div className="font-medium text-indigo-900">{patientData?.height} cm, {patientData?.weight} kg</div>
            </div>
            <div>
              <div className="text-sm text-indigo-400">Blood Pressure</div>
              <div className="font-medium text-indigo-900">{patientData?.bloodPressureSystolic}/{patientData?.bloodPressureDiastolic} mmHg</div>
            </div>
            <div>
              <div className="text-sm text-indigo-400">Heart Rate</div>
              <div className="font-medium text-indigo-900">{patientData?.heartRate} bpm</div>
            </div>
            <div>
              <div className="text-sm text-indigo-400">Body Temperature</div>
              <div className="font-medium text-indigo-900">{patientData?.bodyTemperature.toFixed(1)}°C</div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Diagnosis */}
          <div className="lg:col-span-2">
            {/* Diagnosis section */}
            <div className="glass-effect rounded-xl border border-indigo-100 overflow-hidden mb-8">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('diagnosis')}
              >
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Primary Diagnosis
                </h2>
                {expandedSections.diagnosis ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>
              
              {expandedSections.diagnosis && (
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center mb-6">
                    <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-4">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-2xl font-bold text-indigo-800 mb-2">{diagnosisResult?.disease}</h3>
                        <div className="flex items-center">
                          <div className="text-lg font-medium text-indigo-600">
                            {Math.round(diagnosisResult?.probability! * 100)}% confidence
                          </div>
                          {diagnosisResult?.probability! > 0.8 ? (
                            <div className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              High confidence
                            </div>
                          ) : (
                            <div className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Moderate confidence
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-indigo-400 mb-2">Symptoms Supporting Diagnosis</h4>
                          <div className="flex flex-wrap gap-2">
                            {patientData?.symptoms.map((symptom, index) => (
                              <span key={index} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-1/2 md:pl-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm h-full flex items-center justify-center">
                        <div className="w-48 h-48">
                          {prepareProbabilityChartData() && (
                            <Pie 
                              data={prepareProbabilityChartData()!} 
                              options={{
                                plugins: {
                                  legend: {
                                    position: 'bottom'
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context: any) {
                                        return `${context.label}: ${context.raw.toFixed(1)}%`;
                                      }
                                    }
                                  }
                                },
                                cutout: '60%'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-indigo-800 mb-4">Related Conditions</h3>
                    {diagnosisResult?.relatedDiseases.length === 0 ? (
                      <p className="text-gray-600">No related conditions identified.</p>
                    ) : (
                      <div className="space-y-3">
                        {diagnosisResult?.relatedDiseases.map((disease, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="font-medium text-indigo-700">{disease.name}</div>
                            <div className="flex items-center">
                              <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-indigo-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.round(disease.probability * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{Math.round(disease.probability * 100)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Medications section */}
            <div className="glass-effect rounded-xl border border-indigo-100 overflow-hidden mb-8">
              <div 
                className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('medications')}
              >
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  Recommended Medications
                </h2>
                {expandedSections.medications ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>
              
              {expandedSections.medications && (
                <div className="p-6">
                  {diagnosisResult?.recommendedMedications.length === 0 ? (
                    <p className="text-gray-600">No medications recommended at this time.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {diagnosisResult?.recommendedMedications.map((med, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                          <h3 className="text-lg font-medium text-indigo-800 mb-1">{med.name}</h3>
                          <div className="text-sm text-gray-600 mb-3">{med.dosage}</div>
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <div className="bg-indigo-100 p-1 rounded-full mr-2 mt-0.5">
                                <Clock className="h-3 w-3 text-indigo-600" />
                              </div>
                              <div className="text-sm text-gray-700">{med.frequency}</div>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-indigo-100 p-1 rounded-full mr-2 mt-0.5">
                                <Calendar className="h-3 w-3 text-indigo-600" />
                              </div>
                              <div className="text-sm text-gray-700">{med.duration}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Lifestyle section */}
            <div className="glass-effect rounded-xl border border-indigo-100 overflow-hidden mb-8">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('lifestyle')}
              >
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Lifestyle Recommendations
                </h2>
                {expandedSections.lifestyle ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>
              
              {expandedSections.lifestyle && (
                <div className="p-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {diagnosisResult?.recommendedLifestyleChanges.map((change, index) => (
                        <div key={index} className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-gray-700">{change}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Diet and Follow-up */}
          <div>
            {/* Diet section */}
            <div className="glass-effect rounded-xl border border-indigo-100 overflow-hidden mb-8">
              <div 
                className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('diet')}
              >
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Apple className="h-5 w-5 mr-2" />
                  Diet Recommendations
                </h2>
                {expandedSections.diet ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>
              
              {expandedSections.diet && (
                <div className="p-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                    <h3 className="text-lg font-medium text-indigo-800 mb-2">
                      {diagnosisResult?.recommendedDiet.type} Diet
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">Daily Calories</div>
                      <div className="font-medium text-indigo-700">{diagnosisResult?.recommendedDiet.dailyCalories} kcal</div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">Water Intake</div>
                      <div className="font-medium text-indigo-700">{diagnosisResult?.recommendedDiet.waterIntake} liters</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-medium text-indigo-700">{diagnosisResult?.recommendedDiet.duration} days</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-indigo-800 mb-4">Meal Plan Suggestions</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-indigo-600 mb-2">Breakfast</h4>
                        <ul className="list-disc list-inside text-gray-700 pl-2">
                          {diagnosisResult?.recommendedDiet.mealPlan.breakfast.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-indigo-600 mb-2">Lunch</h4>
                        <ul className="list-disc list-inside text-gray-700 pl-2">
                          {diagnosisResult?.recommendedDiet.mealPlan.lunch.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-indigo-600 mb-2">Dinner</h4>
                        <ul className="list-disc list-inside text-gray-700 pl-2">
                          {diagnosisResult?.recommendedDiet.mealPlan.dinner.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-indigo-600 mb-2">Snacks</h4>
                        <ul className="list-disc list-inside text-gray-700 pl-2">
                          {diagnosisResult?.recommendedDiet.mealPlan.snacks.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Follow-up section */}
          <div className="glass-effect rounded-xl border border-indigo-100 overflow-hidden mb-8">
            <div 
              className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('followUp')}
            >
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Follow-up Plan
              </h2>
              {expandedSections.followUp ? (
                <ChevronUp className="h-5 w-5 text-white" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white" />
              )}
            </div>
            
            {expandedSections.followUp && (
              <div className="p-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium text-center text-indigo-800 mb-2">
                    Follow-up in {diagnosisResult?.followUpInDays} days
                  </h3>
                  
                  <p className="text-center text-gray-600 mb-6">
                    {diagnosisResult?.followUpInDays <= 7 
                      ? 'Urgent follow-up required' 
                      : diagnosisResult?.followUpInDays <= 14 
                        ? 'Standard follow-up recommended' 
                        : 'Routine follow-up advised'}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="text-gray-700">
                        Schedule a follow-up appointment with your healthcare provider in {diagnosisResult?.followUpInDays} days.
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="text-gray-700">
                        Monitor your symptoms and report any changes to your healthcare provider.
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="text-gray-700">
                        Take all medications as prescribed and follow the recommended diet and lifestyle changes.
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-3 mt-0.5">
                        <Check className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="text-gray-700">
                        Bring this diagnosis report to your next appointment.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Data insights section */}
          <div className="glass-effect rounded-xl border border-indigo-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Insights
              </h2>
            </div>
            
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-indigo-800 mb-4">Related Conditions Analysis</h3>
                
                <div className="h-64">
                  {prepareRelatedDiseasesChartData() && (
                    <Bar 
                      data={prepareRelatedDiseasesChartData()!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Probability (%)'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Related Conditions'
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mb-16">
        <button
          onClick={downloadReport}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors flex items-center justify-center shadow-lg"
        >
          <Download className="h-5 w-5 mr-2" />
          Download PDF Report
        </button>
        
        <button
          onClick={() => navigate('/diagnose')}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-colors flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Diagnosis Form
        </button>
      </div>
    </div>
  );
};

// Add missing Clock component import
import { Clock } from 'lucide-react';

// Add glass effect styles to global CSS or as a component
const glassEffectStyle = `
  .glass-effect {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  }
`;

export default DiagnosisResultsPage;