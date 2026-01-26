//@ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoaderFive } from '@/components/ui/loader';
import { toast, Toaster } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineEvent {
  timestamp: string;
  score: number;
  psNumber?: number;
  questionIndex?: number;
}

interface TeamTimeline {
  teamId: string;
  teamName: string;
  timeline: TimelineEvent[];
}

// Generate dynamic colors for teams using HSL color space
// This ensures good color distribution and vibrant colors
const generateTeamColor = (index: number, total: number): string => {
  // Use golden ratio for better color distribution
  const goldenRatio = 0.618033988749895;
  const hue = (index * goldenRatio * 360) % 360;
  
  // Vary saturation and lightness slightly for visual interest
  const saturation = 65 + (index % 3) * 10; // 65%, 75%, 85%
  const lightness = 55 + (index % 2) * 5;   // 55%, 60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export default function AdminTimeline() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teamsTimeline, setTeamsTimeline] = useState<TeamTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [chartData, setChartData] = useState<any[]>([]);

  const BottomGradient = ({ color }: { color: 'red' | 'blue' | 'purple' | 'green' }) => {
    const colorMap = {
      red: 'via-red-500',
      blue: 'via-blue-500',
      purple: 'via-purple-500',
      green: 'via-green-500'
    };
    return (
      <>
        <span className={`absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent ${colorMap[color]} to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100`} />
        <span className={`absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent ${colorMap[color]} to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100`} />
      </>
    );
  };

  // Get color for a team
  const getTeamColor = (teamId: string, index?: number): string => {
    const idx = index ?? teamsTimeline.findIndex(t => t.teamId === teamId);
    return generateTeamColor(idx, teamsTimeline.length);
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchTimeline();
  }, [user, authLoading, router]);

  const fetchTimeline = async () => {
    try {
      const response = await api.get('/admin/score-timeline');
      setTeamsTimeline(response.data);
      // Select all teams by default
      const allTeamIds = new Set(response.data.map((t: TeamTimeline) => t.teamId));
      setSelectedTeams(allTeamIds);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      toast.error('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  // Build chart data when timeline or selection changes
  useEffect(() => {
    if (teamsTimeline.length === 0) return;

    // Collect all timestamps from selected teams
    const allEvents: { timestamp: Date; teamId: string; score: number }[] = [];
    
    teamsTimeline.forEach(team => {
      if (selectedTeams.has(team.teamId)) {
        team.timeline.forEach(event => {
          allEvents.push({
            timestamp: new Date(event.timestamp),
            teamId: team.teamId,
            score: event.score
          });
        });
      }
    });

    if (allEvents.length === 0) {
      setChartData([]);
      return;
    }

    // Sort all events by timestamp
    allEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Get unique timestamps
    const uniqueTimestamps = [...new Set(allEvents.map(e => e.timestamp.getTime()))].sort((a, b) => a - b);

    // Build chart data with running scores for each team
    const teamScores: { [teamId: string]: number } = {};
    
    const data = uniqueTimestamps.map(ts => {
      const point: any = {
        timestamp: ts,
        time: new Date(ts).toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Update scores for teams that have events at this timestamp
      allEvents.filter(e => e.timestamp.getTime() === ts).forEach(event => {
        teamScores[event.teamId] = event.score;
      });

      // Add current score for each selected team
      teamsTimeline.forEach(team => {
        if (selectedTeams.has(team.teamId)) {
          point[team.teamId] = teamScores[team.teamId] || 0;
        }
      });

      return point;
    });

    setChartData(data);
  }, [teamsTimeline, selectedTeams]);

  const toggleTeam = (teamId: string) => {
    // Show only this team
    setSelectedTeams(new Set([teamId]));
  };

  const selectAllTeams = () => {
    setSelectedTeams(new Set(teamsTimeline.map(t => t.teamId)));
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
        <nav className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b rounded-b-3xl border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Score Timeline
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/admin/scoreboard')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer"
                >
                  Scoreboard
                  <BottomGradient color="green" />
                </button>
                <button
                  onClick={() => router.push('/admin/submissions')}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer"
                >
                  Submissions
                  <BottomGradient color="purple" />
                </button>
                <button
                  onClick={fetchTimeline}
                  className="group/btn relative px-4 py-2 text-sm rounded-md bg-neutral-800/50 font-medium text-white shadow-[0px_1px_1px_1px_#ffffff40_inset,0px_0px_0px_0px_#ffffff40_inset] transition-all cursor-pointer"
                >
                  Refresh
                  <BottomGradient color="blue" />
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
          {/* Score Timeline Chart */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader className="border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">Team Score Progression Over Time</CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllTeams}
                    className="px-4 py-2 text-xs bg-neutral-800/50 text-white rounded-md border border-neutral-700 hover:bg-neutral-700/50 transition-colors"
                  >
                    Select All
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Team Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {teamsTimeline.map((team, index) => {
                  const color = getTeamColor(team.teamId, index);
                  const isSelected = selectedTeams.has(team.teamId);
                  return (
                    <button
                      key={team.teamId}
                      onClick={() => toggleTeam(team.teamId)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        isSelected
                          ? "bg-neutral-700 text-white"
                          : "bg-neutral-800/50 text-neutral-500 hover:bg-neutral-700/50"
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: isSelected ? color : '#525252' }}
                      />
                      {team.teamName}
                    </button>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="h-[500px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis 
                        dataKey="time" 
                        stroke="#525252" 
                        tick={{ fill: '#a3a3a3', fontSize: 12 }}
                        tickLine={{ stroke: '#525252' }}
                      />
                      <YAxis 
                        stroke="#525252" 
                        tick={{ fill: '#a3a3a3', fontSize: 12 }}
                        tickLine={{ stroke: '#525252' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          border: '1px solid #404040',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      {teamsTimeline.map((team, index) => {
                        if (!selectedTeams.has(team.teamId)) return null;
                        const color = getTeamColor(team.teamId, index);
                        return (
                          <Line
                            key={team.teamId}
                            type="stepAfter"
                            dataKey={team.teamId}
                            name={team.teamName}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-500">
                    {selectedTeams.size === 0 ? 'Select teams to view timeline' : 'No data available'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
