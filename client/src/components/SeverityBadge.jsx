import React from 'react';

const SeverityBadge = ({ severity }) => {
  let colorClass = '';
  switch (severity) {
    case 'high':
      colorClass = 'bg-primary text-white';
      break;
    case 'medium':
      colorClass = 'bg-amber text-white';
      break;
    case 'low':
      colorClass = 'bg-safe text-white';
      break;
    default:
      colorClass = 'bg-gray-500 text-white';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colorClass}`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
