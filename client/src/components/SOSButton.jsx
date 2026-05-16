import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const SOSButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSOS = async () => {
    if (!user) {
      alert("Please login to use SOS");
      return;
    }
    setLoading(true);
    try {
      // In a real app, we'd get real coords here via useGeolocation
      const coords = { lat: 0, lng: 0 }; 
      if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
              const { latitude, longitude } = pos.coords;
              await api.post('/users/sos', { location: { lat: latitude, lng: longitude }, address: "Current Location" });
              alert('SOS Sent successfully!');
              setShowModal(false);
              setLoading(false);
          }, async () => {
             await api.post('/users/sos', { location: { lat: 0, lng: 0 }, address: "Unknown Location" });
             alert('SOS Sent without precise location!');
             setShowModal(false);
             setLoading(false);
          });
      } else {
        await api.post('/users/sos', { location: { lat: 0, lng: 0 }, address: "Unknown Location" });
        alert('SOS Sent successfully!');
        setShowModal(false);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send SOS');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative inline-flex items-center justify-center">
        <div className="sos-ring"></div>
        <div className="sos-ring"></div>
        <div className="sos-ring"></div>
        <button
          onClick={() => setShowModal(true)}
          className="relative z-10 w-24 h-24 bg-primary hover:bg-primary-dark rounded-full text-white font-bold text-xl shadow-lg transition-colors flex flex-col items-center justify-center"
        >
          <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          SOS
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-navy p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-primary mb-4">Confirm SOS</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will immediately alert nearby responders and emergency contacts. Only use in a real emergency!
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSOS}
                className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Confirm SOS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
