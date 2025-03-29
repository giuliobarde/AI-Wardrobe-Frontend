"use client";

import React, { FC } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface ErrorModalProps {
  error: string;
  onClose: () => void;
}

const ErrorModal: FC<ErrorModalProps> = ({ error, onClose }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose} // Clicking the overlay closes the modal.
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-800">{error}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
