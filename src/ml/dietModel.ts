import * as tf from '@tensorflow/tfjs';
import { PatientSymptoms, DiagnosisResult } from './diseaseModel';

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

// Diet types with their base meal plans
const dietTypes: Record<string, {
  baseMealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  },
  foodsToAvoid: string[];
  foodsToEat: string[];
  baseCalories: number;
}> = {
  'Low Sodium': {
    baseMealPlan: {
      breakfast: ['Oatmeal with fresh fruit', 'Egg whites with vegetables', 'Whole grain toast with avocado'],
      lunch: ['Grilled chicken salad', 'Quinoa bowl with vegetables', 'Homemade soup with fresh ingredients'],
      dinner: ['Baked fish with herbs', 'Steamed vegetables', 'Brown rice or sweet potato'],
      snacks: ['Fresh fruit', 'Unsalted nuts', 'Yogurt', 'Vegetable sticks']
    },
    foodsToAvoid: ['Processed foods', 'Canned soups', 'Deli meats', 'Fast food', 'Salty snacks', 'Condiments', 'Pickled foods'],
    foodsToEat: ['Fresh fruits', 'Fresh vegetables', 'Whole grains', 'Lean proteins', 'Low-fat dairy', 'Herbs and spices'],
    baseCalories: 2000
  },
  'Diabetic': {
    baseMealPlan: {
      breakfast: ['Egg white omelet with vegetables', 'Steel-cut oatmeal with cinnamon', 'Greek yogurt with berries'],
      lunch: ['Grilled chicken with quinoa', 'Lentil soup with vegetables', 'Tuna salad with olive oil'],
      dinner: ['Baked fish', 'Roasted vegetables', 'Small portion of whole grains'],
      snacks: ['Handful of nuts', 'Apple with almond butter', 'Cheese stick', 'Vegetable sticks']
    },
    foodsToAvoid: ['Sugary drinks', 'White bread', 'White rice', 'Pastries', 'Candy', 'Fruit juice', 'Processed foods'],
    foodsToEat: ['Whole grains', 'Leafy greens', 'Fatty fish', 'Nuts', 'Beans', 'Citrus fruits', 'Berries'],
    baseCalories: 1800
  },
  'Heart Healthy': {
    baseMealPlan: {
      breakfast: ['Oatmeal with berries', 'Whole grain toast with avocado', 'Smoothie with greens and fruit'],
      lunch: ['Salmon salad with olive oil', 'Vegetable soup with beans', 'Quinoa bowl with vegetables'],
      dinner: ['Grilled fish or lean poultry', 'Steamed vegetables', 'Brown rice or sweet potato'],
      snacks: ['Nuts', 'Fresh fruit', 'Dark chocolate (small piece)', 'Yogurt']
    },
    foodsToAvoid: ['Fried foods', 'Red meat', 'Butter', 'Full-fat dairy', 'Baked goods', 'Salt', 'Processed foods'],
    foodsToEat: ['Fatty fish', 'Olive oil', 'Nuts', 'Whole grains', 'Fruits', 'Vegetables', 'Legumes'],
    baseCalories: 1800
  },
  'Anti-inflammatory': {
    baseMealPlan: {
      breakfast: ['Smoothie with berries and spinach', 'Chia seed pudding', 'Turmeric oatmeal with fruit'],
      lunch: ['Grilled salmon with vegetables', 'Quinoa salad with olive oil', 'Lentil soup'],
      dinner: ['Baked fish with herbs', 'Roasted vegetables with turmeric', 'Brown rice or sweet potato'],
      snacks: ['Walnuts', 'Berries', 'Green tea', 'Dark chocolate (small piece)']
    },
    foodsToAvoid: ['Processed foods', 'Fried foods', 'Refined carbohydrates', 'Sugar', 'Red meat', 'Alcohol'],
    foodsToEat: ['Fatty fish', 'Olive oil', 'Nuts', 'Berries', 'Leafy greens', 'Turmeric', 'Ginger', 'Green tea'],
    baseCalories: 2000
  },
  'Weight Management': {
    baseMealPlan: {
      breakfast: ['Protein smoothie', 'Egg whites with vegetables', 'Greek yogurt with berries'],
      lunch: ['Large salad with lean protein', 'Vegetable soup with beans', 'Grilled chicken with vegetables'],
      dinner: ['Baked fish or lean poultry', 'Large portion of vegetables', 'Small portion of whole grains'],
      snacks: ['Apple', 'Protein bar', 'Vegetable sticks with hummus', 'Greek yogurt']
    },
    foodsToAvoid: ['Sugary drinks', 'Processed foods', 'Fried foods', 'Refined carbohydrates', 'Alcohol', 'High-calorie desserts'],
    foodsToEat: ['Lean proteins', 'Vegetables', 'Fruits', 'Whole grains', 'Low-fat dairy', 'Water'],
    baseCalories: 1600
  }
};

// Generate a personalized diet recommendation based on diagnosis and patient data
export const generateDietRecommendation = (diagnosis: DiagnosisResult, patient: PatientSymptoms): DietRecommendation => {
  // Determine the appropriate diet type based on the diagnosed disease
  let dietType = 'Heart Healthy'; // Default diet type
  
  // Map diseases to diet types
  const diseaseToDietMap: Record<string, string> = {
    'Hypertension': 'Low Sodium',
    'Type 2 Diabetes': 'Diabetic',
    'Coronary Artery Disease': 'Heart Healthy',
    'Asthma': 'Anti-inflammatory',
    'Obesity': 'Weight Management'
  };
  
  if (diagnosis.disease in diseaseToDietMap) {
    dietType = diseaseToDietMap[diagnosis.disease];
  }
  
  // Get the base diet plan
  const baseDiet = dietTypes[dietType];
  
  // Calculate BMI to adjust calorie intake
  const heightInMeters = patient.height / 100;
  const bmi = patient.weight / (heightInMeters * heightInMeters);
  
  // Adjust calories based on BMI, age, gender, and activity level
  let calorieAdjustment = 1.0;
  
  // BMI adjustments
  if (bmi > 30) {
    calorieAdjustment *= 0.85; // Reduce calories for obesity
  } else if (bmi > 25) {
    calorieAdjustment *= 0.9; // Reduce calories for overweight
  } else if (bmi < 18.5) {
    calorieAdjustment *= 1.15; // Increase calories for underweight
  }
  
  // Age adjustments
  if (patient.age > 60) {
    calorieAdjustment *= 0.9; // Older adults need fewer calories
  } else if (patient.age < 30) {
    calorieAdjustment *= 1.1; // Younger adults may need more calories
  }
  
  // Gender adjustments
  if (patient.gender === 'male') {
    calorieAdjustment *= 1.1; // Men typically need more calories
  }
  
  // Activity level adjustments
  if (patient.lifestyle.includes('Regular Exercise')) {
    calorieAdjustment *= 1.2; // More calories for active individuals
  } else if (patient.lifestyle.includes('Sedentary Lifestyle')) {
    calorieAdjustment *= 0.9; // Fewer calories for sedentary individuals
  }
  
  // Calculate final calorie recommendation
  const dailyCalories = Math.round(baseDiet.baseCalories * calorieAdjustment);
  
  // Calculate water intake based on weight (0.033 liters per kg of body weight)
  const waterIntake = Math.round((patient.weight * 0.033) * 10) / 10;
  
  // Determine diet duration based on disease severity and type
  let duration = 90; // Default 90 days
  if (diagnosis.probability > 0.8) {
    duration = 120; // Longer duration for high probability diagnoses
  } else if (diagnosis.probability < 0.6) {
    duration = 60; // Shorter initial period for less certain diagnoses
  }
  
  // Create the personalized diet recommendation
  return {
    type: dietType,
    dailyCalories,
    mealPlan: baseDiet.baseMealPlan,
    foodsToAvoid: baseDiet.foodsToAvoid,
    foodsToEat: baseDiet.foodsToEat,
    waterIntake,
    duration
  };
};

// Train a neural network to predict optimal calorie intake
export const trainCalorieModel = async (): Promise<tf.LayersModel> => {
  // Generate synthetic training data
  const trainingData = generateSyntheticCalorieData(2000);
  
  // Prepare features and labels
  const features: number[][] = [];
  const labels: number[] = [];
  
  trainingData.forEach(data => {
    features.push([
      data.age / 100,
      data.gender === 'male' ? 1 : 0,
      data.weight / 150,
      data.height / 200,
      data.bmi / 40,
      data.activityLevel / 5,
      data.hasHypertension ? 1 : 0,
      data.hasDiabetes ? 1 : 0,
      data.hasHeartDisease ? 1 : 0
    ]);
    
    labels.push(data.optimalCalories / 3000); // Normalize to 0-1 range
  });
  
  // Convert to tensors
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels, [labels.length, 1]);
  
  // Create the model
  const model = tf.sequential();
  
  // Add layers
  model.add(tf.layers.dense({
    inputShape: [features[0].length],
    units: 16,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 1,
    activation: 'linear'
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
  });
  
  // Train the model
  await model.fit(xs, ys, {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2
  });
  
  // Clean up tensors
  xs.dispose();
  ys.dispose();
  
  return model;
};

// Generate synthetic data for calorie model training
interface CalorieTrainingData {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  bmi: number;
  activityLevel: number; // 1-5 scale
  hasHypertension: boolean;
  hasDiabetes: boolean;
  hasHeartDisease: boolean;
  optimalCalories: number;
}

function generateSyntheticCalorieData(count: number): CalorieTrainingData[] {
  const data: CalorieTrainingData[] = [];
  
  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const age = Math.floor(Math.random() * 70) + 18; // 18-88 years
    
    // Generate weight based on gender
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
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Generate activity level (1-5)
    const activityLevel = Math.floor(Math.random() * 5) + 1;
    
    // Generate health conditions
    const hasHypertension = Math.random() > 0.7;
    const hasDiabetes = Math.random() > 0.8;
    const hasHeartDisease = Math.random() > 0.85;
    
    // Calculate optimal calories based on factors
    let baseCalories;
    if (gender === 'male') {
      baseCalories = 2000;
    } else {
      baseCalories = 1800;
    }
    
    // Adjust for age
    if (age > 50) {
      baseCalories *= 0.9;
    } else if (age < 30) {
      baseCalories *= 1.1;
    }
    
    // Adjust for activity level
    baseCalories *= (0.8 + (activityLevel * 0.1));
    
    // Adjust for BMI
    if (bmi > 30) {
      baseCalories *= 0.85;
    } else if (bmi > 25) {
      baseCalories *= 0.9;
    } else if (bmi < 18.5) {
      baseCalories *= 1.15;
    }
    
    // Adjust for health conditions
    if (hasHypertension) baseCalories *= 0.95;
    if (hasDiabetes) baseCalories *= 0.9;
    if (hasHeartDisease) baseCalories *= 0.9;
    
    // Add some random variation
    baseCalories *= (0.9 + Math.random() * 0.2);
    
    data.push({
      age,
      gender,
      weight,
      height,
      bmi,
      activityLevel,
      hasHypertension,
      hasDiabetes,
      hasHeartDisease,
      optimalCalories: Math.round(baseCalories)
    });
  }
  
  return data;
}