
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTotalScore } from "@/lib/supabase-utils";

interface UserStatsProps {
  refreshTrigger?: number; // Optional prop that triggers a refresh when it changes
}

export function UserStats({ refreshTrigger }: UserStatsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    exactGuesses: 0,
    closeGuesses: 0,
    gamesPlayed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const userScores = await getUserTotalScore(user.id);
        setStats({
          totalPoints: userScores.totalPoints,
          exactGuesses: userScores.exactGuesses,
          closeGuesses: userScores.closeGuesses,
          gamesPlayed: userScores.gamesPlayed
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, refreshTrigger]); // Re-fetch when user or refreshTrigger changes

  if (loading) {
    return <div className="animate-pulse h-24 bg-black/10 rounded-lg"></div>;
  }

  return (
    <Card className="border-black/30 bg-white">
      <CardHeader className="pb-2 border-b border-black/20">
        <CardTitle className="text-xl font-mono uppercase">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-2">
          <div className="flex flex-col">
            <span className="text-2xl font-mono font-bold">{stats.totalPoints}</span>
            <span className="text-sm text-black/70 uppercase tracking-tight">Total Points</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-mono font-bold">{stats.exactGuesses}</span>
            <span className="text-sm text-black/70 uppercase tracking-tight">Exact Guesses</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-mono font-bold">{stats.closeGuesses}</span>
            <span className="text-sm text-black/70 uppercase tracking-tight">Close Guesses</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-mono font-bold">{stats.gamesPlayed}</span>
            <span className="text-sm text-black/70 uppercase tracking-tight">Games Played</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
