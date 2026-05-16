import React, { useState, useEffect } from 'react';

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutExpo
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * easeOut));
      
      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}</span>;
};

const StatBar = () => {
  const stats = [
    { label: 'Active Incidents', value: 124, suffix: '+', icon: '🚨' },
    { label: 'Responders Online', value: 856, suffix: '', icon: '👮' },
    { label: 'People Helped', value: 14500, suffix: '+', icon: '🤝' },
    { label: 'Always Ready', value: 24, suffix: '/7', icon: '⏱️' },
  ];

  return (
    <div className="bg-navy py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <div className="text-4xl font-bold text-primary">
                <CountUp end={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatBar;
