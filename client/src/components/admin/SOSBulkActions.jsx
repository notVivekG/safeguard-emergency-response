import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SOSBulkActions = ({ selectedCount, onClearSelected, onMarkResolved, onDeleteSelected, onClearAll, totalCount }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
        <button
          onClick={onClearSelected}
          disabled={selectedCount === 0}
          className="px-3 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-slate-700 transition-colors"
        >
          Clear Selected ({selectedCount})
        </button>
        <button
          onClick={onMarkResolved}
          disabled={selectedCount === 0}
          className="px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-slate-700 transition-colors"
        >
          Mark Resolved
        </button>
        <button
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className="px-3 py-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-slate-700 transition-colors"
        >
          Delete Selected
        </button>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
      >
        Clear All ({totalCount})
      </button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-2">Clear All SOS Alerts?</h3>
              <p className="text-slate-400 mb-6">
                This will mark all {totalCount} active SOS alerts as resolved. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onClearAll(); setShowConfirm(false); }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOSBulkActions;
