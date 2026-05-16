import React from 'react';
import SeverityBadge from './SeverityBadge';
import { Link } from 'react-router-dom';

const typeColors = {
  fire: 'border-amber',
  flood: 'border-flood',
  earthquake: 'border-yellow-500',
  accident: 'border-safe',
  medical: 'border-primary',
  other: 'border-purple-500'
};

const IncidentCard = ({ incident }) => {
  const borderColor = typeColors[incident.type] || 'border-gray-500';
  const timeAgo = new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`bg-white dark:bg-navy-light rounded-lg shadow-md p-4 border-l-4 ${borderColor} hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-navy dark:text-white capitalize">{incident.title}</h3>
        <SeverityBadge severity={incident.severity} />
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {incident.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate max-w-[120px]">{incident.address || 'Unknown'}</span>
        </div>
        <span>{timeAgo}</span>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          incident.status === 'active' ? 'bg-red-100 text-red-800' :
          incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {incident.status.toUpperCase()}
        </span>
        <Link 
          to={`/alerts?id=${incident._id}`} 
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default IncidentCard;
