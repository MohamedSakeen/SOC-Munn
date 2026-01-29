'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

// Detective quotes for correct answers
export const detectiveQuotes = [
  "Elementary, my dear Watson.",
  "The game is afoot!",
  "Another clue decoded, Agent.",
  "Excellent deduction, Detective.",
  "Your instincts serve you well.",
  "The pieces are falling into place.",
  "Sherlock would be impressed.",
  "Case notes updated successfully.",
];

// First blood quotes
export const firstBloodQuotes = [
  "License to Kill acquired! 🔫",
  "First on the scene. True detective material.",
  "007 would be proud, Agent.",
  "Swift as a shadow, deadly as a blade.",
  "The early bird catches the villain.",
];

// Wrong answer quotes
export const wrongAnswerQuotes = [
  "Not quite, Detective. The truth is out there.",
  "Even Sherlock had his off days.",
  "The evidence doesn't quite match up.",
  "Reconsider the clues, Agent.",
  "Close, but the culprit remains at large.",
];

// PS completion quotes
export const caseClosedQuotes = [
  "🎉 Case Closed, Detective!",
  "📁 File sealed. Another mystery solved.",
  "🏆 Outstanding work, Agent!",
  "🔍 The truth has been revealed!",
];

// All PS completion (100%) quotes
export const missionCompleteQuotes = [
  "🎊 Congratulations, Detective Pikachu! You've cracked every case! ⚡",
  "🏆 Mission Accomplished, 007. M would be proud.",
  "🎭 The game is afoot no more, Sherlock! All mysteries solved.",
  "👏 Elementary! You've proven yourself the greatest detective.",
  "🌟 Outstanding, Agent! You've earned your license to thrill.",
];

// Random quote picker
export const getRandomQuote = (quotes: string[]) => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Trigger celebration confetti
export const triggerCelebration = (type: 'correct' | 'firstBlood' | 'caseClosed' | 'missionComplete') => {
  const configs = {
    correct: {
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    },
    firstBlood: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ff4444', '#ff8888'],
    },
    caseClosed: {
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#00ff00', '#44ff44', '#88ff88'],
    },
    missionComplete: {
      particleCount: 300,
      spread: 180,
      startVelocity: 45,
      origin: { y: 0.5 },
    },
  };

  confetti(configs[type]);

  if (type === 'missionComplete') {
    // Extra confetti bursts for mission complete
    setTimeout(() => confetti({ ...configs.missionComplete, origin: { x: 0.2, y: 0.6 } }), 200);
    setTimeout(() => confetti({ ...configs.missionComplete, origin: { x: 0.8, y: 0.6 } }), 400);
  }
};

interface CaseClosedOverlayProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function CaseClosedOverlay({ show, message, onClose }: CaseClosedOverlayProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-center"
          >
            {/* Stamp effect */}
            <motion.div
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
              className="border-8 border-green-500 rounded-xl px-12 py-6 bg-green-500/10 backdrop-blur"
            >
              <h2 className="text-4xl font-bold text-green-400 font-mono tracking-wider">
                CASE CLOSED
              </h2>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-xl text-neutral-300"
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MissionCompleteOverlayProps {
  show: boolean;
  onClose: () => void;
}

export function MissionCompleteOverlay({ show, onClose }: MissionCompleteOverlayProps) {
  const [message] = useState(() => getRandomQuote(missionCompleteQuotes));

  useEffect(() => {
    if (show) {
      triggerCelebration('missionComplete');
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="text-center max-w-2xl px-8">
            {/* Golden badge */}
            <motion.div
              initial={{ scale: 0, rotate: -720 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: 'spring' }}
              className="mb-8 mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-2xl shadow-amber-500/50"
            >
              <span className="text-6xl">🏆</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-6"
            >
              MISSION ACCOMPLISHED
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl text-amber-200 mb-8"
            >
              {message}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="inline-block border-2 border-amber-500/50 rounded-lg px-6 py-3 bg-amber-500/10"
            >
              <p className="text-amber-400 font-mono">
                All cases solved • Master Detective Status Achieved
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
