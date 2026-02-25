'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, FileText, Stamp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CaseFileCardProps {
  psNumber: number;
  title: string;
  description: string;
  totalScore: number;
  isLocked?: boolean;
  progress?: { completed: number; total: number };
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onClick?: () => void;
  className?: string;
}

const severityConfig = {
  low: { label: 'LOW', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/40' },
  medium: { label: 'MED', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' },
  high: { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40' },
  critical: { label: 'CRIT', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
};

export function CaseFileCard({
  psNumber,
  title,
  description,
  totalScore,
  isLocked = false,
  progress,
  severity,
  onClick,
  className,
}: CaseFileCardProps) {
  const isComplete = progress && progress.completed === progress.total;
  const severityStyle = severity ? severityConfig[severity] : null;

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02, rotateY: 2 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        "relative group cursor-pointer",
        isLocked && "cursor-not-allowed opacity-70",
        className
      )}
    >
      {/* Folder tab - positioned above the card */}
      <div className="relative ml-4 w-28 h-5 bg-linear-to-b from-[#1a2d4a] to-[#0F172A] rounded-t-md border-t-2 border-x-2 border-[#2979FF]/30 z-10 flex items-center justify-center">
        {severityStyle && (
          <span className={cn(
            "text-[10px] font-bold font-mono tracking-wider",
            severityStyle.color
          )}>
            {severityStyle.label}
          </span>
        )}
      </div>

      {/* Manila folder background */}
      <div className={cn(
        "relative rounded-lg overflow-hidden",
        "bg-linear-to-br from-[#0F172A] via-[#111827] to-[#0F172A]",
        "border-2 border-[#2979FF]/25",
        "shadow-lg shadow-black/60",
        !isLocked && "hover:border-[#00E5FF]/40 hover:shadow-[#00E5FF]/10",
        "transition-all duration-300"
      )}>
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]" />

        {/* Content */}
        <div className="relative p-6 pt-8">
          {/* Case number badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2979FF]/60" />
              <span className="text-xs font-mono text-[#2979FF]/70 tracking-wider">
                ALLOT {String(psNumber).padStart(3, '0')}
              </span>
            </div>

            {isLocked ? (
              <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-500/50 gap-1">
                CLASSIFIED
              </Badge>
            ) : isComplete ? (
              <Badge className="bg-green-900/30 text-green-400 border-green-500/50">
                SOLVED
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-500/50">
                ACTIVE
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className={cn(
            "text-lg font-bold mb-2 font-mono",
            isComplete ? "text-green-400" : "text-[#E5F0FF]"
          )}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-cyan-400/50 line-clamp-2 mb-4">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#2979FF]/20">
            {progress && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-[#1a2d4a] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#2979FF] to-[#00E5FF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs text-cyan-400/40">
                  {progress.completed}/{progress.total}
                </span>
              </div>
            )}
            <span className="text-sm font-bold text-[#00E5FF]">
              {totalScore} pts
            </span>
          </div>
        </div>

        {/* TOP SECRET stamp for locked */}
        {isLocked && (
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: -15, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="border-4 border-red-500/60 rounded-lg px-6 py-2 text-red-500/60 font-bold text-2xl font-mono tracking-widest">
              TOP SECRET
            </div>
          </motion.div>
        )}

        {/* SOLVED stamp */}
        {isComplete && (
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: -15, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="border-4 border-green-500/60 rounded-lg px-6 py-2 text-green-500/60 font-bold text-2xl font-mono tracking-widest">
              CASE CLOSED
            </div>
          </motion.div>
        )}

        {/* Crime scene tape for locked */}
        {isLocked && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -left-10 top-1/2 w-[150%] h-6 bg-yellow-400/90 -rotate-12 flex items-center">
              <div className="animate-marquee whitespace-nowrap text-black font-bold text-xs tracking-widest">
                ⚠️ DO NOT CROSS • CLASSIFIED • DO NOT CROSS • CLASSIFIED • DO NOT CROSS • CLASSIFIED • DO NOT CROSS • CLASSIFIED •
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
