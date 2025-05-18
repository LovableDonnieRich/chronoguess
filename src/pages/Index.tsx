
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { YearGuess } from "@/components/YearGuess";
import { MonthGuess } from "@/components/MonthGuess";
import { DayGuess } from "@/components/DayGuess";
import { GameResult } from "@/components/GameResult";
import { GameHeader } from "@/components/GameHeader";
import { GameNav } from "@/components/GameNav";
import { UserStats } from "@/components/UserStats";
import { Footer } from "@/components/Footer";
import { 
  getTodaysEvent,
  evaluateGuess, 
  GameState, 
  initialGameState,
  hasPlayedToday
} from "@/lib/game-utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  saveUserScore, 
  getUserTotalScore, 
  hasUserPlayedEvent, 
  getLastPlayedDate,
  getCurrentGameState,
  saveGameState
} from "@/lib/supabase-utils";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Initialize game on first load
  useEffect(() => {
    const initGame = async () => {
      if (authLoading) return;
      
      // Redirect to auth if not logged in
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setLoading(true);
      console.log("Initializing game...");
      
      try {
        // Get today's event first
        console.log("Fetching today's event...");
        const todaysEvent = await getTodaysEvent();
        console.log("Today's event:", todaysEvent);
        
        if (!todaysEvent) {
          console.error("Failed to get today's event");
          setLoading(false);
          return;
        }
        
        // Check if user has already played today's event
        const hasPlayed = await hasUserPlayedEvent(user.id, todaysEvent.id);
        console.log("User has played today's event:", hasPlayed);
        
        // Get user's total score
        const userScore = await getUserTotalScore(user.id);
        console.log("User score:", userScore);
        
        if (hasPlayed) {
          console.log("User has already played today's event, getting current game state...");
          // Get current game state
          const currentGameState = await getCurrentGameState(user.id, todaysEvent.id);
          
          // If user has progress, set the game state accordingly
          if (currentGameState) {
            console.log("Found current game state:", currentGameState);
            
            setGameState({
              currentEvent: {
                id: todaysEvent.id,
                title: todaysEvent.title,
                description: todaysEvent.description,
                date: todaysEvent.date,
                category: todaysEvent.category,
                difficulty: todaysEvent.difficulty
              },
              score: {
                exactGuesses: userScore.exactGuesses,
                closeGuesses: userScore.closeGuesses,
                totalPoints: userScore.totalPoints
              },
              guessStage: 'result',
              yearGuess: currentGameState.year_guess,
              monthGuess: currentGameState.month_guess,
              dayGuess: currentGameState.day_guess,
              lastPlayedDate: new Date().toISOString().split('T')[0]
            });
          } else {
            console.log("No current game state found, starting new game...");
            // No progress found, but it's the same day, show that they can't play again
            await startNewGame(true);
          }
        } else {
          console.log("User hasn't played today, starting new game...");
          // Different day or never played, start a new game
          await startNewGame();
        }
      } catch (error) {
        console.error("Error initializing game:", error);
        toast({
          title: "Error",
          description: "Failed to initialize game. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    initGame();
  }, [authLoading, user, navigate]);
  
  const startNewGame = async (alreadyPlayed = false) => {
    setLoading(true);
    console.log("Starting new game, already played:", alreadyPlayed);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const todaysEvent = await getTodaysEvent();
      console.log("Today's event for new game:", todaysEvent);
      
      if (!todaysEvent) {
        console.error("Failed to get today's event for new game");
        setLoading(false);
        return;
      }
      
      // Get total user score from Supabase
      let userScore = {
        exactGuesses: 0,
        closeGuesses: 0,
        totalPoints: 0
      };
      
      if (user) {
        userScore = await getUserTotalScore(user.id);
        console.log("User score for new game:", userScore);
      }
      
      // Fix: use explicit literal type instead of removing 'as const'
      setGameState({
        ...initialGameState,
        currentEvent: todaysEvent,
        lastPlayedDate: today,
        guessStage: alreadyPlayed ? 'result' : 'year', // Explicitly using literal type
        score: {
          exactGuesses: userScore.exactGuesses,
          closeGuesses: userScore.closeGuesses,
          totalPoints: userScore.totalPoints
        }
      });
    } catch (error) {
      console.error("Error starting new game:", error);
      toast({
        title: "Error",
        description: "Failed to start a new game. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleYearGuess = async (year: number) => {
    if (!gameState.currentEvent || !user) return;
    
    const actualYear = gameState.currentEvent.date.getFullYear();
    const yearResult = evaluateGuess(year, actualYear, 'year');
    
    let newScore = { ...gameState.score };
    
    if (yearResult === 'exact') {
      newScore.exactGuesses += 1;
      newScore.totalPoints += 1;
      toast({
        title: "Exact year!",
        description: `You guessed the exact year: ${actualYear}`,
        variant: "default",
      });
    } else if (yearResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
      toast({
        title: "Close year!",
        description: `You were close! The exact year was ${actualYear}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Wrong year",
        description: `The exact year was ${actualYear}`,
        variant: "destructive",
      });
    }
    
    // Fix: Use explicit literal type instead of string
    const updatedGameState: GameState = {
      ...gameState,
      guessStage: 'month', // Correctly typed as literal
      yearGuess: year,
      score: newScore,
    };
    
    setGameState(updatedGameState);
    
    // Save the game state after each guess
    if (user && gameState.currentEvent) {
      await saveGameState(
        user.id,
        gameState.currentEvent.id,
        {
          guessStage: 'month',
          yearGuess: year,
          monthGuess: null,
          dayGuess: null,
          yearAccuracy: yearResult,
          totalPoints: newScore.totalPoints,
          exactGuesses: newScore.exactGuesses,
          closeGuesses: newScore.closeGuesses
        }
      );
    }
  };
  
  const handleMonthGuess = async (month: number) => {
    if (!gameState.currentEvent || !user) return;
    
    const actualMonth = gameState.currentEvent.date.getMonth() + 1; // JavaScript months are 0-indexed
    const monthResult = evaluateGuess(month, actualMonth, 'month');
    
    let newScore = { ...gameState.score };
    
    if (monthResult === 'exact') {
      newScore.exactGuesses += 1;
      newScore.totalPoints += 1;
      toast({
        title: "Exact month!",
        description: `You guessed the exact month: ${actualMonth}`,
        variant: "default",
      });
    } else if (monthResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
      toast({
        title: "Close month!",
        description: `You were close! The exact month was ${actualMonth}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Wrong month",
        description: `The exact month was ${actualMonth}`,
        variant: "destructive",
      });
    }
    
    // Fix: Use explicit literal type instead of string
    const updatedGameState: GameState = {
      ...gameState,
      guessStage: 'day', // Correctly typed as literal
      monthGuess: month,
      score: newScore,
    };
    
    setGameState(updatedGameState);
    
    // Save the game state after each guess
    if (user && gameState.currentEvent && gameState.yearGuess !== null) {
      await saveGameState(
        user.id,
        gameState.currentEvent.id,
        {
          guessStage: 'day',
          yearGuess: gameState.yearGuess,
          monthGuess: month,
          dayGuess: null,
          yearAccuracy: updatedGameState.yearGuess ? 
            evaluateGuess(updatedGameState.yearGuess, gameState.currentEvent.date.getFullYear(), 'year') : undefined,
          monthAccuracy: monthResult,
          totalPoints: newScore.totalPoints,
          exactGuesses: newScore.exactGuesses,
          closeGuesses: newScore.closeGuesses
        }
      );
    }
  };
  
  const handleDayGuess = async (day: number) => {
    if (!gameState.currentEvent || !user) return;
    
    const actualDay = gameState.currentEvent.date.getDate();
    const dayResult = evaluateGuess(day, actualDay, 'day');
    
    let newScore = { ...gameState.score };
    
    if (dayResult === 'exact') {
      newScore.exactGuesses += 1;
      newScore.totalPoints += 1;
      toast({
        title: "Exact day!",
        description: `You guessed the exact day: ${actualDay}`,
        variant: "default",
      });
    } else if (dayResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
      toast({
        title: "Close day!",
        description: `You were close! The exact day was ${actualDay}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Wrong day",
        description: `The exact day was ${actualDay}`,
        variant: "destructive",
      });
    }
    
    // Save score to Supabase if user is logged in
    if (user && gameState.currentEvent && gameState.yearGuess !== null && gameState.monthGuess !== null) {
      const yearResult = evaluateGuess(gameState.yearGuess, gameState.currentEvent.date.getFullYear(), 'year');
      const monthResult = evaluateGuess(gameState.monthGuess, gameState.currentEvent.date.getMonth() + 1, 'month');
      
      // Count total points from all guesses
      const totalPoints = 
        (yearResult === 'exact' ? 1 : yearResult === 'close' ? 0.5 : 0) +
        (monthResult === 'exact' ? 1 : monthResult === 'close' ? 0.5 : 0) +
        (dayResult === 'exact' ? 1 : dayResult === 'close' ? 0.5 : 0);
      
      // Count exact and close guesses
      const exactGuesses = [yearResult, monthResult, dayResult].filter(r => r === 'exact').length;
      const closeGuesses = [yearResult, monthResult, dayResult].filter(r => r === 'close').length;
      
      // Save user score to database
      await saveUserScore(
        user.id,
        gameState.currentEvent.id,
        gameState.yearGuess,
        yearResult,
        gameState.monthGuess,
        monthResult,
        day,
        dayResult,
        totalPoints,
        exactGuesses,
        closeGuesses
      );
      
      // Also save the complete game state
      await saveGameState(
        user.id,
        gameState.currentEvent.id,
        {
          guessStage: 'result',
          yearGuess: gameState.yearGuess,
          monthGuess: gameState.monthGuess,
          dayGuess: day,
          yearAccuracy: yearResult,
          monthAccuracy: monthResult,
          dayAccuracy: dayResult,
          totalPoints: totalPoints,
          exactGuesses: exactGuesses,
          closeGuesses: closeGuesses
        }
      );
      
      // Trigger stats refresh
      setStatsRefreshTrigger(prev => prev + 1);
    }
    
    setGameState({
      ...gameState,
      guessStage: 'result',
      dayGuess: day,
      score: newScore,
    });
  };
  
  const handleNextEvent = () => {
    // Since we're doing one event per day, we should show a message that they need to wait
    toast({
      title: "Come back tomorrow!",
      description: "A new historical event will be available tomorrow.",
      variant: "default",
    });
  };
  
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  if (!gameState.currentEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Button 
          onClick={() => startNewGame()}
          className="bg-white hover:bg-gray-200 text-black text-lg p-6 rounded-none border-4 border-white shadow-lg transition-transform hover:scale-105 font-mono uppercase"
        >
          Start game
        </Button>
        <Footer />
      </div>
    );
  }
  
  // Determine if the user has completed today's game
  const gameCompleted = gameState.guessStage === 'result';
  
  return (
    <div className="min-h-screen py-8 px-4 bg-black flex flex-col">
      <div className="container mx-auto max-w-4xl flex-1">
        <GameNav />
        <div className="mb-6">
          <UserStats refreshTrigger={statsRefreshTrigger} />
        </div>
        <GameHeader score={gameState.score} />
        
        {gameCompleted && (
          <Alert className="mb-6 bg-white border-4 border-black rounded-none">
            <AlertTitle className="text-black font-mono uppercase">Daily event completed!</AlertTitle>
            <AlertDescription className="text-black font-mono">
              You've already played today's event. Come back tomorrow for a new historical event!
            </AlertDescription>
          </Alert>
        )}
        
        <div className="animate-scale-in">
          {gameState.guessStage === 'year' && (
            <YearGuess 
              event={gameState.currentEvent} 
              onGuess={handleYearGuess} 
            />
          )}
          
          {gameState.guessStage === 'month' && gameState.yearGuess !== null && (
            <MonthGuess 
              event={gameState.currentEvent} 
              yearGuess={gameState.yearGuess}
              onGuess={handleMonthGuess} 
            />
          )}
          
          {gameState.guessStage === 'day' && 
           gameState.yearGuess !== null && 
           gameState.monthGuess !== null && (
            <DayGuess 
              event={gameState.currentEvent} 
              yearGuess={gameState.yearGuess}
              monthGuess={gameState.monthGuess}
              onGuess={handleDayGuess} 
            />
          )}
          
          {gameState.guessStage === 'result' && 
           gameState.yearGuess !== null && 
           gameState.monthGuess !== null &&
           gameState.dayGuess !== null && (
            <GameResult 
              event={gameState.currentEvent} 
              yearGuess={gameState.yearGuess}
              monthGuess={gameState.monthGuess}
              dayGuess={gameState.dayGuess}
              onNextEvent={handleNextEvent} 
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
