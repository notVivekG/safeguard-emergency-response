import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import useGeolocation from '../hooks/useGeolocation';
import api from '../services/api';

const incidentTypes = [
  { id: 'fire', icon: '🔥', label: 'Fire' },
  { id: 'flood', icon: '🌊', label: 'Flood' },
  { id: 'earthquake', icon: '💥', label: 'Earthquake' },
  { id: 'accident', icon: '🚗', label: 'Accident' },
  { id: 'medical', icon: '⚕️', label: 'Medical' },
  { id: 'other', icon: '⚠️', label: 'Other' }
];

const ReportIncident = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    severity: 'medium',
    location: null,
    address: ''
  });
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const navigate = useNavigate();
  const { location: userLoc } = useGeolocation();

  const handlePredictSeverity = async () => {
    if(!formData.type || !formData.description) return alert("Select type and write description first");
    setLoadingAI(true);
    try {
      const { data } = await api.post('/ai/predict-severity', { type: formData.type, description: formData.description });
      setAiPrediction(data);
      setFormData(prev => ({...prev, severity: data.severity}));
    } catch(err) {
      console.error(err);
      alert('AI prediction failed. Please select severity manually.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleLocationSelect = async (loc) => {
    setFormData(prev => ({...prev, location: loc}));
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`);
        const data = await res.json();
        if(data && data.display_name) {
            setFormData(prev => ({...prev, address: data.display_name}));
        }
    } catch(err) {
        console.error("Reverse geocoding failed", err);
    }
  };

  const handleSubmit = async () => {
    if(!formData.type || !formData.title || !formData.description || !formData.location) {
        return alert("Please fill all required fields");
    }
    setSubmitting(true);
    try {
        const { data } = await api.post('/incidents', { ...formData, aiPrediction });
        setSuccessId(data._id);
    } catch(err) {
        alert(err.response?.data?.message || 'Submission failed');
    } finally {
        setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-navy-light p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-safe text-white rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">Incident Reported!</h2>
          <p className="text-gray-500 mb-6">Your report has been received and alerts have been sent. Help is on the way.</p>
          <div className="bg-gray-100 dark:bg-navy p-3 rounded text-sm font-mono mb-6">ID: {successId}</div>
          <Link to={`/alerts?id=${successId}`} className="block w-full py-3 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-bold">
            Track This Incident
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
           <span className={`text-sm font-bold ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>1. Details</span>
           <span className={`text-sm font-bold ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>2. Location</span>
           <span className={`text-sm font-bold ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>3. Review</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(step/3)*100}%` }}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-light rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-800">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl font-bold mb-6 text-navy dark:text-white">Incident Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {incidentTypes.map(type => (
                  <button 
                    key={type.id}
                    onClick={() => setFormData({...formData, type: type.id})}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${formData.type === type.id ? 'border-primary bg-red-50 dark:bg-red-900/20 text-primary' : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-500'}`}
                  >
                    <span className="text-3xl">{type.icon}</span>
                    <span className="font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-white outline-none focus:border-primary" placeholder="e.g., Major Fire in Downtown" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea rows="4" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-white outline-none focus:border-primary" placeholder="Describe the situation..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button disabled={!formData.type || !formData.title} onClick={() => setStep(2)} className="px-6 py-2 bg-navy text-white rounded hover:bg-gray-800 disabled:opacity-50">Next Step →</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl font-bold mb-6 text-navy dark:text-white">Pinpoint Location</h2>
              
              <div className="flex gap-4 mb-4">
                <button onClick={() => {if(userLoc) handleLocationSelect(userLoc)}} className="px-4 py-2 bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Use My Location
                </button>
                <div className="flex-1">
                  <input type="text" readOnly value={formData.address} placeholder="Click on map to set address" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-navy dark:text-white" />
                </div>
              </div>

              <div className="h-[400px] border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
                <MapView onLocationSelect={handleLocationSelect} pickedLocation={formData.location} userLocation={userLoc} />
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800">← Back</button>
                <button disabled={!formData.location} onClick={() => setStep(3)} className="px-6 py-2 bg-navy text-white rounded hover:bg-gray-800 disabled:opacity-50">Next Step →</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl font-bold mb-6 text-navy dark:text-white">Review & AI Prediction</h2>
              
              <div className="bg-gray-50 dark:bg-navy p-6 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">{formData.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">{formData.type} • {formData.address}</p>
                  </div>
                  <button onClick={handlePredictSeverity} disabled={loadingAI} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2 hover:bg-purple-200 font-bold transition-colors">
                    {loadingAI ? 'Analyzing...' : <>✨ Predict Severity with AI</>}
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{formData.description}</p>
              </div>

              {aiPrediction && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg mb-6 flex gap-4">
                  <div className="text-4xl">🤖</div>
                  <div>
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                      AI Analysis Result 
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{Math.round(aiPrediction.confidence)}% Confidence</span>
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">{aiPrediction.reasoning}</p>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Final Severity Level</label>
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map(sev => (
                    <button 
                      key={sev}
                      onClick={() => setFormData({...formData, severity: sev})}
                      className={`flex-1 py-3 rounded border-2 font-bold uppercase tracking-wide transition-all ${
                        formData.severity === sev 
                          ? (sev==='high' ? 'border-primary bg-primary text-white' : sev==='medium' ? 'border-amber bg-amber text-white' : 'border-safe bg-safe text-white')
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800">← Back</button>
                <button disabled={submitting} onClick={handleSubmit} className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg">
                  {submitting ? 'Submitting...' : 'SUBMIT ALERT'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReportIncident;
