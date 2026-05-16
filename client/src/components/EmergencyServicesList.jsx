import React from 'react';

const services = [
  { id: 1, name: 'Police Control Room', number: '100', icon: '🚓' },
  { id: 2, name: 'Ambulance Helpline', number: '108', icon: '🚑' },
  { id: 3, name: 'Fire Brigade', number: '101', icon: '🚒' },
  { id: 4, name: 'Disaster Management', number: '1078', icon: '🚨' },
];

const EmergencyServicesList = () => {
  return (
    <div className="bg-white dark:bg-navy-light rounded-xl shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-navy dark:text-white mb-6">
        Emergency Services
        <span className="block text-sm font-normal text-gray-500 mt-1">Quick Access Directory</span>
      </h2>

      <div className="flex-1 space-y-4">
        {services.map(service => (
          <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-navy transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{service.icon}</span>
              <div>
                <p className="font-semibold text-sm text-navy dark:text-white">{service.name}</p>
                <p className="text-xs text-gray-500 font-mono">{service.number}</p>
              </div>
            </div>
            <a 
              href={`tel:${service.number}`}
              className="p-2 bg-red-100 text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <a href="#" className="block w-full text-center text-primary font-medium hover:text-primary-dark transition-colors">
          View All Services →
        </a>
      </div>
    </div>
  );
};

export default EmergencyServicesList;
