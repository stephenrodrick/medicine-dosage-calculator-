import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PredictionForm from './pages/PredictionForm';
import Results from './pages/Results';
import AboutPage from './pages/AboutPage';
import DiagnosePage from './pages/DiagnosePage';
import DiagnosisResultsPage from './pages/DiagnosisResultsPage';
import VerificationPage from './pages/VerificationPage';
import { PredictionProvider } from './context/PredictionContext';

function App() {
  return (
    <PredictionProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/predict" element={<PredictionForm />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/diagnose" element={<DiagnosePage />} />
              <Route path="/diagnosis-results" element={<DiagnosisResultsPage />} />
              <Route path="/verify/:hash" element={<VerificationPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </PredictionProvider>
  );
}

export default App;
