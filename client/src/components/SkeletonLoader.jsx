import React from 'react';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="bg-white dark:bg-navy-light rounded-lg shadow-md p-4 w-full animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
  );
};

export default SkeletonLoader;
