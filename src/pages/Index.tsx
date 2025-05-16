
import { useState, useEffect } from "react";
import { YearGuess } from "@/components/YearGuess";
import { MonthGuess } from "@/components/MonthGuess";
import { DayGuess } from "@/components/DayGuess";
import { GameResult } from "@/components/GameResult";
import { GameHeader } from "@/components/GameHeader";
import { 
  getTodaysEvent,
  evaluateGuess, 
  GameState, 
  initialGameState,
  saveGameState,
  loadGameState,
  hasPlayedToday
} from "@/lib/game-utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const { toast } = useToast();
  
  // Initialize game on first load
  useEffect(() => {
    const savedState = loadGameState();
    
    if (savedState && hasPlayedToday(savedState.lastPlayedDate)) {
      setGameState(savedState);
    } else {
      startNewGame();
    }
  }, []);
  
  // Save game state whenever it changes
  useEffect(() => {
    if (gameState.currentEvent) {
      saveGameState(gameState);
    }
  }, [gameState]);
  
  const startNewGame = () => {
    const today = new Date().toISOString().split('T')[0];
    setGameState({
      ...initialGameState,
      currentEvent: getTodaysEvent(),
      lastPlayedDate: today,
    });
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
        title: "Anno esatto!",
        description: `Hai indovinato esattamente l'anno: ${actualYear}`,
        variant: "default",
      });
    } else if (yearResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
      toast({
        title: "Anno vicino!",
        description: `Eri vicino! L'anno esatto era ${actualYear}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Anno sbagliato",
        description: `L'anno esatto era ${actualYear}`,
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
        title: "Mese esatto!",
        description: `Hai indovinato esattamente il mese: ${actualMonth}`,
        variant: "default",
      });
    } else if (monthResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
      toast({
        title: "Mese vicino!",
        description: `Eri vicino! Il mese esatto era ${actualMonth}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Mese sbagliato",
        description: `Il mese esatto era ${actualMonth}`,
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
  
  const handleDayGuess = (day: number) => {
    if (!gameState.currentEvent) return;
    
    const actualDay = gameState.currentEvent.date.getDate();
    const dayResult = evaluateGuess(day, actualDay, 'day');
    
    let newScore = { ...gameState.score };
    
    if (dayResult === 'exact') {
      newScore.exactGuesses += 1;
      newScore.totalPoints += 1;
      toast({
        title: "Giorno esatto!",
        description: `Hai indovinato esattamente il giorno: ${actualDay}`,
        variant: "default",
      });
    } else if (dayResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
      toast({
        title: "Giorno vicino!",
        description: `Eri vicino! Il giorno esatto era ${actualDay}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Giorno sbagliato",
        description: `Il giorno esatto era ${actualDay}`,
        variant: "destructive",
      });
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
      title: "Torna domani!",
      description: "Un nuovo evento storico sarà disponibile domani.",
      variant: "default",
    });
  };
  
  if (!gameState.currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
        <Button 
          onClick={startNewGame}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg p-6 rounded-xl shadow-lg transition-transform hover:scale-105"
        >
          Inizia il gioco
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-4xl">
        <GameHeader score={gameState.score} />
        
        {hasPlayedToday(gameState.lastPlayedDate) && gameState.guessStage === 'result' && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertTitle className="text-blue-800">Evento giornaliero completato!</AlertTitle>
            <AlertDescription className="text-blue-600">
              Hai già giocato l'evento di oggi. Torna domani per un nuovo evento storico!
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
    </div>
  );
};

export default Index;
