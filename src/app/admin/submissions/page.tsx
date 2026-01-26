'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoaderFive } from '@/components/ui/loader';
import { toast, Toaster } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, X, Trophy, Droplet, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface QuestionProgress {
  isCompleted: boolean;
  score: number;
  attempts: number;
  completedAt: string | null;
  isFirstBlood: boolean;
}

interface PSProgress {
  totalScore: number;
  questions: { [key: number]: QuestionProgress };
}

interface Team {
  teamId: string;
  teamName: string;
  username: string;
  teamMembers: string[];
  totalScore: number;
  psProgress: { [key: number]: PSProgress };
}

export default function AdminSubmissions() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const BottomGradient = ({ color }: { color: 'red' | 'blue' | 'green' | 'purple' }) => {
    const colorMap = {
      red: 'via-red-500',
      blue: 'via-blue-500',
      green: 'via-green-500',
      purple: 'via-purple-500'
    };
    return (
      <>
        <span className={`absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent ${colorMap[color]} to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100`} />
        <span className={`absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent ${colorMap[color]} to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100`} />
      </>
    );
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchSubmissions();
  }, [user, authLoading, router]);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/admin/submissions');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getCompletedCount = (team: Team) => {
    let count = 0;
    Object.values(team.psProgress).forEach(ps => {
      Object.values(ps.questions).forEach(q => {
        if (q.isCompleted) count++;
      });
    });
    return count;
  };

  const getFirstBloodCount = (team: Team) => {
    let count = 0;
    Object.values(team.psProgress).forEach(ps => {
      Object.values(ps.questions).forEach(q => {
        if (q.isFirstBlood) count++;
      });
    });
    return count;
  };

  const getTotalPenalty = (team: Team) => {
    let penalty = 0;
    Object.values(team.psProgress).forEach(ps => {
      Object.values(ps.questions).forEach(q => {
        // Count penalty: each wrong attempt before solving = -5
        if (!q.isCompleted && q.attempts > 0) {
          penalty += q.attempts * 5; // Each wrong attempt is -5
        } else if (q.isCompleted && q.attempts > 1) {
          penalty += (q.attempts - 1) * 5; // Attempts before correct answer
        }
      });
    });
    return penalty;
  };

  const getPSPenalty = (psProgress: PSProgress | undefined) => {
    if (!psProgress) return 0;
    let penalty = 0;
    Object.values(psProgress.questions).forEach(q => {
      if (!q.isCompleted && q.attempts > 0) {
        penalty += q.attempts * 5;
      } else if (q.isCompleted && q.attempts > 1) {
        penalty += (q.attempts - 1) * 5;
      }
    });
    return penalty;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoaderFive text="Loading" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />
      <div className="min-h-screen bg-black">
        {/* Header */}
        <nav className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-white">Submissions & Progress</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/admin/scoreboard')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer"
                >
                  Scoreboard
                  <BottomGradient color="green" />
                </button>
                <button
                  onClick={() => router.push('/admin/timeline')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer"
                >
                  Timeline
                  <BottomGradient color="blue" />
                </button>
                <button
                  onClick={fetchSubmissions}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer"
                >
                  Refresh
                  <BottomGradient color="purple" />
                </button>
                <button
                  onClick={logout}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer"
                >
                  Logout
                  <BottomGradient color="red" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Teams List */}
          <div className="space-y-4">
            {teams.map((team, index) => (
              <Collapsible
                key={team.teamId}
                open={expandedTeam === team.teamId}
                onOpenChange={(open) => setExpandedTeam(open ? team.teamId : null)}
              >
                <Card className={cn(
                  "bg-neutral-900/50 border-neutral-800",
                  expandedTeam !== team.teamId && "hover:bg-neutral-800/50"
                )}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                            index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                            index === 1 ? "bg-neutral-400/20 text-neutral-300" :
                            index === 2 ? "bg-orange-500/20 text-orange-400" :
                            "bg-neutral-800 text-neutral-400"
                          )}>
                            {index + 1}
                          </div>
                          
                          <div>
                            <CardTitle className="text-lg text-white">{team.teamName}</CardTitle>
                            <p className="text-sm text-neutral-500">{team.teamMembers?.join(', ') || team.username}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-neutral-400">Solved</p>
                              <p className="text-white font-bold">{getCompletedCount(team)}/72</p>
                            </div>
                            <div className="text-center">
                              <p className="text-neutral-400">First Bloods</p>
                              <p className="text-red-400 font-bold">{getFirstBloodCount(team)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-neutral-400">Penalty</p>
                              <p className="text-orange-400 font-bold">
                                {getTotalPenalty(team)>0 ? `-${getTotalPenalty(team)}` : 0}
                                </p>
                            </div>
                            <div className="text-center">
                              <p className="text-neutral-400">Score</p>
                              <p className="text-cyan-400 font-bold">{team.totalScore}</p>
                            </div>
                          </div>
                          
                          {expandedTeam === team.teamId ? (
                            <ChevronUp className="w-5 h-5 text-neutral-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="border-t border-neutral-800 pt-6">
                      {/* PS Grid */}
                      <div className="space-y-6">
                        {[1, 2, 3, 4, 5, 6].map(psNum => {
                          const psProgress = team.psProgress[psNum];
                          return (
                            <div key={psNum} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-white">PS {psNum}</h4>
                                <div className="flex items-center gap-2">
                                  {getPSPenalty(psProgress) > 0 && (
                                    <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-400 bg-orange-500/10">
                                      -{getPSPenalty(psProgress)} penalty
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs border-neutral-700 text-neutral-400">
                                    {psProgress?.totalScore || 0} pts
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Questions Grid */}
                              <div className="grid grid-cols-12 gap-2">
                                {[...Array(12)].map((_, qIndex) => {
                                  const question = psProgress?.questions?.[qIndex];
                                  const isCompleted = question?.isCompleted;
                                  const isFirstBlood = question?.isFirstBlood;
                                  const hasPenalty = question && (
                                    (isCompleted && question.attempts > 1) || 
                                    (!isCompleted && question.attempts > 0)
                                  );
                                  const penaltyAmount = question ? (
                                    isCompleted ? (question.attempts - 1) * 5 : question.attempts * 5
                                  ) : 0;
                                  
                                  return (
                                    <div
                                      key={qIndex}
                                      className={cn(
                                        "relative aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all",
                                        isCompleted 
                                          ? isFirstBlood 
                                            ? "bg-red-500/20 text-red-400 border border-red-500/50" 
                                            : "bg-green-500/20 text-green-400 border border-green-500/50"
                                          : question?.attempts && question.attempts > 0
                                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                                            : "bg-neutral-800/50 text-neutral-500 border border-neutral-700/50"
                                      )}
                                      title={`Q${qIndex + 1}: ${isCompleted 
                                        ? `Solved${isFirstBlood ? ' (First Blood!)' : ''} | Score: ${question?.score}pts${question && question.attempts > 1 ? ` | Penalty: -${(question.attempts - 1) * 5}pts (${question.attempts - 1} wrong)` : ''}` 
                                        : question?.attempts 
                                          ? `${question.attempts} wrong attempts | Penalty: -${question.attempts * 5}pts` 
                                          : 'Not attempted'}`}
                                    >
                                      {isCompleted ? (
                                        isFirstBlood ? (
                                          <Droplet className="w-3 h-3" />
                                        ) : (
                                          <Check className="w-3 h-3" />
                                        )
                                      ) : question?.attempts && question.attempts > 0 ? (
                                        <X className="w-3 h-3" />
                                      ) : (
                                        qIndex + 1
                                      )}
                                      {/* Penalty badge in corner */}
                                      {hasPenalty && penaltyAmount > 0 && (
                                        <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[7px] font-bold px-1 py-1 rounded-full leading-tight">
                                          -{penaltyAmount}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {teams.length === 0 && (
            <Card className="bg-neutral-900/50 border-neutral-800">
              <CardContent className="py-12 text-center">
                <p className="text-neutral-400">No teams found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
