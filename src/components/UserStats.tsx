
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTotalScore } from "@/lib/supabase-utils";

export function UserStats() {
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
          gamesPlayed: userScores.exactGuesses + userScores.closeGuesses > 0 ? 1 : 0 // This will be improved later when we track games played
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse h-24 bg-slate-200 rounded-lg"></div>;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-indigo-600">{stats.totalPoints}</span>
            <span className="text-sm text-muted-foreground">Total Points</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-600">{stats.exactGuesses}</span>
            <span className="text-sm text-muted-foreground">Exact Guesses</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-amber-600">{stats.closeGuesses}</span>
            <span className="text-sm text-muted-foreground">Close Guesses</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-blue-600">{stats.gamesPlayed}</span>
            <span className="text-sm text-muted-foreground">Games Played</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
