import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Page animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
const pageTransition = { duration: 0.3, ease: 'easeInOut' };

// Resource data
const resources = [
  {
    id: 1,
    icon: '🔥',
    category: 'Fire Safety',
    title: 'Fire Emergency Guide',
    description: 'Learn how to respond to fire emergencies, evacuation procedures, and fire prevention tips.',
    tips: [
      'Activate the nearest fire alarm immediately',
      'Call emergency services: 101',
      'Evacuate using stairs, never use elevators',
      'Stay low to avoid smoke inhalation',
      'Meet at designated assembly point',
    ],
    color: 'orange',
  },
  {
    id: 2,
    icon: '🌊',
    category: 'Flood Safety',
    title: 'Flood Preparedness Guide',
    description: 'Essential steps to take before, during and after a flood to keep yourself and family safe.',
    tips: [
      'Move to higher ground immediately',
      'Do not walk in moving water',
      'Disconnect electrical appliances',
      'Keep emergency kit ready',
      'Follow local authority instructions',
    ],
    color: 'blue',
  },
  {
    id: 3,
    icon: '🏔️',
    category: 'Earthquake Safety',
    title: 'Earthquake Response Guide',
    description: 'What to do during and after an earthquake to minimize injury and stay safe.',
    tips: [
      'Drop, Cover, and Hold On',
      'Stay away from windows and heavy furniture',
      'If outdoors move away from buildings',
      'After shaking stops check for injuries',
      'Expect aftershocks',
    ],
    color: 'yellow',
  },
  {
    id: 4,
    icon: '🎒',
    category: 'Emergency Kit',
    title: 'Emergency Kit Checklist',
    description: 'Essential items every household should have ready for any emergency situation.',
    tips: [
      'Water: 1 gallon per person per day for 3 days',
      'Non-perishable food for 3 days',
      'First aid kit and medications',
      'Flashlight, batteries and radio',
      'Important documents in waterproof bag',
    ],
    color: 'green',
  },
  {
    id: 5,
    icon: '🚑',
    category: 'First Aid',
    title: 'Basic First Aid Guide',
    description: 'Critical first aid techniques everyone should know to help in emergency situations.',
    tips: [
      'Check for danger before approaching',
      'Call 102 for ambulance immediately',
      'Apply pressure to stop bleeding',
      'Do not move injured person unless necessary',
      'Learn CPR — it saves lives',
    ],
    color: 'red',
  },
  {
    id: 6,
    icon: '📱',
    category: 'Emergency Contacts',
    title: 'Important Emergency Numbers',
    description: 'Key emergency contact numbers to save on your phone right now.',
    tips: [
      'Police: 100',
      'Ambulance: 102',
      'Fire Brigade: 101',
      'Disaster Helpline: 1133',
      'National Emergency: 112',
    ],
    color: 'purple',
  },
];

const emergencyNumbers = [
  { name: 'Police', number: '100', icon: '👮', color: 'blue' },
  { name: 'Ambulance', number: '102', icon: '🚑', color: 'red' },
  { name: 'Fire Brigade', number: '101', icon: '🚒', color: 'orange' },
  { name: 'Disaster Helpline', number: '1133', icon: '🆘', color: 'purple' },
  { name: 'National Emergency', number: '112', icon: '📞', color: 'green' },
];

// Tailwind color mapping
const colorMap = {
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-700',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-700',
  },
};

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    document.title = 'Resources — SafeGuard';
  }, []);

  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    window.print();
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {/* HERO SECTION */}
      <section className="bg-[#0a192f] text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">Emergency Resources &amp; Safety Guides</h1>
          <p className="text-gray-300 mt-4 text-lg">
            Essential guides, emergency contacts, and safety tips to keep you and your family prepared.
          </p>
          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-white/10 backdrop-blur px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* RESOURCE CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {filteredResources.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">No resources match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-white dark:bg-navy-light rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Top colored bar */}
                <div className={`${colorMap[res.color].bg} h-1.5 w-full`}></div>
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorMap[res.color].bg} text-2xl mb-4`}>{res.icon}</div>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${colorMap[res.color].badge} mb-2`}>{res.category}</span>
                  <h3 className="text-xl font-bold text-navy dark:text-white mb-2">{res.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{res.description}</p>
                  <button
                    onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}
                    className="text-primary hover:underline mb-2"
                  >
                    {expandedId === res.id ? 'Hide Tips' : 'View Tips'}
                  </button>
                  {expandedId === res.id && (
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm text-gray-600">
                      {res.tips.map((tip, i) => (
                        <li key={i}>✔️ {tip}</li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                  >
                    Download as PDF
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* EMERGENCY CONTACTS SECTION */}
      <section className="bg-[#0a192f] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Emergency Contact Numbers</h2>
          <p className="text-gray-400 mb-10">Save these numbers — they could save a life</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {emergencyNumbers.map((item) => (
              <div
                key={item.name}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                <a href={`tel:${item.number}`} className={`text-3xl font-extrabold ${colorMap[item.color].text}`}>{item.number}</a>
                <p className="text-xs text-gray-400 mt-2">Tap to Call</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Resources;
