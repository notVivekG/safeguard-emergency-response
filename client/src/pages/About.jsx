import React, { useEffect } from 'react';

const About = () => {
  useEffect(() => { document.title = 'About — SafeGuard'; }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" /></svg>
      </div>
      <h1 className="text-4xl font-bold text-navy dark:text-white mb-6">About SafeGuard</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
        SafeGuard is a comprehensive emergency response platform designed to bridge the gap between citizens in distress and immediate help. By leveraging real-time data, AI analysis, and community networks, we ensure that every cry for help is heard and acted upon swiftly.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
        <div className="bg-white dark:bg-navy-light p-6 rounded-xl shadow">
           <h3 className="font-bold text-lg text-navy dark:text-white mb-2">Our Mission</h3>
           <p className="text-gray-500 text-sm">To reduce response times during crises by empowering communities with smart, accessible tools.</p>
        </div>
        <div className="bg-white dark:bg-navy-light p-6 rounded-xl shadow">
           <h3 className="font-bold text-lg text-navy dark:text-white mb-2">Our Vision</h3>
           <p className="text-gray-500 text-sm">A world where no disaster results in unnecessary loss due to delayed communication.</p>
        </div>
        <div className="bg-white dark:bg-navy-light p-6 rounded-xl shadow">
           <h3 className="font-bold text-lg text-navy dark:text-white mb-2">Contact Us</h3>
           <p className="text-gray-500 text-sm">support@safeguard.com<br/>1-800-SAFE-000</p>
        </div>
      </div>
    </div>
  );
};

export default About;
