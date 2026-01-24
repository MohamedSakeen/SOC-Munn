'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Submission } from '@/types';
import { LoaderFive } from '@/components/ui/loader';
import SpotlightCard from '@/components/SpotlightCard';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

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
  const [assignedPS, setAssignedPS] = useState<number[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPS, setSelectedPS] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (authLoading) return;
    
    if (!user || user.role !== 'user') {
      router.push('/login');
      return;
    }

    fetchDashboard();
  }, [user, authLoading, router]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/user/dashboard');
      setTeamName(response.data.teamName);
      setAssignedPS(response.data.assignedPS);
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (psNumber: number) => {
    const submission = submissions.find(s => s.psNumber === psNumber);
    
    if (submission?.isCompleted) {
      toast.warning('You have already submitted this challenge!');
      return;
    }

    if (submission?.hasStarted) {
      router.push(`/user/ps/${psNumber}`);
    } else {
      setSelectedPS(psNumber);
      setShowConfirm(true);
    }
  };

  const confirmStart = async () => {
    if (!selectedPS) return;
    
    setIsStarting(true);
    try {
      await api.post(`/user/ps/${selectedPS}/start`);
      setShowConfirm(false);
      toast.success('Challenge started! Timer is running.');
      router.push(`/user/ps/${selectedPS}`);
    } catch (error) {
      console.error('Failed to start challenge:', error);
      toast.error('Failed to start challenge. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderFive text="Loading" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>
      <div className="min-h-screen bg-black">
        {/* Simple Navbar */}
        <nav className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-white">SOC Challenge</h1>
              <div className="flex items-center gap-4">
                <span className="text-neutral-300 text-sm sm:text-base">{teamName}</span>
                <button
                  onClick={logout}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-gradient-to-br from-red-900 to-red-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:from-red-800 hover:to-red-500 transition-all"
                >
                  Logout
                  <BottomGradient />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-3xl font-bold mb-8 text-white">Your Challenges</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedPS.map((psNumber) => {
              const submission = submissions.find(s => s.psNumber === psNumber);
              return (
                <SpotlightCard
                  key={psNumber}
                  spotlightColor={submission?.isCompleted ? 'rgba(34, 197, 94, 0.3)' : submission?.hasStarted ? 'rgba(234, 179, 8, 0.3)' : 'rgba(59, 130, 246, 0.3)'}
                  className={cn(
                    "cursor-pointer transition-all duration-300",
                    submission?.isCompleted ? 'opacity-70' : 'hover:scale-105'
                  )}
                >
                  <div onClick={() => handleCardClick(psNumber)}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Problem Statement {psNumber}</h3>
                      {submission?.isCompleted && (
                        <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">
                          Completed
                        </span>
                      )}
                      {submission?.hasStarted && !submission?.isCompleted && (
                        <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-400">
                      {submission?.isCompleted
                        ? 'Challenge completed!'
                        : submission?.hasStarted
                        ? 'Continue your challenge'
                        : 'Click to start'}
                    </p>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* Confirmation Dialog using Shadcn Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Are you sure?</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Once you start, the timer will begin. You can only submit this challenge once.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isStarting}
                className="bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStart}
                disabled={isStarting}
                className="bg-gradient-to-br from-blue-900 to-blue-600 hover:from-blue-800 hover:to-blue-500 text-white"
              >
                {isStarting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Starting...
                  </>
                ) : (
                  'Start Challenge'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
