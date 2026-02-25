'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NoirBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'grid' | 'fingerprint' | 'scanlines';
  className?: string;
}

export function NoirBackground({ children, variant = 'default', className }: NoirBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen bg-black", className)}>
      {/* Base gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#050d1a] via-black to-[#080f1e] pointer-events-none" />

      {/* Vignette effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* Grid pattern */}
      {(variant === 'grid' || variant === 'default') && (
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(41,121,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(41,121,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Fingerprint watermark */}
      {variant === 'fingerprint' && (
        <div className="fixed bottom-0 right-0 w-96 h-96 opacity-[0.02] pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full fill-white">
            {/* Simplified fingerprint pattern */}
            {[...Array(15)].map((_, i) => (
              <ellipse
                key={i}
                cx="100"
                cy="100"
                rx={90 - i * 6}
                ry={90 - i * 6}
                fill="none"
                stroke="white"
                strokeWidth="1"
                transform={`rotate(${i * 3} 100 100)`}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Scanlines effect */}
      {variant === 'scanlines' && (
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      )}

      {/* Film grain noise */}
      <div className="fixed inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Subtle amber accent glow */}
      <div className="fixed top-0 left-1/4 w-1/2 h-1/3 bg-blue-600/8 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-1/2 h-1/3 bg-cyan-500/5 blur-[150px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Radar sweep animation for background
export function RadarSweep() {
  return (
    <div className="fixed bottom-8 right-8 w-32 h-32 opacity-20 pointer-events-none">
      <div className="relative w-full h-full">
        {/* Radar circles */}
        <div className="absolute inset-0 border border-blue-500/30 rounded-full" />
        <div className="absolute inset-4 border border-blue-500/20 rounded-full" />
        <div className="absolute inset-8 border border-blue-500/10 rounded-full" />

        {/* Sweep line */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-transparent origin-left"
          style={{ marginTop: '-1px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 bg-blue-500 rounded-full" />
      </div>
    </div>
  );
}

// Typewriter text effect
interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TypewriterText({ text, className, delay = 0 }: TypewriterTextProps) {
  return (
    <motion.span
      className={cn("font-mono", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        className="inline-block w-2 h-4 bg-current ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </motion.span>
  );
}

// Evidence tag component
interface EvidenceTagProps {
  number: number;
  label?: string;
  className?: string;
}

export function EvidenceTag({ number, label, className }: EvidenceTagProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="w-8 h-8 rounded bg-blue-500 text-white font-bold flex items-center justify-center text-sm font-mono">
        {number}
      </div>
      {label && (
        <span className="text-xs text-blue-500 font-mono uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
