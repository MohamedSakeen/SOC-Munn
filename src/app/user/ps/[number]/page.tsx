'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { LoaderTwo } from '@/components/ui/loader';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { NoirBackground } from '@/components/ui/noir-background';
import { ParticlesBackground } from '@/components/ui/particles-background';
import { NoirDecorations } from '@/components/ui/noir-decorations';
import {
  detectiveQuotes,
  firstBloodQuotes,
  wrongAnswerQuotes,
  caseClosedQuotes,
  getRandomQuote,
  triggerCelebration,
  CaseClosedOverlay,
  MissionCompleteOverlay
} from '@/components/ui/detective-easter-eggs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Droplet,
  Trophy,
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';


interface Question {
  index: number;
  question: string;
  hint: string;
  placeholder: string;
  isCompleted: boolean;
  score: number;
  attempts: number;
  completedAt: string | null;
  isFirstBlood: boolean;
}

interface PSData {
  psNumber: number;
  title: string;
  description: string;
  link?: string;
  questions: Question[];
  totalScore: number;
}

export default function PSPage({ params }: { params: Promise<{ number: string }> }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [psNumber, setPsNumber] = useState<number>(0);
  const [ps, setPs] = useState<PSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submittingQuestion, setSubmittingQuestion] = useState<number | null>(null);
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [showCaseClosed, setShowCaseClosed] = useState(false);
  const [caseClosedMessage, setCaseClosedMessage] = useState('');

  const DashboardGradient = () => {
    return (
      <>
        <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
        <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-blue-600 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
      </>
    );
  };
  const SubmitGradient = () => {
    return (
      <>
        <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-green-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
        <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-green-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
      </>
    );
  };
  const LinkGradient = () => {
    return (
      <>
        <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
        <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
      </>
    );
  };

  useEffect(() => {
    if (authLoading) return;

    params.then(resolvedParams => {
      const num = parseInt(resolvedParams.number);
      setPsNumber(num);

      if (!user || user.role !== 'user') {
        router.push('/login');
        return;
      }

      fetchPS(num);
    });
  }, [params, user, authLoading, router]);

  const fetchPS = async (num: number) => {
    try {
      const response = await api.get(`/user/ps/${num}`);
      setPs(response.data);

      // Open first unanswered question
      const firstUnanswered = response.data.questions.findIndex((q: Question) => !q.isCompleted);
      setOpenQuestion(firstUnanswered >= 0 ? firstUnanswered : null);

      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch PS:', error);
      const message = error.response?.data?.message || 'Failed to load problem statement';
      router.push(`/user/dashboard?error=${encodeURIComponent(message)}`);
    }
  };

  const handleSubmitAnswer = async (questionIndex: number) => {
    const answer = answers[questionIndex]?.trim();
    if (!answer) {
      toast.error('Please enter an answer');
      return;
    }

    setSubmittingQuestion(questionIndex);
    try {
      const response = await api.post(`/user/ps/${psNumber}/check/${questionIndex}`, { answer });

      // Update local state with result
      setPs(prev => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          isCompleted: response.data.isCorrect,
          score: response.data.isCorrect ? response.data.scoreChange : updatedQuestions[questionIndex].score + response.data.scoreChange,
          attempts: response.data.attempts,
          isFirstBlood: response.data.isFirstBlood
        };

        // Check if all questions are now completed
        const allCompleted = updatedQuestions.every(q => q.isCompleted);
        if (allCompleted && response.data.isCorrect) {
          // Show case closed overlay
          setTimeout(() => {
            setCaseClosedMessage(getRandomQuote(caseClosedQuotes));
            setShowCaseClosed(true);
            triggerCelebration('caseClosed');
          }, 500);
        }

        return {
          ...prev,
          questions: updatedQuestions,
          totalScore: response.data.psScore
        };
      });

      if (response.data.isCorrect) {
        // Use detective quotes for correct answers
        if (response.data.isFirstBlood) {
          triggerCelebration('firstBlood');
          toast.success(getRandomQuote(firstBloodQuotes));
        } else {
          triggerCelebration('correct');
          toast.success(getRandomQuote(detectiveQuotes));
        }
        // Move to next unanswered question
        const nextUnanswered = ps?.questions.findIndex((q, i) => i > questionIndex && !q.isCompleted);
        if (nextUnanswered !== undefined && nextUnanswered >= 0) {
          setOpenQuestion(nextUnanswered);
        }
      } else {
        toast.error(getRandomQuote(wrongAnswerQuotes));
      }

      // Clear the answer field
      setAnswers(prev => ({ ...prev, [questionIndex]: '' }));

    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      const message = error.response?.data?.message || 'Failed to check answer';
      toast.error(message);
    } finally {
      setSubmittingQuestion(null);
    }
  };

  const completedCount = ps?.questions.filter(q => q.isCompleted).length || 0;
  const totalQuestions = ps?.questions.length || 12;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoaderTwo />
      </div>
    );
  }

  if (!ps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xl text-white">Problem statement not found</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />

      {/* Case Closed Overlay */}
      <CaseClosedOverlay
        show={showCaseClosed}
        message={caseClosedMessage}
        onClose={() => setShowCaseClosed(false)}
      />

      <NoirBackground variant="scanlines">
        {/* Particles */}
        <ParticlesBackground variant="dust" className="fixed inset-0 pointer-events-none" />

        {/* Noir decorations */}
        <NoirDecorations />

        {/* Header */}
        <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-[#1a2d4a]/70 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-[#2979FF]" />
                <div>
                  <h1 className="text-lg font-semibold text-white font-mono">{ps.title}</h1>
                  <p className="text-xs text-[#2979FF]/70 font-mono">ALLOT {String(psNumber).padStart(3, '0')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#111A2E]/60 border border-[#1a2d4a]/50 rounded-xl text-sm font-medium font-mono">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">{completedCount}/{totalQuestions}</span>
                </div>
                <button
                  onClick={() => router.push('/user/dashboard')}
                  className="group/btn flex items-center rounded-xl gap-2 relative px-4 py-3 text-sm bg-[#111A2E]/60 font-medium text-white border border-[#1a2d4a]/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.1)_inset] transition-all cursor-pointer font-mono hover:border-blue-600/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">BACK</span>
                  <DashboardGradient />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Problem Description - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="bg-black/70 border-[#2979FF]/20 backdrop-blur-sm lg:sticky lg:top-24">
                <CardHeader className="border-b border-[#2979FF]/20 pb-4">
                  <CardTitle className="text-lg text-[#E5F0FF] flex items-center gap-2 font-mono">
                    CASE BRIEFING
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed text-sm">
                    {ps.description}
                  </p>

                  {ps.link && (
                    <a
                      href={ps.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#111A2E]/60 hover:bg-[#1a2d4a]/60 border border-[#2979FF]/30 hover:border-[#2979FF]/60 rounded-md text-white font-mono text-sm transition-all duration-200 shadow-[0px_1px_1px_1px_rgba(41,121,255,0.15)_inset] relative"
                    >
                      <span>VIEW EVIDENCE FILES</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                      <LinkGradient />
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions - Right Side */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-[#00E5FF]" />
                <h2 className="text-xl font-bold text-white font-mono">EVIDENCE QUESTIONS</h2>
              </div>
              {ps.questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Collapsible
                    open={openQuestion === index}
                    onOpenChange={(open) => setOpenQuestion(open ? index : null)}
                  >
                    <Card className={cn(
                      "bg-black/60 border-[#1a2d4a]/50 backdrop-blur-sm transition-all duration-200",
                      openQuestion !== index && "hover:bg-[#111A2E]/60",
                      question.isCompleted && "border-green-500/30 bg-green-900/10",
                      openQuestion === index && "ring-1 ring-[#2979FF]/40"
                    )}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer transition-colors py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Question Number */}
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                                question.isCompleted
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-[#111A2E] text-[#2979FF]/70"
                              )}>
                                {question.isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-medium",
                                  question.isCompleted ? "text-green-400" : "text-white"
                                )}>
                                  {question.question}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {question.attempts > 0 && !question.isCompleted && (
                                <span className="text-xs text-[#2979FF]/40">{question.attempts} attempt{question.attempts > 1 ? 's' : ''}</span>
                              )}
                              {openQuestion === index ? (
                                <ChevronUp className="w-5 h-5 text-[#2979FF]/50" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[#2979FF]/50" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4 px-6 space-y-4">
                          {/* Answer Input */}
                          {!question.isCompleted ? (
                            <div className="flex flex-col gap-3">
                              <Input
                                value={answers[index] || ''}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                placeholder={question.placeholder}
                                className="w-full bg-[#111A2E]/80 border-[#1a2d4a] text-white placeholder:text-[#2979FF]/30 focus-visible:ring-[#2979FF] h-11"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !submittingQuestion) {
                                    handleSubmitAnswer(index);
                                  }
                                }}
                              />
                              <Button
                                onClick={() => handleSubmitAnswer(index)}
                                disabled={submittingQuestion === index || !answers[index]?.trim()}
                                className="group/btn relative px-6 py-2 text-sm rounded-md bg-[#111A2E]/80 font-medium text-white border border-[#1a2d4a]/60 shadow-[0px_1px_1px_1px_rgba(41,121,255,0.15)_inset] transition-all cursor-pointer h-10 w-fit mx-auto hover:border-[#2979FF]/50"
                              >
                                {submittingQuestion === index ? (
                                  <Spinner className="w-4 h-4" />
                                ) : (
                                  'Submit'
                                )}
                                <SubmitGradient />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <Check className="w-5 h-5 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">
                                Solved!
                              </span>
                            </div>
                          )}

                          {/* Attempts and Score Info */}
                          {question.attempts > 0 && !question.isCompleted && (
                            <div className="flex items-center justify-between text-xs text-[#2979FF]/40 font-mono">
                              <span>{question.attempts} attempt{question.attempts > 1 ? 's' : ''}</span>
                              {question.score < 0 && (
                                <span className="text-red-400">Penalty: {question.score} pts</span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </NoirBackground>
    </>
  );
}
