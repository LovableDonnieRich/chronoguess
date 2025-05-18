
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
  getCurrentGameState
} from "@/lib/supabase-utils";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [loading, setLoading] = useState<boolean>(true);
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
      
      // Get the last played date from database
      const lastPlayedDate = await getLastPlayedDate(user.id);
      
      if (lastPlayedDate && hasPlayedToday(lastPlayedDate)) {
        // Get the current event and user's progress from the database
        const todaysEvent = await getTodaysEvent();
        
        // Get user's total score
        const userScore = await getUserTotalScore(user.id);
        
        // Get current game state
        const currentGameState = await getCurrentGameState(user.id, todaysEvent.id);
        
        // If user has progress, set the game state accordingly
        if (currentGameState) {
          const eventDate = new Date(currentGameState.events.event_date);
          
          // Determine the guess stage
          let guessStage: 'year' | 'month' | 'day' | 'result' = 'year';
          
          if (currentGameState.year_guess !== null) {
            guessStage = 'month';
            
            if (currentGameState.month_guess !== null) {
              guessStage = 'day';
              
              if (currentGameState.day_guess !== null) {
                guessStage = 'result';
              }
            }
          }
          
          setGameState({
            currentEvent: {
              id: todaysEvent.id,
              title: currentGameState.events.title,
              description: currentGameState.events.description,
              date: eventDate,
              category: currentGameState.events.category,
              difficulty: currentGameState.events.difficulty as 'easy' | 'medium' | 'hard',
            },
            score: {
              exactGuesses: userScore.exactGuesses,
              closeGuesses: userScore.closeGuesses,
              totalPoints: userScore.totalPoints
            },
            guessStage: guessStage,
            yearGuess: currentGameState.year_guess,
            monthGuess: currentGameState.month_guess,
            dayGuess: currentGameState.day_guess,
            lastPlayedDate: lastPlayedDate
          });
        } else {
          // No progress found, but it's the same day, start a new game
          await startNewGame();
        }
      } else {
        // Different day or never played, start a new game
        await startNewGame();
      }
      
      setLoading(false);
    };
    
    initGame();
  }, [authLoading, user]);
  
  const startNewGame = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const todaysEvent = await getTodaysEvent();
    
    // If user is logged in, check if they've played this event
    let userHasPlayed = false;
    if (user) {
      userHasPlayed = await hasUserPlayedEvent(user.id, todaysEvent.id);
    }
    
    // If user has played this event, get a different one
    if (userHasPlayed) {
      // For now, just use the event anyway
      // In a real app, you'd want to get a different event
    }
    
    // Get total user score from Supabase
    let userScore = {
      exactGuesses: 0,
      closeGuesses: 0,
      totalPoints: 0
    };
    
    if (user) {
      userScore = await getUserTotalScore(user.id);
    }
    
    setGameState({
      ...initialGameState,
      currentEvent: todaysEvent,
      lastPlayedDate: today,
      score: {
        exactGuesses: userScore.exactGuesses,
        closeGuesses: userScore.closeGuesses,
        totalPoints: userScore.totalPoints
      }
    });
    setLoading(false);
  };
  
  const handleYearGuess = (year: number) => {
    if (!gameState.currentEvent) return;
    
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
    
    setGameState({
      ...gameState,
      guessStage: 'month',
      yearGuess: year,
      score: newScore,
    });
  };
  
  const handleMonthGuess = (month: number) => {
    if (!gameState.currentEvent) return;
    
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
    
    setGameState({
      ...gameState,
      guessStage: 'day',
      monthGuess: month,
      score: newScore,
    });
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
  
  return (
    <div className="min-h-screen py-8 px-4 bg-black flex flex-col">
      <div className="container mx-auto max-w-4xl flex-1">
        <GameNav />
        <div className="mb-6">
          <UserStats />
        </div>
        <GameHeader score={gameState.score} />
        
        {hasPlayedToday(gameState.lastPlayedDate) && gameState.guessStage === 'result' && (
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
