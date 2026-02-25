'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoaderTwo } from '@/components/ui/loader';
import { toast, Toaster } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoirBackground } from '@/components/ui/noir-background';
import { ParticlesBackground } from '@/components/ui/particles-background';
import { NoirDecorations } from '@/components/ui/noir-decorations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Trophy, Droplet, Check, ArrowLeft, TrendingUp, Shield } from 'lucide-react';

interface Team {
  teamId: string;
  teamName: string;
  teamMembers: string[];
  totalScore: number;
  completedQuestions: number;
  firstBloods: number;
}

export default function UserScoreboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const BottomGradient = ({ color }: { color: 'red' | 'blue' | 'white' | 'green' }) => {
    const colorMap = {
      red: 'via-red-500',
      blue: 'via-blue-500',
      white: 'via-white',
      green: 'via-green-500'
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

    if (!user || user.role !== 'user') {
      router.push('/login');
      return;
    }

    fetchScoreboard();
  }, [user, authLoading, router]);

  const fetchScoreboard = async () => {
    try {
      const response = await api.get('/user/scoreboard');
      setTeams(response.data);
    } catch (error: any) {
      console.error('Failed to fetch scoreboard:', error);
      if (error.response?.status === 403) {
        const message = error.response?.data?.message || 'Scoreboard is not available yet';
        toast.error(message);
        router.push('/user/dashboard');
      } else {
        toast.error('Failed to load scoreboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { emoji: '🥇', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' };
    if (index === 1) return { emoji: '🥈', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400/50' };
    if (index === 2) return { emoji: '🥉', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' };
    return { emoji: '', bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-900/60' };
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
      <NoirBackground variant="grid">
        <ParticlesBackground variant="dust" className="fixed inset-0 pointer-events-none opacity-50" />

        {/* Noir decorations */}
        <NoirDecorations />

        {/* Header */}
        <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-blue-900/60 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
                <Trophy className="w-6 h-6 text-yellow-400" />
                AGENT RANKINGS
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/user/timeline')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-blue-950/50 font-medium text-white border border-blue-900/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.2)_inset] transition-all cursor-pointer font-mono hover:border-blue-600/70"
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  INTEL
                  <BottomGradient color="blue" />
                </button>
                <button
                  onClick={() => router.push('/user/dashboard')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-blue-950/50 font-medium text-white border border-blue-900/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.2)_inset] transition-all cursor-pointer font-mono hover:border-blue-600/70"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  BACK
                  <BottomGradient color="blue" />
                </button>
                <button
                  onClick={logout}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-red-950/40 font-medium text-white border border-red-900/50 shadow-[0px_1px_1px_1px_rgba(220,38,38,0.2)_inset] transition-all cursor-pointer font-mono hover:border-red-600/70"
                >
                  LOGOUT
                  <BottomGradient color="red" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Stats Summary - Individual Team Stats */}
          {(() => {
            const myTeam = teams.find(t => t.teamName === user?.teamName);
            const myRank = teams.findIndex(t => t.teamName === user?.teamName) + 1;
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-black/80 border-blue-900/60">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-400/70">Your Rank</p>
                      <p className="text-2xl font-bold text-white">#{myRank || '-'} <span className="text-sm text-blue-400/40">of {teams.length}</span></p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-black/80 border-blue-900/60">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-400/70">Your Solved</p>
                      <p className="text-2xl font-bold text-white">
                        {myTeam?.completedQuestions || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-black/80 border-blue-900/60">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Droplet className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-400/70">Your First Bloods</p>
                      <p className="text-2xl font-bold text-white">
                        {myTeam?.firstBloods || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* Leaderboard Table */}
          <Card className="bg-black/80 border-blue-900/60">
            <CardHeader className="border-b border-blue-900/40">
              <CardTitle className="text-white">Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-900/50 bg-blue-950/20">
                      <th className="text-left py-3 px-4 text-blue-400/70 font-medium">Rank</th>
                      <th className="text-left py-3 px-4 text-blue-400/70 font-medium">Team</th>
                      <th className="text-center py-3 px-4 text-blue-400/70 font-medium">
                        <span className="flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" /> Solved
                        </span>
                      </th>
                      <th className="text-center py-3 px-4 text-blue-400/70 font-medium">
                        <span className="flex items-center justify-center gap-1">
                          <Droplet className="w-4 h-4 text-red-400" /> First Bloods
                        </span>
                      </th>
                      <th className="text-right py-3 px-4 text-blue-400/70 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => {
                      const badge = getRankBadge(index);
                      const isCurrentTeam = team.teamName === user?.teamName;
                      return (
                        <tr
                          key={team.teamId}
                          className={cn(
                            "border-b border-blue-900/30 transition-colors",
                            isCurrentTeam ? "bg-blue-900/20" : "hover:bg-blue-950/30"
                          )}
                        >
                          <td className="py-4 px-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold border",
                              badge.bg, badge.text, badge.border
                            )}>
                              {badge.emoji || index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className={cn(
                                "font-semibold",
                                isCurrentTeam ? "text-blue-400" : "text-white"
                              )}>
                                {team.teamName}
                                {isCurrentTeam && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                              </p>
                              <p className="text-xs text-blue-400/40">
                                {team.teamMembers?.slice(0, 2).join(', ')}
                                {team.teamMembers?.length > 2 && ` +${team.teamMembers.length - 2}`}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-blue-400 font-medium">{team.completedQuestions}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-red-400 font-medium">{team.firstBloods}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={cn(
                              "text-xl font-bold",
                              index === 0 ? "text-yellow-400" :
                                index === 1 ? "text-blue-300" :
                                  index === 2 ? "text-red-400" : "text-white"
                            )}>
                              {team.totalScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </NoirBackground>
    </>
  );
}
