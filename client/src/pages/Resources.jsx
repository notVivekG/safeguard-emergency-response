import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Page animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
const pageTransition = { duration: 0.3, ease: 'easeInOut' };

// Resource data — 5 categories with accurate safety content
const resources = [
  {
    id: 1,
    icon: '🔥',
    category: 'Fire Safety',
    title: 'Fire Emergency Guide',
    description: 'Critical fire response techniques, evacuation procedures, and fire extinguisher usage.',
    tips: [
      'Drop, Cover, and Roll: If clothes catch fire — stop, drop, cover face, roll to smother flames.',
      'Stay Low: Smoke rises and contains deadly toxins. Crawl on hands and knees to nearest clear exit.',
      'Test Doors: Touch door handle with back of hand. If hot, do NOT open — find alternate route or window.',
      'Never Use Lifts: Always use emergency staircases. Lifts can lose power and trap you.',
      'P.A.S.S. Method (Fire Extinguisher): Pull the pin → Aim low at base of fire → Squeeze handle → Sweep side to side.',
    ],
    color: 'orange',
  },
  {
    id: 2,
    icon: '🌊',
    category: 'Flood Safety',
    title: 'Flood Preparedness Guide',
    description: 'Essential steps to take before, during, and after a flood to protect yourself and your family.',
    tips: [
      'Move to Higher Ground: Act immediately if water levels rise during heavy rain. Do not wait for official warnings.',
      'Avoid Moving Water: Never walk through moving floodwater. Just 6 inches of rushing water can sweep an adult away.',
      'Turn Around Don\'t Drown: Never drive or ride through flooded streets — potholes, open manholes, washed-out roads are invisible underwater.',
      'Isolate Power Supply: Switch off the main MCB and turn off gas cylinders to prevent electrocution and gas leaks.',
      'Water Hygiene: Floodwater is contaminated with sewage and pathogens. Boil all drinking water. Avoid skin contact.',
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
      'Drop, Cover, Hold On: Drop to hands and knees → Cover head and torso under sturdy table or desk → Hold on until shaking stops.',
      'If Indoors: Stay inside. Move away from windows, ceiling fans, heavy almirahs, and hanging fixtures.',
      'If Outdoors: Move to open ground away from buildings, electric poles, old walls, and bridges.',
      'If Driving: Pull over safely away from flyovers and overhead cables. Stay inside vehicle until tremors stop.',
    ],
    color: 'yellow',
  },
  {
    id: 4,
    icon: '🎒',
    category: 'Evacuation Planning',
    title: 'Emergency Kit (Go-Bag) — NDMA Guideline',
    description: 'Pack a portable waterproof backpack to sustain your family for 72 hours in any emergency.',
    tips: [
      'Water: Minimum 3 litres per person per day.',
      'Food: Ready-to-eat non-perishables — roasted chana, biscuits, energy bars, dates.',
      'Communication: Battery-operated radio, LED flashlight with spare batteries, charged power banks.',
      'Documents & Cash: Copies of Aadhaar, PAN, insurance papers in zip-lock bag. Keep cash in small denominations — ATMs will not work.',
      'Tools: Whistle, multi-tool knife, matchboxes wrapped in plastic.',
    ],
    color: 'green',
  },
  {
    id: 5,
    icon: '🚑',
    category: 'First Aid Essentials',
    title: 'Basic First Aid Kit Guide',
    description: 'Essential first aid supplies and medications every household must have ready at all times.',
    tips: [
      'Wound Care: Assorted bandages, sterile cotton, gauze rolls, medical tape, crepe bandages, Savlon/Dettol, Betadine ointment.',
      'Tools & Safety: Scissors, tweezers, safety pins, disposable gloves, hand sanitizer, N95 masks, ORS packets.',
      'Medications: 7-day backup of prescription medicines. OTC: Paracetamol, Cetirizine, antacids.',
    ],
    color: 'red',
  },
];

// 7 accurate Indian emergency helpline numbers
const emergencyNumbers = [
  { name: 'National Emergency', number: '112', icon: '📞', color: 'green' },
  { name: 'Police Control Room', number: '100', icon: '👮', color: 'blue' },
  { name: 'Fire Station', number: '101', icon: '🚒', color: 'orange' },
  { name: 'Ambulance Services', number: '102', icon: '🚑', color: 'red' },
  { name: 'NDRF Helpline', number: '011-23438091', icon: '🛡️', color: 'purple' },
  { name: 'Disaster Management', number: '1078', icon: '🆘', color: 'yellow' },
  { name: 'Women Helpline', number: '1091', icon: '🤝', color: 'pink' },
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
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/20',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
    badge: 'bg-pink-100 text-pink-700',
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{res.description}</p>
                  <button
                    onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}
                    className={`text-sm font-semibold mb-3 transition-colors ${colorMap[res.color].text} hover:underline`}
                  >
                    {expandedId === res.id ? '▲ Hide Tips' : '▼ View Tips'}
                  </button>
                  {expandedId === res.id && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 mb-2"
                    >
                      {res.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-800 dark:text-gray-100 leading-snug">
                          <span className="mt-0.5 shrink-0 text-green-500">✔</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {emergencyNumbers.map((item) => (
              <div
                key={item.name}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors flex flex-col items-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-sm mb-2 text-center leading-tight">{item.name}</h3>
                <a
                  href={`tel:${item.number}`}
                  className={`text-xl font-extrabold ${colorMap[item.color]?.text || 'text-white'} hover:underline`}
                  aria-label={`Call ${item.name}: ${item.number}`}
                >
                  {item.number}
                </a>
                <p className="text-xs text-gray-400 mt-1">Tap to Call</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Resources;
