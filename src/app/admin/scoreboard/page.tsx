'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoaderFive } from '@/components/ui/loader';
import { Spinner } from '@/components/ui/spinner';
import { toast, Toaster } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Trophy, Droplet, Check, Eye, EyeOff, Play, Pause } from 'lucide-react';

interface Team {
  teamId: string;
  teamName: string;
  username: string;
  teamMembers: string[];
  totalScore: number;
  completedQuestions: number;
  firstBloods: number;
}

export default function AdminScoreboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showResultsToUsers, setShowResultsToUsers] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [allowPSAccess, setAllowPSAccess] = useState(false);
  const [togglingChallenge, setTogglingChallenge] = useState(false);

  const BottomGradient = ({ color }: { color: 'red' | 'blue' | 'green' | 'white' }) => {
    const colorMap = {
      red: 'via-red-500',
      blue: 'via-blue-500',
      green: 'via-green-500',
      white: 'via-white',
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

    fetchScoreboard();
    fetchSettings();
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setShowResultsToUsers(response.data.showResultsToUsers || false);
      setAllowPSAccess(response.data.allowPSAccess || false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const toggleResultsVisibility = async () => {
    setTogglingVisibility(true);
    try {
      const newValue = !showResultsToUsers;
      await api.put('/admin/settings', { showResultsToUsers: newValue });
      setShowResultsToUsers(newValue);
      toast.success(newValue ? 'Results are now visible to users' : 'Results are now hidden from users');
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('Failed to update settings');
    } finally {
      setTogglingVisibility(false);
    }
  };

  const toggleChallengeAccess = async () => {
    setTogglingChallenge(true);
    try {
      const newValue = !allowPSAccess;
      await api.put('/admin/settings', { allowPSAccess: newValue });
      setAllowPSAccess(newValue);
      toast.success(newValue ? 'Challenge has started! Users can now access problem statements.' : 'Challenge paused. Users cannot access problem statements.');
    } catch (error) {
      console.error('Failed to toggle challenge access:', error);
      toast.error('Failed to update settings');
    } finally {
      setTogglingChallenge(false);
    }
  };

  const fetchScoreboard = async () => {
    try {
      const response = await api.get('/admin/scoreboard');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch scoreboard:', error);
      toast.error('Failed to load scoreboard data');
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
        <LoaderFive text="Loading" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />
      <div className="min-h-screen bg-black">
        {/* Header */}
        <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-blue-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Leaderboard
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleChallengeAccess}
                  disabled={togglingChallenge}
                  className={cn(
                    "group/btn relative px-4 py-2 text-sm rounded-md font-medium transition-all cursor-pointer flex items-center gap-2 border",
                    allowPSAccess
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.2)_inset]"
                      : "bg-blue-950/40 text-white border-blue-900/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.1)_inset]"
                  )}
                >
                  {allowPSAccess ? (
                    <><Play className="w-4 h-4" /> Challenge Started</>
                  ) : (
                    <><Pause className="w-4 h-4" /> Challenge Paused</>
                  )}
                  <BottomGradient color="blue" />
                </button>
                <button
                  onClick={toggleResultsVisibility}
                  disabled={togglingVisibility}
                  className={cn(
                    "group/btn relative px-4 py-2 text-sm rounded-md font-medium transition-all cursor-pointer flex items-center gap-2 border",
                    showResultsToUsers
                      ? "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0px_1px_1px_1px_rgba(34,197,94,0.2)_inset]"
                      : "bg-blue-950/40 text-white border-blue-900/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.1)_inset]"
                  )}
                >
                  {showResultsToUsers ? (
                    <><Eye className="w-4 h-4" /> Visible to Users</>
                  ) : (
                    <><EyeOff className="w-4 h-4" /> Hidden from Users</>
                  )}
                  <BottomGradient color="green" />
                </button>
                <button
                  onClick={() => router.push('/admin/timeline')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-blue-950/40 font-medium text-white border border-blue-900/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.1)_inset] transition-all cursor-pointer hover:border-blue-600/70"
                >
                  Timeline
                  <BottomGradient color="blue" />
                </button>
                <button
                  onClick={() => router.push('/admin/submissions')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-blue-950/40 font-medium text-white border border-blue-900/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.1)_inset] transition-all cursor-pointer hover:border-blue-600/70"
                >
                  Submissions
                  <BottomGradient color="blue" />
                </button>
                <button
                  onClick={async () => { setRefreshing(true); await fetchScoreboard(); setRefreshing(false); }}
                  disabled={refreshing}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-blue-950/40 font-medium text-white border border-blue-900/50 shadow-[0px_1px_1px_1px_rgba(59,130,246,0.1)_inset] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 hover:border-blue-600/70"
                >
                  {refreshing ? <Spinner className="w-4 h-4" /> : 'Refresh'}
                  <BottomGradient color="blue" />
                </button>
                <button
                  onClick={logout}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-red-950/40 font-medium text-white border border-red-900/50 shadow-[0px_1px_1px_1px_rgba(220,38,38,0.15)_inset] transition-all cursor-pointer hover:border-red-600/70"
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
          {/* Top 3 Podium */}
          {teams.length >= 3 && (
            <div className="mb-8 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* Second Place */}
              <div className="pt-8">
                <Card className="bg-blue-950/30 border-blue-500/30 text-center">
                  <CardContent className="pt-6">
                    <div className="text-5xl mb-2">🥈</div>
                    <h3 className="text-lg font-bold text-white truncate">{teams[1].teamName}</h3>
                    <p className="text-3xl font-bold text-blue-300 mt-2">{teams[1].totalScore}</p>
                    <p className="text-xs text-blue-400/50 mt-1">{teams[1].completedQuestions} solved</p>
                  </CardContent>
                </Card>
              </div>

              {/* First Place */}
              <div>
                <Card className="bg-linear-to-b from-yellow-500/20 to-black/80 border-yellow-500/30 text-center shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                  <CardContent className="pt-6">
                    <div className="text-6xl mb-2">🥇</div>
                    <h3 className="text-xl font-bold text-white truncate">{teams[0].teamName}</h3>
                    <p className="text-4xl font-bold text-yellow-400 mt-2">{teams[0].totalScore}</p>
                    <p className="text-xs text-blue-400/50 mt-1">{teams[0].completedQuestions} solved</p>
                  </CardContent>
                </Card>
              </div>

              {/* Third Place */}
              <div className="pt-12">
                <Card className="bg-red-950/30 border-red-500/30 text-center">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-2">🥉</div>
                    <h3 className="text-lg font-bold text-white truncate">{teams[2].teamName}</h3>
                    <p className="text-2xl font-bold text-red-400 mt-2">{teams[2].totalScore}</p>
                    <p className="text-xs text-blue-400/50 mt-1">{teams[2].completedQuestions} solved</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <Card className="bg-black/90 border-blue-900/60 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-blue-950/30 border-b border-blue-900/60">
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-400 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-blue-400 uppercase tracking-wider">
                        Solved
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-blue-400 uppercase tracking-wider">
                        First Bloods
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-blue-400 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/30">
                    {teams.map((team, index) => {
                      const rankStyle = getRankBadge(index);
                      return (
                        <tr
                          key={team.teamId}
                          className={cn(
                            "transition-colors hover:bg-blue-950/20",
                            index < 3 && "bg-blue-950/10"
                          )}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                              rankStyle.bg, rankStyle.text, "border", rankStyle.border
                            )}>
                              {rankStyle.emoji || index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-lg font-bold text-white">{team.teamName}</p>
                              <p className="text-sm text-blue-400/40">{team.teamMembers?.join(', ') || team.username}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Check className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-medium">{team.completedQuestions}/72</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Droplet className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-medium">{team.firstBloods}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "text-2xl font-bold",
                              index === 0 ? "text-yellow-400" :
                                index === 1 ? "text-blue-300" :
                                  index === 2 ? "text-red-400" :
                                    "text-white"
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

              {teams.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-blue-400/40">No teams found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
