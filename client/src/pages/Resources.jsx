import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

const categories = [
  {
    id: 'natural-disasters',
    title: 'Natural Disasters',
    icon: '🌪️',
    sections: [
      { title: 'Flood Preparedness', tips: ['Move to higher ground early.', 'Avoid walking or driving through floodwater.', 'Keep clean drinking water and dry food ready.'] },
      { title: 'Earthquake Response', tips: ['Drop, cover, and hold on until shaking stops.', 'Stay away from glass and heavy shelves.', 'After tremors, check gas and electrical hazards.'] },
      { title: 'Cyclone Safety', tips: ['Secure doors, windows, and outdoor loose objects.', 'Keep torch, batteries, and power banks charged.', 'Follow evacuation orders immediately.'] }
    ]
  },
  {
    id: 'medical-emergencies',
    title: 'Medical Emergencies',
    icon: '🩺',
    sections: [
      { title: 'Immediate First Response', tips: ['Check scene safety before helping.', 'Call `102` and share clear location details.', 'Do not move victims with spinal injury suspicion.'] },
      { title: 'Bleeding and Burns', tips: ['Apply clean pressure to control bleeding.', 'Cool burns under running water for 20 minutes.', 'Do not apply toothpaste or home remedies on burns.'] },
      { title: 'CPR Basics', tips: ['Start chest compressions if no pulse or breathing.', 'Keep rhythm around 100-120 compressions/min.', 'Continue until trained help arrives.'] }
    ]
  },
  {
    id: 'fire-safety',
    title: 'Fire Safety',
    icon: '🔥',
    sections: [
      { title: 'Evacuate Quickly', tips: ['Raise alarm and call `101`.', 'Use stairs, never elevators.', 'Stay low to avoid smoke inhalation.'] },
      { title: 'Kitchen Fire', tips: ['Turn off gas/electric source if safe.', 'Use lid or fire blanket for oil fires.', 'Never pour water on grease fire.'] },
      { title: 'Post-Fire Safety', tips: ['Do not re-enter before official clearance.', 'Check for hidden embers and hot surfaces.', 'Get medical help for smoke exposure.'] }
    ]
  },
  {
    id: 'evacuation-planning',
    title: 'Evacuation Planning',
    icon: '🧭',
    sections: [
      { title: 'Family Evacuation Plan', tips: ['Choose two safe meeting points.', 'Assign responsibilities to each member.', 'Practice route drills every month.'] },
      { title: 'Emergency Go-Bag', tips: ['Carry IDs, basic medicines, and phone charger.', 'Pack water, dry snacks, and flashlight.', 'Include child and elderly specific essentials.'] },
      { title: 'Pet and Accessibility Needs', tips: ['Keep pet carriers, food, and records ready.', 'Prepare mobility aids and backup batteries.', 'Share special needs with local responders.'] }
    ]
  }
];

const emergencyContacts = [
  { name: 'Police', number: '100', icon: '👮' },
  { name: 'Ambulance', number: '102', icon: '🚑' },
  { name: 'Fire', number: '101', icon: '🚒' },
  { name: 'Disaster Helpline', number: '108', icon: '🆘' }
];

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    document.title = 'Resources — SafeGuard';
  }, []);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return categories;
    return categories
      .map((category) => ({
        ...category,
        sections: category.sections.filter((section) =>
          `${section.title} ${section.tips.join(' ')}`.toLowerCase().includes(query)
        )
      }))
      .filter((category) => category.title.toLowerCase().includes(query) || category.sections.length > 0);
  }, [searchTerm]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageWrapper className="overflow-x-hidden">
      <section className="bg-navy px-4 py-14 text-white dark:bg-[#071124] sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">Emergency Resources Hub</h1>
          <p className="mt-4 text-sm text-gray-300 sm:text-base">
            Search preparedness guides and open each section to view actionable safety tips.
          </p>
          <div className="relative mx-auto mt-7 w-full max-w-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topics like flood, first aid, evacuation..."
              className="w-full min-h-[44px] rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-300 outline-none backdrop-blur focus:ring-2 focus:ring-primary sm:text-base"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        {filteredCategories.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-navy-light">
            <p className="text-lg font-semibold text-navy dark:text-white">No matching resources found.</p>
            <p className="mt-2 text-sm text-gray-500">Try a broader keyword such as `fire`, `medical`, or `evacuation`.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-navy-light">
                <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
                  <span className="text-2xl" aria-hidden="true">{category.icon}</span>
                  <h2 className="text-xl font-bold text-navy dark:text-white">{category.title}</h2>
                </div>
                <div className="space-y-3 p-4 sm:p-6">
                  {category.sections.map((section, index) => {
                    const sectionKey = `${category.id}-${index}`;
                    const isOpen = !!openSections[sectionKey];
                    return (
                      <div key={sectionKey} className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#0b1427]">
                        <button
                          type="button"
                          onClick={() => toggleSection(sectionKey)}
                          className="flex min-h-[44px] w-full items-center justify-between gap-3 px-4 py-3 text-left"
                        >
                          <span className="font-semibold text-navy dark:text-white">{section.title}</span>
                          <span className="text-lg text-gray-500 dark:text-gray-300">{isOpen ? '−' : '+'}</span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
                            >
                              <ul className="space-y-2 px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {section.tips.map((tip) => (
                                  <li key={tip} className="flex items-start gap-2">
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-gray-200 bg-gray-50 px-4 py-10 dark:border-gray-800 dark:bg-[#050b19] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-bold text-navy dark:text-white">Emergency Contact Numbers</h3>
              <p className="mt-1 text-sm text-gray-500">Tap any card to place a call instantly.</p>
            </div>
            <a
              href="https://www.ndma.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark"
            >
              Download Emergency PDF
            </a>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md dark:border-gray-700 dark:bg-navy-light"
              >
                <p className="text-2xl" aria-hidden="true">{contact.icon}</p>
                <p className="mt-2 text-sm font-semibold text-gray-500">{contact.name}</p>
                <p className="mt-1 text-3xl font-extrabold text-primary">{contact.number}</p>
                <p className="mt-1 text-xs text-gray-500">Tap to call</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Resources;
