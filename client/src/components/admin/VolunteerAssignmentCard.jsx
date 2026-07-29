import React from 'react';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  assigned: 'bg-slate-600',
  accepted: 'bg-blue-600',
  travelling: 'bg-amber-600',
  reached: 'bg-emerald-600',
  helping: 'bg-purple-600',
  completed: 'bg-green-600'
};

const VolunteerAssignmentCard = ({ volunteer, sosLocation, onRemove }) => {
  const user = volunteer.volunteer || {};
  const { status, acceptedAt, currentLocation } = volunteer;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleTrack = () => {
    if (sosLocation) {
      const lat = sosLocation.lat || sosLocation.coordinates?.[1];
      const lng = sosLocation.lng || sosLocation.coordinates?.[0];
      if (lat && lng) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
      }
    }
  };

  const handleNavigate = () => {
    if (currentLocation?.lat && currentLocation?.lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`, '_blank');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
            {getInitials(user.name)}
          </div>
          <div>
            <h4 className="text-white font-medium">{user.name || 'Unknown'}</h4>
            <p className="text-slate-400 text-sm">{user.phone || 'No phone'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white capitalize ${STATUS_COLORS[status] || 'bg-slate-600'}`}>
          {status}
        </span>
      </div>

      <div className="text-xs text-slate-500 space-y-1">
        {acceptedAt && <p>Accepted: {new Date(acceptedAt).toLocaleTimeString()}</p>}
        {currentLocation?.updatedAt && (
          <p>Last update: {new Date(currentLocation.updatedAt).toLocaleTimeString()}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={handleTrack} className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors text-center">
          Track SOS
        </button>
        <button
          onClick={handleNavigate}
          disabled={!currentLocation?.lat}
          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Navigate
        </button>
        {user.phone && (
          <a href={`tel:${user.phone}`} className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors text-center">
            Call
          </a>
        )}
        <button
          onClick={() => onRemove(user._id)}
          className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm transition-colors"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
};

export default VolunteerAssignmentCard;
