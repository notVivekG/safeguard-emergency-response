import React, { useState } from 'react';

const SOSButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing rings */}
      <span className="sos-ring absolute inline-flex h-16 w-16 rounded-full bg-red-500 opacity-75"></span>
      <span className="sos-ring-2 absolute inline-flex h-16 w-16 rounded-full bg-red-500 opacity-75"></span>
      <span className="sos-ring-3 absolute inline-flex h-16 w-16 rounded-full bg-red-500 opacity-75"></span>

      {/* Main button */}
      <button
        onClick={() => setShowModal(true)}
        className="relative z-10 w-16 h-16 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-full shadow-lg transition-colors flex items-center justify-center"
      >
        SOS
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl font-extrabold">SOS</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send SOS Alert?</h2>
            <p className="text-gray-500 mb-6">This will immediately alert nearby emergency responders with your live location.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowModal(false); alert('SOS Alert Sent! Help is on the way.'); }}
                className="flex-1 py-3 bg-red-600 rounded-xl font-semibold text-white hover:bg-red-700"
              >
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSButton;
