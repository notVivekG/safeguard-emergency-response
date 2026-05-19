import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-extrabold">SG</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">SafeGuard</p>
            <p className="text-xs">Emergency Response Platform</p>
          </div>
        </div>
        <p className="text-xs text-center">
          © 2024 SafeGuard. Built for community safety and emergency response.
        </p>
        <div className="flex gap-6 text-sm">
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
          <Link to="/alerts" className="hover:text-white transition-colors">Alerts</Link>
          <Link to="/report" className="hover:text-white transition-colors">Report</Link>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
        <p>Real-time disaster alerts • Quick response • Community support</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>All Systems Operational</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
