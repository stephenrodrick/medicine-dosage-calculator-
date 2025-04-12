import * as tf from '@tensorflow/tfjs';

// Define interfaces for our data
export interface PatientSymptoms {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // in kg
  height: number; // in cm
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  bodyTemperature: number; // in Celsius
  symptoms: string[];
  familyHistory: string[];
  lifestyle: string[];
  bloodTests?: BloodTestResults;
}

export interface BloodTestResults {
  glucose: number;
  cholesterol: number;
  hemoglobin: number;
  whiteBloodCellCount: number;
  plateletCount: number;
}

export interface DiagnosisResult {
  disease: string;
  probability: number;
  relatedDiseases: Array<{name: string, probability: number}>;
  recommendedMedications: Array<{name: string, dosage: string, frequency: string, duration: string}>;
  recommendedDiet: DietRecommendation;
  recommendedLifestyleChanges: string[];
  followUpInDays: number;
}

export interface DietRecommendation {
  type: string; // e.g., "Low Sodium", "Diabetic", "Heart Healthy"
  dailyCalories: number;
  mealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  foodsToAvoid: string[];
  foodsToEat: string[];
  waterIntake: number; // in liters
  duration: number; // in days
}

// Symptom options for the form
// Make sure these exports are present
export const symptomOptions = [
  'Fever',
  'Cough',
  'Shortness of breath',
  'Fatigue',
  'Headache',
  'Sore throat',
  'Muscle pain',
  'Chest pain',
  'Abdominal pain',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Loss of taste or smell',
  'Rash',
  'Joint pain',
  'Dizziness',
  'Confusion'
];

export const familyHistoryOptions = [
  'Diabetes',
  'Heart disease',
  'Hypertension',
  'Cancer',
  'Stroke',
  'Asthma',
  'Alzheimer\'s disease',
  'Arthritis',
  'Depression',
  'Obesity'
];

export const lifestyleOptions = [
  'Smoking',
  'Alcohol consumption',
  'Sedentary lifestyle',
  'Regular exercise',
  'Balanced diet',
  'High stress levels',
  'Poor sleep',
  'Drug use'
];

// Disease database with associated symptoms, medications, and diet recommendations
const diseaseDatabase: Record<string, {
  symptoms: string[],
  riskFactors: string[],
  medications: Array<{name: string, dosage: string, frequency: string, duration: string}>,
  diet: DietRecommendation,
  lifestyleChanges: string[],
  followUpDays: number
}> = {
  'Hypertension': {
    symptoms: ['Headache', 'Dizziness', 'Shortness of Breath', 'Chest Pain', 'Blurred Vision'],
    riskFactors: ['Heart Disease', 'Diabetes', 'Obesity', 'Sedentary Lifestyle', 'High Stress', 'Smoking', 'Alcohol Consumption'],
    medications: [
      {name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing'},
      {name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing'},
      {name: 'Hydrochlorothiazide', dosage: '12.5mg', frequency: 'Once daily', duration: 'Ongoing'}
    ],
    diet: {
      type: 'Low Sodium',
      dailyCalories: 2000,
      mealPlan: {
        breakfast: ['Oatmeal with berries', 'Low-fat yogurt', 'Green tea'],
        lunch: ['Grilled chicken salad', 'Whole grain bread', 'Fresh fruit'],
        dinner: ['Baked fish', 'Steamed vegetables', 'Brown rice'],
        snacks: ['Unsalted nuts', 'Fresh fruit', 'Vegetable sticks']
      },
      foodsToAvoid: ['Processed foods', 'Canned soups', 'Deli meats', 'Fast food', 'Salty snacks'],
      foodsToEat: ['Fresh fruits', 'Vegetables', 'Whole grains', 'Lean proteins', 'Low-fat dairy'],
      waterIntake: 2.5,
      duration: 90
    },
    lifestyleChanges: ['Regular exercise', 'Stress management', 'Limit alcohol', 'Quit smoking', 'Regular sleep schedule'],
    followUpDays: 30
  },
  'Type 2 Diabetes': {
    symptoms: ['Frequent Urination', 'Excessive Thirst', 'Increased Hunger', 'Fatigue', 'Blurred Vision', 'Slow-healing Sores', 'Weight Loss'],
    riskFactors: ['Obesity', 'Sedentary Lifestyle', 'Family History of Diabetes', 'Heart Disease', 'High Stress', 'Fast Food Diet'],
    medications: [
      {name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: 'Ongoing'},
      {name: 'Glipizide', dosage: '5mg', frequency: 'Once daily before breakfast', duration: 'Ongoing'},
      {name: 'Januvia', dosage: '100mg', frequency: 'Once daily', duration: 'Ongoing'}
    ],
    diet: {
      type: 'Diabetic',
      dailyCalories: 1800,
      mealPlan: {
        breakfast: ['Egg white omelet with vegetables', 'Whole grain toast', 'Black coffee'],
        lunch: ['Grilled chicken breast', 'Quinoa', 'Steamed vegetables'],
        dinner: ['Baked fish', 'Lentils', 'Salad with olive oil dressing'],
        snacks: ['Greek yogurt', 'Handful of nuts', 'Apple with almond butter']
      },
      foodsToAvoid: ['Sugary drinks', 'White bread', 'White rice', 'Pastries', 'Candy', 'Fruit juice'],
      foodsToEat: ['Whole grains', 'Leafy greens', 'Fatty fish', 'Nuts', 'Beans', 'Citrus fruits'],
      waterIntake: 2.5,
      duration: 120
    },
    lifestyleChanges: ['Regular exercise', 'Weight management', 'Blood sugar monitoring', 'Foot care', 'Regular medical check-ups'],
    followUpDays: 60
  },
  'Asthma': {
    symptoms: ['Shortness of Breath', 'Chest Pain', 'Cough', 'Wheezing', 'Trouble Sleeping', 'Fatigue'],
    riskFactors: ['Family History of Asthma', 'Allergies', 'Smoking', 'Air Pollution', 'Respiratory Infections'],
    medications: [
      {name: 'Albuterol Inhaler', dosage: '2 puffs', frequency: 'As needed for symptoms', duration: 'Ongoing'},
      {name: 'Fluticasone Inhaler', dosage: '2 puffs', frequency: 'Twice daily', duration: 'Ongoing'},
      {name: 'Montelukast', dosage: '10mg', frequency: 'Once daily at bedtime', duration: 'Ongoing'}
    ],
    diet: {
      type: 'Anti-inflammatory',
      dailyCalories: 2000,
      mealPlan: {
        breakfast: ['Smoothie with berries and spinach', 'Chia seeds', 'Green tea'],
        lunch: ['Grilled salmon', 'Sweet potato', 'Broccoli'],
        dinner: ['Turkey breast', 'Quinoa', 'Roasted vegetables'],
        snacks: ['Walnuts', 'Apple', 'Carrot sticks']
      },
      foodsToAvoid: ['Sulfites', 'Processed foods', 'Wine', 'Dried fruits', 'Shrimp'],
      foodsToEat: ['Fatty fish', 'Fruits', 'Vegetables', 'Whole grains', 'Ginger', 'Turmeric'],
      waterIntake: 2.5,
      duration: 60
    },
    lifestyleChanges: ['Avoid triggers', 'Use air purifier', 'Regular exercise', 'Maintain healthy weight', 'Manage stress'],
    followUpDays: 90
  },
  'Coronary Artery Disease': {
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Pain in Arms or Shoulder', 'Fatigue', 'Dizziness', 'Nausea'],
    riskFactors: ['Heart Disease', 'Hypertension', 'Diabetes', 'Smoking', 'High Cholesterol', 'Obesity', 'Sedentary Lifestyle'],
    medications: [
      {name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: 'Ongoing'},
      {name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: 'Ongoing'},
      {name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', duration: 'Ongoing'}
    ],
    diet: {
      type: 'Heart Healthy',
      dailyCalories: 1800,
      mealPlan: {
        breakfast: ['Oatmeal with berries', 'Flaxseeds', 'Green tea'],
        lunch: ['Grilled chicken salad', 'Olive oil dressing', 'Whole grain bread'],
        dinner: ['Baked salmon', 'Quinoa', 'Steamed vegetables'],
        snacks: ['Almonds', 'Fresh fruit', 'Low-fat yogurt']
      },
      foodsToAvoid: ['Fried foods', 'Red meat', 'Butter', 'Full-fat dairy', 'Baked goods', 'Salt'],
      foodsToEat: ['Fatty fish', 'Olive oil', 'Nuts', 'Whole grains', 'Fruits', 'Vegetables', 'Legumes'],
      waterIntake: 2.5,
      duration: 90
    },
    lifestyleChanges: ['Regular exercise', 'Quit smoking', 'Stress management', 'Weight management', 'Limit alcohol'],
    followUpDays: 30
  },
  'Gastroesophageal Reflux Disease': {
    symptoms: ['Heartburn', 'Chest Pain', 'Difficulty Swallowing', 'Regurgitation', 'Sore Throat', 'Cough'],
    riskFactors: ['Obesity', 'Smoking', 'Alcohol Consumption', 'Fast Food Diet', 'High Stress'],
    medications: [
      {name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily before breakfast', duration: '8 weeks'},
      {name: 'Famotidine', dosage: '20mg', frequency: 'Twice daily', duration: 'As needed'},
      {name: 'Antacid', dosage: '10ml', frequency: 'As needed for symptoms', duration: 'As needed'}
    ],
    diet: {
      type: 'GERD Diet',
      dailyCalories: 2000,
      mealPlan: {
        breakfast: ['Oatmeal with banana', 'Non-citrus fruit', 'Herbal tea'],
        lunch: ['Grilled chicken sandwich on whole grain bread', 'Steamed vegetables', 'Water'],
        dinner: ['Baked fish', 'Brown rice', 'Steamed green vegetables'],
        snacks: ['Rice cakes', 'Non-citrus fruits', 'Low-fat yogurt']
      },
      foodsToAvoid: ['Spicy foods', 'Citrus fruits', 'Tomatoes', 'Chocolate', 'Coffee', 'Alcohol', 'Fatty foods'],
      foodsToEat: ['Oatmeal', 'Bananas', 'Melons', 'Lean proteins', 'Whole grains', 'Green vegetables'],
      waterIntake: 2.0,
      duration: 60
    },
    lifestyleChanges: ['Eat smaller meals', 'Don\'t lie down after eating', 'Elevate head of bed', 'Weight management', 'Quit smoking'],
    followUpDays: 45
  }
};

// Generate synthetic training data
export const generateSyntheticPatientData = (count: number): PatientSymptoms[] => {
  const patients: PatientSymptoms[] = [];
  
  for (let i = 0; i < count; i++) {
    const gender = ['male', 'female', 'other'][Math.floor(Math.random() * 2)] as 'male' | 'female' | 'other';
    const age = Math.floor(Math.random() * 70) + 18; // 18-88 years
    
    // Generate random symptoms (3-7 symptoms)
    const symptomCount = Math.floor(Math.random() * 5) + 3;
    const selectedSymptoms: string[] = [];
    for (let j = 0; j < symptomCount; j++) {
      const symptom = symptomOptions[Math.floor(Math.random() * symptomOptions.length)];
      if (!selectedSymptoms.includes(symptom)) {
        selectedSymptoms.push(symptom);
      }
    }
    
    // Generate random family history (0-3 conditions)
    const historyCount = Math.floor(Math.random() * 4);
    const selectedHistory: string[] = [];
    for (let j = 0; j < historyCount; j++) {
      const history = familyHistoryOptions[Math.floor(Math.random() * familyHistoryOptions.length)];
      if (!selectedHistory.includes(history) && history !== 'None') {
        selectedHistory.push(history);
      }
    }
    if (selectedHistory.length === 0) {
      selectedHistory.push('None');
    }
    
    // Generate random lifestyle factors (2-5 factors)
    const lifestyleCount = Math.floor(Math.random() * 4) + 2;
    const selectedLifestyle: string[] = [];
    for (let j = 0; j < lifestyleCount; j++) {
      const lifestyle = lifestyleOptions[Math.floor(Math.random() * lifestyleOptions.length)];
      if (!selectedLifestyle.includes(lifestyle)) {
        selectedLifestyle.push(lifestyle);
      }
    }
    
    // Generate weight based on gender and age
    let weight;
    if (gender === 'male') {
      weight = Math.floor(Math.random() * 40) + 60; // 60-100 kg
    } else {
      weight = Math.floor(Math.random() * 30) + 50; // 50-80 kg
    }
    
    // Generate height based on gender
    let height;
    if (gender === 'male') {
      height = Math.floor(Math.random() * 30) + 160; // 160-190 cm
    } else {
      height = Math.floor(Math.random() * 25) + 150; // 150-175 cm
    }
    
    // Generate blood pressure based on age and lifestyle
    let systolic = 120;
    let diastolic = 80;
    
    if (age > 50) {
      systolic += Math.floor(Math.random() * 30);
      diastolic += Math.floor(Math.random() * 15);
    }
    
    if (selectedLifestyle.includes('Smoking') || selectedLifestyle.includes('Alcohol Consumption')) {
      systolic += Math.floor(Math.random() * 20);
      diastolic += Math.floor(Math.random() * 10);
    }
    
    if (selectedLifestyle.includes('Regular Exercise')) {
      systolic -= Math.floor(Math.random() * 10);
      diastolic -= Math.floor(Math.random() * 5);
    }
    
    // Generate heart rate
    let heartRate = 70 + Math.floor(Math.random() * 30); // 70-100 bpm
    if (selectedLifestyle.includes('Regular Exercise')) {
      heartRate -= Math.floor(Math.random() * 15); // Lower for active people
    }
    
    // Generate body temperature (normal range with slight variations)
    const bodyTemperature = 36.5 + (Math.random() * 1.5); // 36.5-38.0 Celsius
    
    // Generate blood test results if needed
    const bloodTests = {
      glucose: 90 + Math.floor(Math.random() * 60), // 90-150 mg/dL
      cholesterol: 150 + Math.floor(Math.random() * 100), // 150-250 mg/dL
      hemoglobin: 12 + Math.random() * 6, // 12-18 g/dL
      whiteBloodCellCount: 4000 + Math.floor(Math.random() * 6000), // 4000-10000 cells/mcL
      plateletCount: 150000 + Math.floor(Math.random() * 300000) // 150000-450000 platelets/mcL
    };
    
    patients.push({
      id: `P${i + 1000}`,
      age,
      gender,
      weight,
      height,
      bloodPressureSystolic: systolic,
      bloodPressureDiastolic: diastolic,
      heartRate,
      bodyTemperature,
      symptoms: selectedSymptoms,
      familyHistory: selectedHistory,
      lifestyle: selectedLifestyle,
      bloodTests
    });
  }
  
  return patients;
};

// Feature extraction for the model
const extractFeatures = (patient: PatientSymptoms): number[] => {
  const features: number[] = [];
  
  // Normalize numerical features
  features.push(patient.age / 100); // Age normalized to 0-1 range
  features.push(patient.gender === 'male' ? 1 : 0); // Gender as binary feature
  features.push(patient.gender === 'female' ? 1 : 0);
  features.push(patient.weight / 150); // Weight normalized
  features.push(patient.height / 200); // Height normalized
  
  // BMI calculation
  const heightInMeters = patient.height / 100;
  const bmi = patient.weight / (heightInMeters * heightInMeters);
  features.push(bmi / 40); // BMI normalized
  
  // Blood pressure, heart rate, temperature
  features.push(patient.bloodPressureSystolic / 200);
  features.push(patient.bloodPressureDiastolic / 120);
  features.push(patient.heartRate / 200);
  features.push((patient.bodyTemperature - 35) / 5); // Normalize temp from 35-40C range
  
  // One-hot encoding for symptoms
  symptomOptions.forEach(symptom => {
    features.push(patient.symptoms.includes(symptom) ? 1 : 0);
  });
  
  // One-hot encoding for family history
  familyHistoryOptions.forEach(history => {
    features.push(patient.familyHistory.includes(history) ? 1 : 0);
  });
  
  // One-hot encoding for lifestyle
  lifestyleOptions.forEach(lifestyle => {
    features.push(patient.lifestyle.includes(lifestyle) ? 1 : 0);
  });
  
  // Blood test results if available
  if (patient.bloodTests) {
    features.push(patient.bloodTests.glucose / 200);
    features.push(patient.bloodTests.cholesterol / 300);
    features.push(patient.bloodTests.hemoglobin / 20);
    features.push(patient.bloodTests.whiteBloodCellCount / 15000);
    features.push(patient.bloodTests.plateletCount / 500000);
  } else {
    // Add placeholder values if blood tests not available
    features.push(0.5, 0.5, 0.5, 0.5, 0.5);
  }
  
  return features;
};

// Train the disease prediction model
export const trainDiseaseModel = async (): Promise<tf.LayersModel> => {
  // Generate synthetic training data
  const syntheticPatients = generateSyntheticPatientData(5000);
  
  // Prepare features and labels
  const features: number[][] = [];
  const labels: number[][] = [];
  
  // List of diseases for one-hot encoding
  const diseases = Object.keys(diseaseDatabase);
  
  syntheticPatients.forEach(patient => {
    features.push(extractFeatures(patient));
    
    // Determine the most likely disease based on symptoms and risk factors
    const diseaseScores = diseases.map(disease => {
      const diseaseInfo = diseaseDatabase[disease];
      let score = 0;
      
      // Score based on matching symptoms
      diseaseInfo.symptoms.forEach(symptom => {
        if (patient.symptoms.includes(symptom)) {
          score += 2;
        }
      });
      
      // Score based on matching risk factors
      diseaseInfo.riskFactors.forEach(factor => {
        if (patient.familyHistory.includes(factor) || patient.lifestyle.includes(factor)) {
          score += 1;
        }
      });
      
      return score;
    });
    
    // Find the disease with the highest score
    const maxScore = Math.max(...diseaseScores);
    const diseaseIndex = diseaseScores.indexOf(maxScore);
    
    // Create one-hot encoded label
    const label = new Array(diseases.length).fill(0);
    label[diseaseIndex] = 1;
    
    labels.push(label);
  });
  
  // Convert to tensors
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels);
  
  // Create the model
  const model = tf.sequential();
  
  // Input layer
  model.add(tf.layers.dense({
    inputShape: [features[0].length],
    units: 128,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  
  model.add(tf.layers.dropout({ rate: 0.3 }));
  
  // Hidden layers
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  // Output layer (one node per disease)
  model.add(tf.layers.dense({
    units: diseases.length,
    activation: 'softmax'
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  // Train the model
  await model.fit(xs, ys, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 5 })
  });
  
  // Clean up tensors
  xs.dispose();
  ys.dispose();
  
  return model;
};

// Make a prediction using the trained model
export const predictDisease = async (
  patient: PatientSymptoms,
  model: tf.LayersModel
): Promise<DiagnosisResult> => {
  // Extract features from patient data
  const features = extractFeatures(patient);
  
  // Convert to tensor
  const input = tf.tensor2d([features]);
  
  // Make prediction
  const prediction = model.predict(input) as tf.Tensor;
  const probabilities = await prediction.data();
  
  // Get the list of diseases
  const diseases = Object.keys(diseaseDatabase);
  
  // Find the disease with the highest probability
  let maxProbIndex = 0;
  let maxProb = probabilities[0];
  
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > maxProb) {
      maxProb = probabilities[i];
      maxProbIndex = i;
    }
  }
  
  const predictedDisease = diseases[maxProbIndex];
  
  // Get related diseases (next highest probabilities)
  const relatedDiseases: Array<{name: string, probability: number}> = [];
  
  for (let i = 0; i < probabilities.length; i++) {
    if (i !== maxProbIndex && probabilities[i] > 0.1) {
      relatedDiseases.push({
        name: diseases[i],
        probability: probabilities[i]
      });
    }
  }
  
  // Sort related diseases by probability
  relatedDiseases.sort((a, b) => b.probability - a.probability);
  
  // Take top 3 related diseases
  const topRelatedDiseases = relatedDiseases.slice(0, 3);
  
  // Get recommendations for the predicted disease
  const diseaseInfo = diseaseDatabase[predictedDisease];
  
  // Clean up tensors
  input.dispose();
  prediction.dispose();
  
  // Return diagnosis result
  return {
    disease: predictedDisease,
    probability: maxProb,
    relatedDiseases: topRelatedDiseases,
    recommendedMedications: diseaseInfo.medications,
    recommendedDiet: diseaseInfo.diet,
    recommendedLifestyleChanges: diseaseInfo.lifestyleChanges,
    followUpInDays: diseaseInfo.followUpDays
  };
};

// Diet recommendation model
export const recommendDiet = (
  diagnosis: DiagnosisResult,
  patient: PatientSymptoms
): DietRecommendation => {
  // Start with the base diet recommendation for the diagnosed disease
  const baseDiet = diagnosis.recommendedDiet;
  
  // Adjust calorie intake based on patient's BMI
  const heightInMeters = patient.height / 100;
  const bmi = patient.weight / (heightInMeters * heightInMeters);
  
  let adjustedCalories = baseDiet.dailyCalories;
  
  if (bmi > 30) {
    // Obese - reduce calories
    adjustedCalories = Math.round(baseDiet.dailyCalories * 0.8);
  } else if (bmi > 25) {
    // Overweight - slightly reduce calories
    adjustedCalories = Math.round(baseDiet.dailyCalories * 0.9);
  } else if (bmi < 18.5) {
    // Underweight - increase calories
    adjustedCalories = Math.round(baseDiet.dailyCalories * 1.2);
  }
  
  // Adjust water intake based on weight
  const adjustedWaterIntake = Math.round((patient.weight * 0.033) * 10) / 10;
  
  // Create personalized diet recommendation
  const personalizedDiet: DietRecommendation = {
  ...baseDiet,
  dailyCalories: adjustedCalories,
  waterIntake: adjustedWaterIntake
  };
  
  // Add specific recommendations based on blood test results if available
  if (patient.bloodTests) {
    // High cholesterol adjustments
    if (patient.bloodTests.cholesterol > 200) {
      personalizedDiet.foodsToAvoid = [
        ...personalizedDiet.foodsToAvoid,
        'High-fat dairy',
        'Fried foods',
        'Processed meats'
      ];
      personalizedDiet.foodsToEat = [
        ...personalizedDiet.foodsToEat,
        'Oats',
        'Beans',
        'Plant sterols'
      ];
    }
    
    // High glucose adjustments
    if (patient.bloodTests.glucose > 120) {
      personalizedDiet.foodsToAvoid = [
        ...personalizedDiet.foodsToAvoid,
        'White bread',
        'White rice',
        'Sugary drinks',
        'Candy'
      ];
      personalizedDiet.foodsToEat = [
        ...personalizedDiet.foodsToEat,
        'Whole grains',
        'Leafy greens',
        'Cinnamon',
        'Berries'
      ];
    }
    
    // Low hemoglobin adjustments
    if (patient.bloodTests.hemoglobin < 12) {
      personalizedDiet.foodsToEat = [
        ...personalizedDiet.foodsToEat,
        'Red meat',
        'Spinach',
        'Lentils',
        'Iron-fortified cereals'
      ];
    }
  }
  
  // Remove duplicates from food lists
  personalizedDiet.foodsToAvoid = [...new Set(personalizedDiet.foodsToAvoid)];
  personalizedDiet.foodsToEat = [...new Set(personalizedDiet.foodsToEat)];
  
  return personalizedDiet;
};

// Save the trained model
export const saveDiseaseModel = async (model: tf.LayersModel): Promise<void> => {
  try {
    await model.save('localstorage://disease-prediction-model');
    console.log('Disease prediction model saved successfully');
  } catch (error) {
    console.error('Error saving disease prediction model:', error);
  }
};

// Load the trained model
export const loadDiseaseModel = async (): Promise<tf.LayersModel | null> => {
  try {
    const model = await tf.loadLayersModel('localstorage://disease-prediction-model');
    console.log('Disease prediction model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading disease prediction model:', error);
    return null;
  }
};

// Mock function to get a diagnosis result for demo purposes
// Add this import at the top of the file
import { DietRecommendation } from './dietModel';

export const getMockDiagnosisResult = (patient: PatientSymptoms): DiagnosisResult => {
  // Initialize variables for disease prediction
  let disease = '';
  let probability = 0;
  let relatedDiseases: Array<{name: string, probability: number}> = [];
  
  // Create a scoring system for different diseases based on symptoms and other factors
  const diseaseScores: Record<string, number> = {
    'Common Cold': 0,
    'Influenza': 0,
    'COVID-19': 0,
    'Pneumonia': 0,
    'Bronchitis': 0,
    'Asthma': 0,
    'COPD': 0,
    'Coronary Artery Disease': 0,
    'Hypertension': 0,
    'Type 2 Diabetes': 0,
    'Migraine': 0,
    'Gastritis': 0,
    'Peptic Ulcer': 0,
    'Irritable Bowel Syndrome': 0,
    'Rheumatoid Arthritis': 0,
    'Osteoarthritis': 0,
    'Osteoporosis': 0,
    'Anemia': 0,
    'Hypothyroidism': 0,
    'Hyperthyroidism': 0
  };
  
  // Score based on symptoms
  // Respiratory conditions
  if (patient.symptoms.includes('Cough')) {
    diseaseScores['Common Cold'] += 2;
    diseaseScores['Influenza'] += 2;
    diseaseScores['COVID-19'] += 2;
    diseaseScores['Pneumonia'] += 3;
    diseaseScores['Bronchitis'] += 4;
    diseaseScores['Asthma'] += 2;
    diseaseScores['COPD'] += 3;
  }
  
  if (patient.symptoms.includes('Fever')) {
    diseaseScores['Common Cold'] += 1;
    diseaseScores['Influenza'] += 3;
    diseaseScores['COVID-19'] += 3;
    diseaseScores['Pneumonia'] += 3;
  }
  
  if (patient.symptoms.includes('Sore throat')) {
    diseaseScores['Common Cold'] += 3;
    diseaseScores['Influenza'] += 2;
    diseaseScores['COVID-19'] += 1;
  }
  
  if (patient.symptoms.includes('Runny nose')) {
    diseaseScores['Common Cold'] += 4;
    diseaseScores['Influenza'] += 1;
    diseaseScores['COVID-19'] += 1;
  }
  
  if (patient.symptoms.includes('Shortness of breath')) {
    diseaseScores['Pneumonia'] += 4;
    diseaseScores['Asthma'] += 5;
    diseaseScores['COPD'] += 5;
    diseaseScores['COVID-19'] += 3;
    diseaseScores['Coronary Artery Disease'] += 3;
  }
  
  if (patient.symptoms.includes('Wheezing')) {
    diseaseScores['Asthma'] += 5;
    diseaseScores['COPD'] += 4;
    diseaseScores['Bronchitis'] += 3;
  }
  
  // Cardiovascular conditions
  if (patient.symptoms.includes('Chest pain')) {
    diseaseScores['Coronary Artery Disease'] += 5;
    diseaseScores['Pneumonia'] += 2;
  }
  
  if (patient.bloodPressureSystolic > 140 || patient.bloodPressureDiastolic > 90) {
    diseaseScores['Hypertension'] += 5;
    diseaseScores['Coronary Artery Disease'] += 2;
  }
  
  // Neurological conditions
  if (patient.symptoms.includes('Headache')) {
    diseaseScores['Migraine'] += 4;
    diseaseScores['Hypertension'] += 2;
    diseaseScores['Common Cold'] += 1;
    diseaseScores['Influenza'] += 2;
  }
  
  if (patient.symptoms.includes('Dizziness')) {
    diseaseScores['Migraine'] += 3;
    diseaseScores['Hypertension'] += 2;
    diseaseScores['Anemia'] += 3;
  }
  
  // Gastrointestinal conditions
  if (patient.symptoms.includes('Abdominal pain')) {
    diseaseScores['Gastritis'] += 4;
    diseaseScores['Peptic Ulcer'] += 4;
    diseaseScores['Irritable Bowel Syndrome'] += 3;
  }
  
  if (patient.symptoms.includes('Nausea')) {
    diseaseScores['Gastritis'] += 3;
    diseaseScores['Peptic Ulcer'] += 3;
    diseaseScores['Influenza'] += 2;
    diseaseScores['Migraine'] += 2;
  }
  
  if (patient.symptoms.includes('Diarrhea')) {
    diseaseScores['Irritable Bowel Syndrome'] += 4;
    diseaseScores['Gastritis'] += 2;
    diseaseScores['COVID-19'] += 1;
  }
  
  // Musculoskeletal conditions
  if (patient.symptoms.includes('Joint pain')) {
    diseaseScores['Rheumatoid Arthritis'] += 5;
    diseaseScores['Osteoarthritis'] += 4;
  }
  
  if (patient.symptoms.includes('Muscle pain')) {
    diseaseScores['Influenza'] += 3;
    diseaseScores['COVID-19'] += 2;
    diseaseScores['Rheumatoid Arthritis'] += 1;
  }
  
  // Consider blood test results if available
  if (patient.bloodTests) {
    // Anemia indicators
    if (patient.bloodTests.hemoglobin < 12) {
      diseaseScores['Anemia'] += 5;
    }
    
    // Infection indicators
    if (patient.bloodTests.whiteBloodCellCount > 11000) {
      diseaseScores['Pneumonia'] += 2;
      diseaseScores['COVID-19'] += 2;
      diseaseScores['Influenza'] += 2;
    }
    
    // Diabetes indicators
    if (patient.bloodTests.glucose > 126) {
      diseaseScores['Type 2 Diabetes'] += 5;
    }
    
    // Cardiovascular risk indicators
    if (patient.bloodTests.cholesterol > 240) {
      diseaseScores['Coronary Artery Disease'] += 3;
      diseaseScores['Hypertension'] += 2;
    }
  }
  
  // Consider family history
  if (patient.familyHistory.includes('Diabetes')) {
    diseaseScores['Type 2 Diabetes'] += 2;
  }
  
  if (patient.familyHistory.includes('Heart Disease')) {
    diseaseScores['Coronary Artery Disease'] += 2;
    diseaseScores['Hypertension'] += 1;
  }
  
  if (patient.familyHistory.includes('Hypertension')) {
    diseaseScores['Hypertension'] += 2;
  }
  
  if (patient.familyHistory.includes('Asthma')) {
    diseaseScores['Asthma'] += 2;
  }
  
  if (patient.familyHistory.includes('Arthritis')) {
    diseaseScores['Rheumatoid Arthritis'] += 2;
    diseaseScores['Osteoarthritis'] += 2;
  }
  
  // Consider lifestyle factors
  if (patient.lifestyle.includes('Smoking')) {
    diseaseScores['COPD'] += 3;
    diseaseScores['Coronary Artery Disease'] += 2;
    diseaseScores['Pneumonia'] += 1;
    diseaseScores['Asthma'] += 1;
  }
  
  if (patient.lifestyle.includes('Alcohol Consumption')) {
    diseaseScores['Gastritis'] += 2;
    diseaseScores['Peptic Ulcer'] += 2;
    diseaseScores['Hypertension'] += 1;
  }
  
  if (patient.lifestyle.includes('Sedentary Lifestyle')) {
    diseaseScores['Type 2 Diabetes'] += 2;
    diseaseScores['Coronary Artery Disease'] += 2;
    diseaseScores['Hypertension'] += 2;
    diseaseScores['Osteoporosis'] += 1;
  }
  
  if (patient.lifestyle.includes('High Stress')) {
    diseaseScores['Hypertension'] += 2;
    diseaseScores['Migraine'] += 2;
    diseaseScores['Irritable Bowel Syndrome'] += 2;
  }
  
  // Age-related adjustments
  if (patient.age > 60) {
    diseaseScores['Coronary Artery Disease'] += 2;
    diseaseScores['Hypertension'] += 2;
    diseaseScores['Type 2 Diabetes'] += 1;
    diseaseScores['Osteoarthritis'] += 2;
    diseaseScores['Osteoporosis'] += 2;
  } else if (patient.age < 18) {
    diseaseScores['Asthma'] += 1;
    diseaseScores['Common Cold'] += 1;
  }
  
  // Find the disease with the highest score
  let maxScore = 0;
  let maxDisease = '';
  
  for (const [diseaseName, score] of Object.entries(diseaseScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxDisease = diseaseName;
    }
  }
  
  // If no clear disease is identified, default to Common Cold with low probability
  if (maxScore === 0) {
    disease = 'Common Cold';
    probability = 0.5;
  } else {
    disease = maxDisease;
    // Convert score to probability (normalize)
    probability = Math.min(0.99, maxScore / 10);
  }
  
  // Generate related diseases (next highest scores)
  const diseaseEntries = Object.entries(diseaseScores)
    .filter(([name]) => name !== disease)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  relatedDiseases = diseaseEntries.map(([name, score]) => ({
    name,
    probability: Math.min(0.95, score / 12)
  }));
  
  // Generate recommended medications based on the diagnosed disease
  const recommendedMedications = getRecommendedMedications(disease, patient);
  
  // Generate diet recommendation
  const recommendedDiet = getRecommendedDiet(disease, patient);
  
  // Generate lifestyle changes
  const recommendedLifestyleChanges = getRecommendedLifestyleChanges(disease, patient);
  
  // Determine follow-up period
  const followUpInDays = getFollowUpPeriod(disease, probability);
  
  return {
    disease,
    probability,
    relatedDiseases,
    recommendedMedications,
    recommendedDiet,
    recommendedLifestyleChanges,
    followUpInDays
  };
};

// Helper function to get recommended medications
const getRecommendedMedications = (disease: string, patient: PatientSymptoms): Array<{name: string, dosage: string, frequency: string, duration: string}> => {
  const medications: Array<{name: string, dosage: string, frequency: string, duration: string}> = [];
  
  switch (disease) {
    case 'Common Cold':
      medications.push(
        {
          name: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'Every 6 hours as needed',
          duration: '5 days'
        },
        {
          name: 'Dextromethorphan',
          dosage: '30mg',
          frequency: 'Every 6-8 hours as needed',
          duration: '5 days'
        }
      );
      break;
    case 'Influenza':
      medications.push(
        {
          name: 'Oseltamivir',
          dosage: '75mg',
          frequency: 'Twice daily',
          duration: '5 days'
        },
        {
          name: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'Every 6 hours as needed',
          duration: '5 days'
        }
      );
      break;
    case 'Pneumonia':
      medications.push(
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7-10 days'
        },
        {
          name: 'Azithromycin',
          dosage: '500mg',
          frequency: 'Once daily',
          duration: '5 days'
        }
      );
      break;
    case 'Coronary Artery Disease':
      medications.push(
        {
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: 'Ongoing'
        },
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: 'Ongoing'
        }
      );
      break;
    case 'Hypertension':
      medications.push(
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: 'Ongoing'
        },
        {
          name: 'Hydrochlorothiazide',
          dosage: '12.5mg',
          frequency: 'Once daily',
          duration: 'Ongoing'
        }
      );
      break;
    case 'Type 2 Diabetes':
      medications.push(
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: 'Ongoing'
        },
        {
          name: 'Glipizide',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: 'Ongoing'
        }
      );
      break;
    case 'Migraine':
      medications.push(
        {
          name: 'Sumatriptan',
          dosage: '50mg',
          frequency: 'As needed for migraine',
          duration: 'As needed'
        },
        {
          name: 'Propranolol',
          dosage: '40mg',
          frequency: 'Twice daily',
          duration: 'Ongoing for prevention'
        }
      );
      break;
    case 'Gastritis':
      medications.push(
        {
          name: 'Omeprazole',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: '14 days'
        },
        {
          name: 'Sucralfate',
          dosage: '1g',
          frequency: 'Four times daily',
          duration: '14 days'
        }
      );
      break;
    case 'Rheumatoid Arthritis':
      medications.push(
        {
          name: 'Methotrexate',
          dosage: '15mg',
          frequency: 'Once weekly',
          duration: 'Ongoing'
        },
        {
          name: 'Prednisone',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: 'As directed'
        }
      );
      break;
    default:
      medications.push(
        {
          name: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'Every 6 hours as needed',
          duration: '5 days'
        }
      );
  }
  
  return medications;
};

// Helper function to get recommended diet
const getRecommendedDiet = (disease: string, patient: PatientSymptoms): DietRecommendation => {
  let dietType = 'General Healthy';
  let foodsToAvoid: string[] = [];
  let foodsToEat: string[] = [];
  
  switch (disease) {
    case 'Hypertension':
      dietType = 'Low Sodium';
      foodsToAvoid = ['Processed foods', 'Canned soups', 'Deli meats', 'Fast food', 'Salty snacks'];
      foodsToEat = ['Fresh fruits', 'Fresh vegetables', 'Whole grains', 'Lean proteins', 'Low-fat dairy'];
      break;
    case 'Type 2 Diabetes':
      dietType = 'Diabetic';
      foodsToAvoid = ['Sugary drinks', 'White bread', 'White rice', 'Pastries', 'Candy', 'Fruit juice'];
      foodsToEat = ['Whole grains', 'Leafy greens', 'Fatty fish', 'Nuts', 'Beans', 'Berries'];
      break;
    case 'Coronary Artery Disease':
      dietType = 'Heart Healthy';
      foodsToAvoid = ['Fried foods', 'Red meat', 'Butter', 'Full-fat dairy', 'Baked goods', 'Salt'];
      foodsToEat = ['Fatty fish', 'Olive oil', 'Nuts', 'Whole grains', 'Fruits', 'Vegetables'];
      break;
    case 'Gastritis':
    case 'Peptic Ulcer':
      dietType = 'Gastric Friendly';
      foodsToAvoid = ['Spicy foods', 'Acidic foods', 'Alcohol', 'Coffee', 'Chocolate', 'Fried foods'];
      foodsToEat = ['Bananas', 'Rice', 'Applesauce', 'Toast', 'Yogurt', 'Lean proteins'];
      break;
    case 'Rheumatoid Arthritis':
    case 'Osteoarthritis':
      dietType = 'Anti-inflammatory';
      foodsToAvoid = ['Processed foods', 'Sugar', 'Alcohol', 'Red meat', 'Fried foods'];
      foodsToEat = ['Fatty fish', 'Olive oil', 'Nuts', 'Berries', 'Leafy greens', 'Turmeric'];
      break;
    default:
      dietType = 'General Healthy';
      foodsToAvoid = ['Processed foods', 'Excess sugar', 'Excess salt', 'Fried foods'];
      foodsToEat = ['Fruits', 'Vegetables', 'Whole grains', 'Lean proteins', 'Healthy fats'];
  }
  
  // Calculate BMI to adjust calorie intake
  const heightInMeters = patient.height / 100;
  const bmi = patient.weight / (heightInMeters * heightInMeters);
  
  // Base calories
  let dailyCalories = 2000;
  
  // Adjust calories based on BMI
  if (bmi > 30) {
    dailyCalories = 1800; // Reduce for obesity
  } else if (bmi > 25) {
    dailyCalories = 1900; // Reduce for overweight
  } else if (bmi < 18.5) {
    dailyCalories = 2200; // Increase for underweight
  }
  
  // Adjust for gender
  if (patient.gender === 'male') {
    dailyCalories += 200;
  }
  
  // Adjust for age
  if (patient.age > 60) {
    dailyCalories -= 200;
  } else if (patient.age < 18) {
    dailyCalories += 200;
  }
  
  return {
    type: dietType,
    dailyCalories,
    mealPlan: {
      breakfast: ['Oatmeal with berries', 'Green tea', 'Whole grain toast'],
      lunch: ['Grilled chicken salad', 'Quinoa', 'Fresh fruit'],
      dinner: ['Baked salmon', 'Steamed vegetables', 'Brown rice'],
      snacks: ['Nuts', 'Greek yogurt', 'Apple with almond butter']
    },
    foodsToAvoid,
    foodsToEat,
    waterIntake: Math.round((patient.weight * 0.033) * 10) / 10, // 0.033 liters per kg of body weight
    duration: 30
  };
};

// Helper function to get recommended lifestyle changes
const getRecommendedLifestyleChanges = (disease: string, patient: PatientSymptoms): string[] => {
  const commonRecommendations = [
    'Get 7-8 hours of sleep each night',
    'Stay hydrated throughout the day',
    'Practice stress management techniques'
  ];
  
  let specificRecommendations: string[] = [];
  
  switch (disease) {
    case 'Hypertension':
    case 'Coronary Artery Disease':
      specificRecommendations = [
        'Engage in moderate aerobic exercise for 30 minutes, 5 days a week',
        'Reduce sodium intake to less than 2,300mg per day',
        'Maintain a healthy weight',
        'Limit alcohol consumption',
        'Quit smoking'
      ];
      break;
    case 'Type 2 Diabetes':
      specificRecommendations = [
        'Monitor blood glucose levels regularly',
        'Exercise for at least 150 minutes per week',
        'Maintain a consistent meal schedule',
        'Limit carbohydrate intake',
        'Maintain a healthy weight'
      ];
      break;
    case 'Asthma':
    case 'COPD':
      specificRecommendations = [
        'Avoid known triggers (allergens, smoke, pollution)',
        'Use air purifiers at home',
        'Practice breathing exercises',
        'Quit smoking',
        'Get annual flu vaccine'
      ];
      break;
    case 'Rheumatoid Arthritis':
    case 'Osteoarthritis':
      specificRecommendations = [
        'Engage in low-impact exercises like swimming or cycling',
        'Apply heat or cold packs to affected joints',
        'Maintain a healthy weight to reduce joint stress',
        'Use assistive devices when needed',
        'Practice gentle stretching exercises'
      ];
      break;
    case 'Migraine':
      specificRecommendations = [
        'Identify and avoid personal migraine triggers',
        'Maintain a regular sleep schedule',
        'Stay hydrated',
        'Practice stress reduction techniques',
        'Consider keeping a migraine diary'
      ];
      break;
    default:
      specificRecommendations = [
        'Engage in regular physical activity',
        'Maintain a balanced diet',
        'Stay hydrated',
        'Avoid smoking and excessive alcohol'
      ];
  }
  
  return [...commonRecommendations, ...specificRecommendations];
};

// Helper function to determine follow-up period
const getFollowUpPeriod = (disease: string, probability: number): number => {
  // Base follow-up days
  let days = 14;
  
  // Adjust based on disease severity
  switch (disease) {
    case 'Common Cold':
    case 'Influenza':
      days = 7;
      break;
    case 'Pneumonia':
    case 'COVID-19':
      days = 5;
      break;
    case 'Coronary Artery Disease':
    case 'Hypertension':
    case 'Type 2 Diabetes':
      days = 30;
      break;
    case 'Rheumatoid Arthritis':
      days = 21;
      break;
    default:
      days = 14;
  }
  
  // Adjust based on probability (higher probability = more urgent follow-up)
  if (probability > 0.9) {
    days = Math.max(3, days - 7);
  } else if (probability < 0.7) {
    days += 7;
  }
  
  return days;
};

// Function to initialize the model (either load or train)
export const initializeDiseaseModel = async (): Promise<tf.LayersModel> => {
  console.log('Initializing disease prediction model...');
  
  // Try to load the model first
  const loadedModel = await loadDiseaseModel();
  
  if (loadedModel) {
    return loadedModel;
  }
  
  // If loading fails, train a new model
  console.log('No saved model found. Training new model...');
  const newModel = await trainDiseaseModel();
  
  // Save the newly trained model
  await saveDiseaseModel(newModel);
  
  return newModel;
};