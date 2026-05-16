import React from 'react';
import { motion } from 'framer-motion';

const resources = [
  { id: 1, title: 'First Aid Guide', desc: 'Basic first aid instructions for common injuries.', icon: '⚕️' },
  { id: 2, title: 'Earthquake Safety', desc: 'What to do before, during, and after an earthquake.', icon: '💥' },
  { id: 3, title: 'Flood Preparedness', desc: 'How to secure your home and evacuate safely.', icon: '🌊' },
  { id: 4, title: 'Emergency Kit Checklist', desc: 'Essential items to pack in your go-bag.', icon: '🎒' },
];

const Resources = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-navy dark:text-white mb-4">Safety Resources</h1>
        <p className="text-gray-500">Essential guides and information to keep you and your family safe during emergencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {resources.map((res, i) => (
          <motion.div 
            key={res.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-navy-light rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all"
          >
            <div className="text-4xl mb-4">{res.icon}</div>
            <h3 className="text-lg font-bold text-navy dark:text-white mb-2">{res.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{res.desc}</p>
            <button className="w-full py-2 bg-gray-50 dark:bg-navy text-primary font-semibold rounded hover:bg-red-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
              Read Guide
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
