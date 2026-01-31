'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { LoaderTwo } from '@/components/ui/loader';
import SpotlightCard from '@/components/SpotlightCard';
import { CaseFileCard } from '@/components/ui/case-file-card';
import { NoirBackground, RadarSweep } from '@/components/ui/noir-background';
import { ParticlesBackground } from '@/components/ui/particles-background';
import { NoirDecorations } from '@/components/ui/noir-decorations';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Lock, FileText, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';


interface ProblemStatement {
  psNumber: number;
  title: string;
  totalQuestions: number;
  completedQuestions: number;
  score: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Component to handle URL params toast
function ToastHandler() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    
    if (error) {
      toast.error(decodeURIComponent(error));
      window.history.replaceState({}, '', '/user/dashboard');
    }
    if (success) {
      toast.success(decodeURIComponent(success));
      window.history.replaceState({}, '', '/user/dashboard');
    }
  }, [searchParams]);

  return null;
}

export default function UserDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResultsToUsers, setShowResultsToUsers] = useState(false);
  const [allowPSAccess, setAllowPSAccess] = useState(false);

    const BottomGradient = () => {
    return (
      <>
        <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-red-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
        <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-red-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
      </>
    );
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'user') {
      router.push('/login');
      return;
    }

    fetchDashboard();
    fetchSettings();
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/user/settings');
      setShowResultsToUsers(response.data.showResultsToUsers || false);
      setAllowPSAccess(response.data.allowPSAccess || false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/user/dashboard');
      setTeamName(response.data.teamName);
      setTotalScore(response.data.totalScore);
      setProblemStatements(response.data.problemStatements);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (psNumber: number) => {
    if (!allowPSAccess) {
      toast.error('Challenge has not started yet. Please wait for admin to begin the event.');
      return;
    }
    router.push(`/user/ps/${psNumber}`);
  };

  const getProgressColor = (completed: number, total: number) => {
    const ratio = completed / total;
    if (ratio === 1) return 'from-green-600 to-green-400';
    if (ratio >= 0.5) return 'from-yellow-600 to-yellow-400';
    if (ratio > 0) return 'from-amber-600 to-amber-400';
    return 'from-neutral-600 to-neutral-500';
  };

  const getSpotlightColor = (completed: number, total: number) => {
    const ratio = completed / total;
    if (ratio === 1) return 'rgba(34, 197, 94, 0.3)';
    if (ratio >= 0.5) return 'rgba(234, 179, 8, 0.3)';
    if (ratio > 0) return 'rgba(217, 119, 6, 0.3)';
    return 'rgba(100, 100, 100, 0.2)';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoaderTwo />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>

      <NoirBackground variant="grid">
        {/* Particles */}
        <ParticlesBackground variant="dust" className="fixed inset-0 pointer-events-none" />
        
        {/* Noir decorations - fingerprints, stamps, etc */}
        <NoirDecorations />
        
        {/* Radar sweep in corner */}
        <RadarSweep />

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800/50 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white font-mono tracking-wide">SOC OPERATIONS</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/user/rules')}
                  className="relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-neutral-300 border border-neutral-700/50 transition-all cursor-pointer flex items-center gap-2 font-mono hover:border-amber-500/50 hover:text-amber-400"
                >
                  <BookOpen className="w-4 h-4" />
                  RULES
                </button>
                {showResultsToUsers && (
                  <>
                    <button
                      onClick={() => router.push('/user/scoreboard')}
                      className="relative px-4 py-2 text-sm rounded-md bg-yellow-500/20 font-medium text-yellow-400 border border-yellow-500/50 transition-all cursor-pointer flex items-center gap-2 font-mono"
                    >
                      <Trophy className="w-4 h-4" />
                      RANKINGS
                    </button>
                    <button
                      onClick={() => router.push('/user/timeline')}
                      className="relative px-4 py-2 text-sm rounded-md bg-amber-500/20 font-medium text-amber-400 border border-amber-500/50 transition-all cursor-pointer flex items-center gap-2 font-mono"
                    >
                      <TrendingUp className="w-4 h-4" />
                      INTEL
                    </button>
                  </>
                )}
                <button
                  onClick={logout}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer font-mono"
                >
                  LOGOUT
                  <BottomGradient />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Agent Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <SpotlightCard
              spotlightColor="rgba(217, 119, 6, 0.3)"
              className="overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs text-amber-400 font-mono tracking-wider mb-1">AGENT BRIEFING</p>
                    <h2 className="text-3xl font-bold text-white mb-1 font-mono">Welcome, {teamName}</h2>
                    <p className="text-neutral-400 text-sm">Your mission: Complete all allocations to earn points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 font-mono tracking-wider mb-1">CURRENT SCORE</p>
                    <p className="text-5xl font-bold text-amber-400 font-mono">
                      {totalScore}
                    </p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Case Management Header */}
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-white font-mono tracking-wide">CASE MANAGEMENT</h2>
            {!allowPSAccess && (
              <Badge className="bg-red-900/30 text-red-400 border-red-500/50 font-mono">
                <Lock className="w-3 h-3 mr-1" />
                CLASSIFIED
              </Badge>
            )}
          </div>

          {/* Case File Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemStatements.map((ps, index) => (
              <motion.div
                key={ps.psNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CaseFileCard
                  psNumber={ps.psNumber}
                  title={ps.title}
                  description="Investigate the incident and solve all questions to crack the case."
                  totalScore={ps.score}
                  isLocked={!allowPSAccess}
                  progress={{ completed: ps.completedQuestions, total: ps.totalQuestions }}
                  severity={ps.severity}
                  onClick={() => handleCardClick(ps.psNumber)}
                />
              </motion.div>
            ))}
          </div>

          {/* Scoring Intel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="my-8 p-6 rounded-xl bg-neutral-900/50 border border-neutral-800/50 backdrop-blur"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📋</span>
              <h3 className="text-lg font-semibold text-white font-mono">SCORING INTEL</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400">🩸</span>
                </div>
                <div>
                  <p className="text-white font-medium font-mono">FIRST BLOOD</p>
                  <p className="text-green-400 font-mono">+45 pts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium font-mono">CORRECT</p>
                  <p className="text-green-400 font-mono">+30 pts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400">✗</span>
                </div>
                <div>
                  <p className="text-white font-medium font-mono">WRONG</p>
                  <p className="text-red-400 font-mono">-5 pts</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </NoirBackground>
    </>
  );
}
