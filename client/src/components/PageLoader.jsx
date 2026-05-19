import React from 'react';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <span className="font-bold text-gray-800 dark:text-white text-lg">SafeGuard</span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading Emergency Response Platform...</p>
    </div>
  </div>
);

export default PageLoader;
