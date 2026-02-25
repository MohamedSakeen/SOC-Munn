'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderTwo } from '@/components/ui/loader';
import { Spinner } from '@/components/ui/spinner';
import { NoirBackground } from '@/components/ui/noir-background';
import { ParticlesBackground } from '@/components/ui/particles-background';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import api from '@/lib/api';

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
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regTeamName, setRegTeamName] = useState('');
  const [regMember1, setRegMember1] = useState('');
  const [regMember2, setRegMember2] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.push('/admin/submissions');
      } else {
        // Both 'user' and legacy 'team' roles go to user rules
        router.push('/user/rules');
      }
    }
  }, [user, authLoading, router]);

  // Reset errors when switching modes
  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setRegError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Clearance codes do not match');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Clearance code must be at least 6 characters');
      return;
    }

    setIsRegistering(true);
    try {
      const membersArray = [regMember1, regMember2].filter(Boolean);

      await api.post('/auth/register', {
        username: regTeamName,
        password: regPassword,
        teamName: regTeamName,
        email: regEmail,
        teamMembers: membersArray,
      });

      toast.success('Registration successful! Please log in.');
      setMode('login');
      setUsername(regTeamName);
      setPassword('');
      // Clear register form
      setRegTeamName('');
      setRegMember1('');
      setRegMember2('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setRegError(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  if (authLoading) {
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

      <NoirBackground variant="scanlines">
        {/* Particles */}
        <ParticlesBackground variant="dust" className="fixed inset-0 pointer-events-none" />

        {/* Background decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute -bottom-10 -left-10 w-80 h-80 opacity-[0.15]" viewBox="0 0 100 100">
            <g fill="none" stroke="currentColor" strokeWidth="0.8" className="text-[#00E5FF]">
              {[...Array(15)].map((_, i) => (
                <ellipse key={i} cx="50" cy="50" rx={10 + i * 3} ry={15 + i * 3} transform={`rotate(${i * 2}, 50, 50)`} />
              ))}
            </g>
          </svg>
          <div className="absolute top-24 right-24 w-40 h-40 opacity-[0.15]">
            <div className="absolute top-1/2 left-0 w-full h-px bg-[#00E5FF]" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-[#00E5FF]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-[#00E5FF] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-[#00E5FF] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#00E5FF] rounded-full" />
          </div>
          <div className="absolute top-16 left-16 space-y-2 opacity-[0.12] -rotate-6">
            <div className="w-36 h-3 bg-[#2979FF] rounded-sm" />
            <div className="w-28 h-3 bg-[#2979FF] rounded-sm" />
            <div className="w-32 h-3 bg-[#2979FF] rounded-sm" />
          </div>
          <div className="absolute bottom-32 right-16 space-y-2 opacity-[0.12] rotate-3">
            <div className="w-24 h-3 bg-[#2979FF] rounded-sm" />
            <div className="w-36 h-3 bg-[#2979FF] rounded-sm" />
            <div className="w-20 h-3 bg-[#2979FF] rounded-sm" />
          </div>
          <div className="absolute top-1/4 left-12 -rotate-12 opacity-[0.08] text-[#00E5FF] font-mono text-5xl font-bold tracking-widest">
            CLASSIFIED
          </div>
          <div className="absolute bottom-1/4 right-8 rotate-6 opacity-[0.06] text-[#FF3355] font-mono text-3xl font-bold tracking-widest">
            TOP SECRET
          </div>
          <svg className="absolute top-40 right-48 w-48 h-48 opacity-[0.1]" viewBox="0 0 100 100">
            <g fill="none" stroke="currentColor" strokeWidth="0.6" className="text-[#2979FF]">
              {[...Array(12)].map((_, i) => (
                <ellipse key={i} cx="50" cy="50" rx={8 + i * 3.5} ry={12 + i * 3.5} transform={`rotate(${-i * 3}, 50, 50)`} />
              ))}
            </g>
          </svg>
        </div>

        <div className="min-h-screen flex items-center justify-center relative z-10 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md px-4"
          >
            {/* Classified Dossier Style */}
            <div className="relative">
              {/* Folder tab */}
              <div className="relative ml-6 w-32 h-6 bg-[#0F172A] rounded-t-md border-t-2 border-x-2 border-[#2979FF]/30" />

              {/* Main folder */}
              <div className="relative rounded-lg rounded-tl-none overflow-hidden border-2 border-[#2979FF]/30 bg-[#111827]/70 backdrop-blur-sm">

                {/* Paper texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]" />

                {/* TOP SECRET stamp */}
                <motion.div
                  initial={{ rotate: 10, scale: 0, opacity: 0 }}
                  animate={{ rotate: 10, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.5, bounce: 0.4 }}
                  className="absolute top-2.5 right-2 rotate-[-2deg] pointer-events-none z-10"
                >
                  <div className="border-2 border-[#FF3355] rounded px-3 py-1 text-[#FF3355] font-bold text-sm font-mono tracking-widest opacity-80">
                    TOP SECRET
                  </div>
                </motion.div>

                {/* Paper clip */}
                <div className="absolute -top-2 right-16 w-6 h-12 border-2 border-blue-400 rounded-full opacity-40" />

                <div className="relative p-8">
                  {/* Mode Toggle Tabs */}
                  <div className="flex items-center gap-1 mb-8 p-1 bg-[#0B1220]/60 rounded-lg border border-[#1a2d4a]/50">
                    <button
                      onClick={() => switchMode('login')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-mono font-bold tracking-wider transition-all duration-200",
                        mode === 'login'
                          ? "bg-[#2979FF]/20 text-[#00E5FF] border border-[#2979FF]/40"
                          : "text-[#9CA3AF] hover:text-white"
                      )}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      AUTHENTICATE
                    </button>
                    <button
                      onClick={() => switchMode('register')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-mono font-bold tracking-wider transition-all duration-200",
                        mode === 'register'
                          ? "bg-[#2979FF]/20 text-[#00E5FF] border border-[#2979FF]/40"
                          : "text-[#9CA3AF] hover:text-white"
                      )}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      ENLIST
                    </button>
                  </div>

                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-0.5 bg-[#2979FF]/50" />
                      <span className="text-[#2979FF]/70 text-xs font-mono tracking-widest">
                        {mode === 'login' ? 'FORM 007-A' : 'FORM 007-B'}
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h2 className="text-2xl font-bold text-white mb-1 font-mono tracking-wide">
                          {mode === 'login' ? 'ANALYST' : 'RECRUIT'}
                        </h2>
                        <p className="text-[#9CA3AF] text-sm font-mono">
                          {mode === 'login'
                            ? 'Security Operations Center — Access Request'
                            : 'Security Operations Center — Enlistment Form'}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* FORMS */}
                  <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                      <motion.div
                        key="login-form"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-5 p-3 bg-red-900/30 border border-red-700/50 text-red-400 rounded text-sm font-mono"
                          >
                            ACCESS DENIED: {error}
                          </motion.div>
                        )}
                        <form className="space-y-5" onSubmit={handleLogin}>
                          <LabelInputContainer>
                            <Label htmlFor="username" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                              OPERATIVE CODENAME
                            </Label>
                            <Input
                              id="username"
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Enter codename"
                              className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600"
                              required
                            />
                          </LabelInputContainer>

                          <LabelInputContainer>
                            <Label htmlFor="password" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                              CLEARANCE CODE
                            </Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter clearance code"
                                className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600 pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </LabelInputContainer>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="group/btn relative flex items-center justify-center h-12 w-full rounded bg-[#111A2E] hover:bg-[#1a2d4a] font-bold text-[#00E5FF] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-mono tracking-wider border border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.15)] hover:shadow-[0_0_30px_rgba(0,229,255,0.25)]"
                          >
                            {isLoading ? <Spinner className="w-5 h-5" /> : 'VERIFY CREDENTIALS'}
                          </button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="register-form"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {regError && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-5 p-3 bg-red-900/30 border border-red-700/50 text-red-400 rounded text-sm font-mono"
                          >
                            ERROR: {regError}
                          </motion.div>
                        )}
                        <form className="space-y-4" onSubmit={handleRegister}>
                          <LabelInputContainer>
                            <Label htmlFor="reg-team" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                              UNIT DESIGNATION <span className="text-[#9CA3AF]/60">(Team Name)</span>
                            </Label>
                            <Input
                              id="reg-team"
                              type="text"
                              value={regTeamName}
                              onChange={(e) => setRegTeamName(e.target.value)}
                              placeholder="e.g. Alpha Squad"
                              className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600"
                              required
                            />
                          </LabelInputContainer>

                          <div className="grid grid-cols-2 gap-3">
                            <LabelInputContainer>
                              <Label htmlFor="reg-member1" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                                OPERATIVE 1 <span className="text-red-400/70">*</span>
                              </Label>
                              <Input
                                id="reg-member1"
                                type="text"
                                value={regMember1}
                                onChange={(e) => setRegMember1(e.target.value)}
                                placeholder="Full name"
                                className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600"
                                required
                              />
                            </LabelInputContainer>
                            <LabelInputContainer>
                              <Label htmlFor="reg-member2" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                                OPERATIVE 2 <span className="text-[#9CA3AF]/50"></span>
                              </Label>
                              <Input
                                id="reg-member2"
                                type="text"
                                value={regMember2}
                                onChange={(e) => setRegMember2(e.target.value)}
                                placeholder="Full name"
                                className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600"
                              />
                            </LabelInputContainer>
                          </div>

                          <LabelInputContainer>
                            <Label htmlFor="reg-email" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                              UNIT MAIL ID
                            </Label>
                            <Input
                              id="reg-email"
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="team@example.com"
                              className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600"
                              required
                            />
                          </LabelInputContainer>

                          <LabelInputContainer>
                            <Label htmlFor="reg-password" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                              CLEARANCE CODE
                            </Label>
                            <div className="relative">
                              <Input
                                id="reg-password"
                                type={showRegPassword ? 'text' : 'password'}
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600 pr-10"
                                required
                              />
                              <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors">
                                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </LabelInputContainer>

                          <LabelInputContainer>
                            <Label htmlFor="reg-confirm" className="text-[#2979FF]/80 font-mono text-xs tracking-wider">
                              CONFIRM CLEARANCE CODE
                            </Label>
                            <div className="relative">
                              <Input
                                id="reg-confirm"
                                type={showRegConfirm ? 'text' : 'password'}
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                placeholder="Repeat clearance code"
                                className="bg-[#0B1220]/60 border-[#1a2d4a]/50 font-mono text-white placeholder:text-cyan-400/40 focus:border-cyan-600 pr-10"
                                required
                              />
                              <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors">
                                {showRegConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </LabelInputContainer>

                          <button
                            type="submit"
                            disabled={isRegistering}
                            className="group/btn relative flex items-center justify-center h-12 w-full rounded bg-[#111A2E] hover:bg-[#1a2d4a] font-bold text-[#00E5FF] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-mono tracking-wider border border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.15)] hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] mt-2"
                          >
                            {isRegistering ? <Spinner className="w-5 h-5" /> : 'SUBMIT ENLISTMENT'}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-[#2979FF]/20">
                    <div className="flex items-center justify-between text-xs text-[#9CA3AF]/50 font-mono">
                      <span>REF: SOC-2026</span>
                      <span>EYES ONLY</span>
                    </div>
                  </div>
                </div>

                {/* Coffee stain decoration */}
                <div className="absolute bottom-8 left-4 w-16 h-16 rounded-full border-2 border-[#2979FF]/20 opacity-30" />
              </div>
            </div>
          </motion.div>
        </div>
      </NoirBackground>
    </>
  );
}
