'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderFive } from '@/components/ui/loader';
import { Spinner } from '@/components/ui/spinner';
import { GunBarrelIntro } from '@/components/ui/gun-barrel-intro';
import { NoirBackground } from '@/components/ui/noir-background';
import { ParticlesBackground } from '@/components/ui/particles-background';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
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
      window.history.replaceState({}, '', '/login');
    }
    if (success) {
      toast.success(decodeURIComponent(success));
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  return null;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Skip intro on keypress
  useEffect(() => {
    const handleKeyPress = () => {
      if (showIntro) {
        setShowIntro(false);
        setIntroComplete(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showIntro]);

  // Handle redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(user.role === 'admin' ? '/admin/submissions' : '/user/rules');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Show centered loader while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoaderFive text="Loading" />
      </div>
    );
  }

  return (
    <>
      {/* Gun Barrel Intro */}
      <GunBarrelIntro 
        onComplete={() => {
          setShowIntro(false);
          setIntroComplete(true);
        }} 
        skip={!showIntro}
      />

      <Toaster position="top-right" theme="dark" richColors />
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>

      <NoirBackground variant="scanlines">
        {/* Particles */}
        <ParticlesBackground variant="dust" className="fixed inset-0 pointer-events-none" />

        {/* Background decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Large fingerprint watermark - bottom left */}
          <svg 
            className="absolute -bottom-10 -left-10 w-80 h-80 opacity-[0.08]" 
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
          <div className="absolute top-24 right-24 w-40 h-40 opacity-[0.1]">
            <div className="absolute top-1/2 left-0 w-full h-px bg-amber-600" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-amber-600" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-amber-600 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-amber-600 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-600 rounded-full" />
          </div>

          {/* Faded redacted lines - top left */}
          <div className="absolute top-16 left-16 space-y-2 opacity-[0.08] -rotate-6">
            <div className="w-36 h-3 bg-amber-700 rounded-sm" />
            <div className="w-28 h-3 bg-amber-700 rounded-sm" />
            <div className="w-32 h-3 bg-amber-700 rounded-sm" />
          </div>

          {/* Faded redacted lines - bottom right */}
          <div className="absolute bottom-32 right-16 space-y-2 opacity-[0.08] rotate-3">
            <div className="w-24 h-3 bg-amber-700 rounded-sm" />
            <div className="w-36 h-3 bg-amber-700 rounded-sm" />
            <div className="w-20 h-3 bg-amber-700 rounded-sm" />
          </div>

          {/* Faded CLASSIFIED stamp - background */}
          <div className="absolute top-1/4 left-12 -rotate-12 opacity-[0.06] text-amber-600 font-mono text-5xl font-bold tracking-widest">
            CLASSIFIED
          </div>

          {/* Second CLASSIFIED stamp - bottom right */}
          <div className="absolute bottom-1/4 right-8 rotate-6 opacity-[0.04] text-red-700 font-mono text-3xl font-bold tracking-widest">
            TOP SECRET
          </div>

          {/* Fingerprint - top right area */}
          <svg 
            className="absolute top-40 right-48 w-48 h-48 opacity-[0.05]" 
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
        </div>

        <div className="min-h-screen flex items-center justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md px-4"
          >
            {/* Classified Dossier Style */}
            <div className="relative">
              {/* Folder tab */}
              <div className="relative ml-6 w-32 h-6 bg-amber-800/80 rounded-t-md border-t-2 border-x-2 border-amber-900/60" />
              
              {/* Main folder */}
              <div className="relative rounded-lg rounded-tl-none overflow-hidden border-2 border-amber-900/60 bg-amber-950/40 backdrop-blur-sm">
                
                {/* Paper texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]" />

                {/* TOP SECRET stamp */}
                <motion.div
                  initial={{ rotate: -12, scale: 0, opacity: 0 }}
                  animate={{ rotate: -12, scale: introComplete ? 1 : 0, opacity: introComplete ? 1 : 0 }}
                  transition={{ type: 'spring', delay: 0.5, bounce: 0.4 }}
                  className="absolute top-4 right-4 pointer-events-none z-20"
                >
                  <div className="border-3 border-red-600 rounded px-3 py-1 text-red-600 font-bold text-sm font-mono tracking-widest opacity-80">
                    TOP SECRET
                  </div>
                </motion.div>

                {/* Paper clip decoration */}
                <div className="absolute -top-2 right-16 w-6 h-12 border-2 border-neutral-400 rounded-full opacity-40" />

                <div className="relative p-8">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-0.5 bg-amber-700/50" />
                      <span className="text-amber-600/80 text-xs font-mono tracking-widest">FORM 007-A</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-amber-100 mb-2 font-mono tracking-wide">
                      AGENT VERIFICATION
                    </h2>
                    
                    <p className="text-amber-700/80 text-sm font-mono">
                      Security Operations Center - Access Request
                    </p>
                  </div>
                  
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-6 p-3 bg-red-900/30 border border-red-700/50 text-red-400 rounded text-sm font-mono"
                    >
                      ACCESS DENIED: {error}
                    </motion.div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <LabelInputContainer>
                      <Label htmlFor="username" className="text-amber-600/80 font-mono text-xs tracking-wider">
                        OPERATIVE CODENAME
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter codename"
                        className="bg-neutral-900/60 border-amber-900/50 font-mono text-amber-100 placeholder:text-neutral-600 focus:border-amber-700"
                        required
                      />
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="password" className="text-amber-600/80 font-mono text-xs tracking-wider">
                        CLEARANCE CODE
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter clearance code"
                          className="bg-neutral-900/60 border-amber-900/50 font-mono text-amber-100 placeholder:text-neutral-600 focus:border-amber-700 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600/60 hover:text-amber-500 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </LabelInputContainer>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group/btn relative flex items-center justify-center h-12 w-full rounded bg-amber-800 hover:bg-amber-700 font-bold text-amber-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-mono tracking-wider border border-amber-700"
                    >
                      {isLoading ? (
                        <Spinner className="w-5 h-5" />
                      ) : (
                        'VERIFY CREDENTIALS'
                      )}
                    </button>
                  </form>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-amber-900/30">
                    <div className="flex items-center justify-between text-xs text-amber-800/60 font-mono">
                      <span>REF: SOC-2026</span>
                      <span>EYES ONLY</span>
                    </div>
                  </div>
                </div>

                {/* Coffee stain decoration */}
                <div className="absolute bottom-8 left-4 w-16 h-16 rounded-full border-2 border-amber-900/20 opacity-30" />
              </div>
            </div>
          </motion.div>
        </div>
      </NoirBackground>
    </>
  );
}
