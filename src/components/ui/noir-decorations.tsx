'use client';

import { cn } from '@/lib/utils';

interface NoirDecorationsProps {
  className?: string;
}

export function NoirDecorations({ className }: NoirDecorationsProps) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden z-0", className)}>
      {/* Large fingerprint watermark - bottom left */}
      <svg 
        className="absolute -bottom-10 -left-10 w-80 h-80 opacity-[0.15]" 
        viewBox="0 0 100 100"
      >
        <g fill="none" stroke="currentColor" strokeWidth="0.8" className="text-amber-600">
          {[...Array(15)].map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx={10 + i * 3}
              ry={15 + i * 3}
              transform={`rotate(${i * 2}, 50, 50)`}
            />
          ))}
        </g>
      </svg>

      {/* Crosshair reticle - top right */}
      <div className="absolute top-24 right-24 w-40 h-40 opacity-[0.15]">
        <div className="absolute top-1/2 left-0 w-full h-px bg-amber-600" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-amber-600" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-amber-600 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-amber-600 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-600 rounded-full" />
      </div>

      {/* Faded redacted lines - top left */}
      <div className="absolute top-16 left-16 space-y-2 opacity-[0.12] -rotate-6">
        <div className="w-36 h-3 bg-amber-700 rounded-sm" />
        <div className="w-28 h-3 bg-amber-700 rounded-sm" />
        <div className="w-32 h-3 bg-amber-700 rounded-sm" />
      </div>

      {/* Faded redacted lines - bottom right */}
      <div className="absolute bottom-32 right-16 space-y-2 opacity-[0.12] rotate-3">
        <div className="w-24 h-3 bg-amber-700 rounded-sm" />
        <div className="w-36 h-3 bg-amber-700 rounded-sm" />
        <div className="w-20 h-3 bg-amber-700 rounded-sm" />
      </div>

      {/* Faded CLASSIFIED stamp - background */}
      <div className="absolute top-1/4 left-12 -rotate-12 opacity-[0.08] text-amber-600 font-mono text-5xl font-bold tracking-widest">
        CLASSIFIED
      </div>

      {/* Second CLASSIFIED stamp - bottom right */}
      <div className="absolute bottom-1/4 right-8 rotate-6 opacity-[0.06] text-red-700 font-mono text-3xl font-bold tracking-widest">
        TOP SECRET
      </div>

      {/* Fingerprint - top right area */}
      <svg 
        className="absolute top-40 right-48 w-48 h-48 opacity-[0.1]" 
        viewBox="0 0 100 100"
      >
        <g fill="none" stroke="currentColor" strokeWidth="0.6" className="text-amber-500">
          {[...Array(12)].map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx={8 + i * 3.5}
              ry={12 + i * 3.5}
              transform={`rotate(${-i * 3}, 50, 50)`}
            />
          ))}
        </g>
      </svg>

      {/* Additional fingerprint - center right */}
      <svg 
        className="absolute top-1/2 -right-20 w-64 h-64 opacity-[0.08]" 
        viewBox="0 0 100 100"
      >
        <g fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-600">
          {[...Array(18)].map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx={6 + i * 2.5}
              ry={10 + i * 2.5}
              transform={`rotate(${i * 1.5}, 50, 50)`}
            />
          ))}
        </g>
      </svg>

      {/* Evidence marker - bottom center */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-[0.1]">
        <div className="w-12 h-12 bg-yellow-500 rounded-sm flex items-center justify-center text-black font-bold text-2xl font-mono">
          1
        </div>
      </div>
    </div>
  );
}
