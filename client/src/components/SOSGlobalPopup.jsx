import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOS } from '../context/SOSContext';

const SOSGlobalPopup = () => {
  const { activeSOS, dismissSOS, acceptMission } = useSOS();

  const handleViewLocation = () => {
    if (!activeSOS) return;
    const loc = activeSOS.location;
    const lat = loc?.lat || loc?.coordinates?.[1];
    const lng = loc?.lng || loc?.coordinates?.[0];
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  const handleAccept = () => {
    if (activeSOS) acceptMission(activeSOS._id);
  };

  const handleDismiss = () => {
    if (activeSOS) dismissSOS(activeSOS._id);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleString();
  };

  const getCoords = () => {
    if (!activeSOS?.location) return null;
    const loc = activeSOS.location;
    const lat = loc.lat || loc.coordinates?.[1];
    const lng = loc.lng || loc.coordinates?.[0];
    if (lat && lng) return { lat, lng };
    return null;
  };

  return (
    <AnimatePresence>
      {activeSOS && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-4 bg-slate-900/95 border-2 border-red-500 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.4)] overflow-hidden"
          >
            {/* Pulsing header */}
            <div className="bg-red-600/20 px-6 py-4 border-b border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white font-bold text-lg">SOS</span>
                  </div>
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30" />
                </div>
                <div>
                  <h2 className="text-red-400 font-bold text-xl">Emergency Alert</h2>
                  <p className="text-red-300/70 text-sm">Immediate assistance required</p>
                </div>
                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="ml-auto text-slate-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold text-white ring-2 ring-red-500/40">
                  {getInitials(activeSOS.userName)}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{activeSOS.userName || 'Unknown User'}</h3>
                  <p className="text-slate-400 text-sm">{getTimeAgo(activeSOS.timestamp || activeSOS.createdAt)}</p>
                </div>
              </div>

              {/* Location details */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-slate-200">{activeSOS.address || 'Location captured'}</p>
                    {getCoords() && (
                      <p className="text-slate-500 text-sm font-mono mt-1">
                        {getCoords().lat.toFixed(4)}, {getCoords().lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mission ID if available */}
              {activeSOS.missionId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Mission:</span>
                  <span className="text-amber-400 font-mono text-xs bg-amber-500/10 px-2 py-0.5 rounded">
                    {activeSOS.missionId}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={handleViewLocation}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-xs font-medium">View Map</span>
                </button>
                <button
                  onClick={handleAccept}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors font-semibold shadow-lg shadow-red-600/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium">Accept</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors border border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-xs font-medium">Dismiss</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SOSGlobalPopup;
