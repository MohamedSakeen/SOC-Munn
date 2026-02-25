'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface GunBarrelIntroProps {
  onComplete: () => void;
  skip?: boolean;
}

export function GunBarrelIntro({ onComplete, skip = false }: GunBarrelIntroProps) {
  const [phase, setPhase] = useState<'intro' | 'walk' | 'turn' | 'shoot' | 'blood' | 'done'>('intro');
  const [showFlash, setShowFlash] = useState(false);
  const [barrelX, setBarrelX] = useState(10);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (skip) {
      handleComplete();
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    // Animate barrel position smoothly
    let animationFrame: number;
    let startTime = Date.now();
    
    const animateBarrel = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 500) {
        // Intro phase - barrel starts left
        setBarrelX(10);
      } else if (elapsed < 2200) {
        // Walk phase - barrel follows to center
        const progress = (elapsed - 500) / 1700;
        setBarrelX(10 + progress * 40); // 10 -> 50
      } else {
        // Centered
        setBarrelX(50);
      }
      
      if (elapsed < 4500) {
        animationFrame = requestAnimationFrame(animateBarrel);
      }
    };
    
    animationFrame = requestAnimationFrame(animateBarrel);

    // Phase timeline
    timers.push(setTimeout(() => setPhase('walk'), 500));
    timers.push(setTimeout(() => setPhase('turn'), 2200));
    timers.push(setTimeout(() => setPhase('shoot'), 2800));
    timers.push(setTimeout(() => setShowFlash(true), 2800));
    timers.push(setTimeout(() => setShowFlash(false), 3100));
    timers.push(setTimeout(() => setPhase('blood'), 3200));
    timers.push(setTimeout(() => setPhase('done'), 4200));
    timers.push(setTimeout(() => handleComplete(), 4500));

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [handleComplete, skip]);

  if (skip || phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black overflow-hidden"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* White circular barrel opening with rifling INSIDE */}
        <div 
          className="absolute w-[280px] h-[280px] rounded-full bg-white overflow-hidden"
          style={{
            left: `${barrelX}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Classic spiral rifling grooves */}
          <svg viewBox="0 0 280 280" className="absolute inset-0 w-full h-full">
            {[...Array(7)].map((_, i) => {
              const startAngle = (i * 360) / 7;
              // Create curved spiral path from center outward
              const innerRadius = 25;
              const outerRadius = 145;
              const curveAngle = 50; // How much the spiral curves
              
              const x1 = 140 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 140 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
              
              const x2 = 140 + outerRadius * Math.cos(((startAngle + curveAngle) * Math.PI) / 180);
              const y2 = 140 + outerRadius * Math.sin(((startAngle + curveAngle) * Math.PI) / 180);
              
              // Control point for the curve
              const midRadius = (innerRadius + outerRadius) / 2;
              const midAngle = startAngle + curveAngle / 3;
              const cx = 140 + midRadius * Math.cos((midAngle * Math.PI) / 180);
              const cy = 140 + midRadius * Math.sin((midAngle * Math.PI) / 180);
              
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
              );
            })}
            {/* Inner dark ring for depth */}
            <circle cx="140" cy="140" r="138" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
          </svg>
        </div>

        {/* James Bond Silhouette - walking through the barrel view */}
        <motion.div
          className="absolute z-20"
          style={{
            top: '50%',
            transform: 'translateY(50%)',
          }}
          initial={{ left: '0%' }}
          animate={{
            left: phase === 'intro' ? '3%' : 
                  phase === 'walk' ? `43%` : `43%`,
            scale: phase === 'turn' || phase === 'shoot' || phase === 'blood' ? 1.15 : 1,
          }}
          transition={{ 
            left: { duration: phase === 'walk' ? 1.7 : 0.3, ease: 'linear'  },
            scale: { duration: 0.3 }
          }}
        >
          <Image
            src="/James-Bond.png"
            alt="Agent"
            width={150}
            height={400}
            className="h-[60vh] w-auto object-contain"
            priority
            unoptimized
          />
        </motion.div>

        {/* Muzzle Flash */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              className="absolute z-30"
              style={{
                top: '18%',
                left: '48%',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-yellow-100 rounded-full blur-md" />
                <div className="absolute inset-0 bg-orange-400 rounded-full blur-lg opacity-80" />
                <div className="absolute inset-4 bg-white rounded-full blur-sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* White flash on shoot */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              className="absolute inset-0 bg-white z-25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            />
          )}
        </AnimatePresence>

        {/* Blood Effect */}
        {phase === 'blood' && (
          <motion.div
            className="absolute inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Blood dripping from top */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 bg-red-700"
                style={{
                  left: `${i * 7 + Math.random() * 3}%`,
                  width: `${4 + Math.random() * 3}%`,
                }}
                initial={{ height: 0 }}
                animate={{ height: '100vh' }}
                transition={{
                  duration: 0.5 + Math.random() * 0.3,
                  delay: i * 0.03,
                  ease: 'easeIn',
                }}
              />
            ))}
            
            {/* Red overlay */}
            <motion.div
              className="absolute inset-0 bg-red-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            />
          </motion.div>
        )}

        {/* Skip hint */}
        {phase !== 'blood' && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan-400/50 text-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
          >
            Press any key to skip
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
