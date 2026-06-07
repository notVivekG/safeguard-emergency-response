import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const COOLDOWN_SECONDS = 60;

const SOSButton = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState(null);
  const cooldownRef = useRef(null);

  // Countdown tick
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
    } else {
      clearTimeout(cooldownRef.current);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleConfirmSOS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      setShowModal(false);
      return;
    }

    setSending(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const address = await reverseGeocode(lat, lng);
          await api.post('/sos', { lat, lng, address });
          setShowModal(false);
          setCooldown(COOLDOWN_SECONDS);
          showToast('🚨 SOS sent! Emergency responders have been alerted.', 'success');
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to send SOS. Try again.', 'error');
        } finally {
          setSending(false);
        }
      },
      () => {
        setSending(false);
        setShowModal(false);
        showToast('Location access required to send SOS.', 'error');
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  const isDisabled = cooldown > 0 || sending;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl shadow-2xl font-semibold text-white text-sm flex items-center gap-2 transition-all ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* SOS Button */}
      <div className="relative flex items-center justify-center">
        {!isDisabled && (
          <>
            <span className="sos-ring absolute inline-flex h-16 w-16 rounded-full bg-red-500 opacity-75"></span>
            <span className="sos-ring-2 absolute inline-flex h-16 w-16 rounded-full bg-red-500 opacity-75"></span>
            <span className="sos-ring-3 absolute inline-flex h-16 w-16 rounded-full bg-red-500 opacity-75"></span>
          </>
        )}
        <button
          onClick={() => !isDisabled && setShowModal(true)}
          disabled={isDisabled}
          className={`relative z-10 w-16 h-16 font-extrabold text-xs rounded-full shadow-lg transition-all flex flex-col items-center justify-center leading-tight ${
            isDisabled
              ? 'bg-gray-500 cursor-not-allowed text-gray-300'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={cooldown > 0 ? `Cooldown: ${cooldown}s` : 'Send Emergency SOS'}
        >
          {cooldown > 0 ? (
            <>
              <span className="text-[10px] font-bold">WAIT</span>
              <span className="text-base font-extrabold">{cooldown}s</span>
            </>
          ) : (
            <span className="text-sm font-extrabold">SOS</span>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-red-200 dark:border-red-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl font-extrabold">🚨</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send Emergency SOS?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
              Your location will be shared with all responders and emergency teams immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setSending(false); }}
                disabled={sending}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSOS}
                disabled={sending}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Sending...
                  </>
                ) : 'SEND SOS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
