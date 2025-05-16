
import { useState, useEffect } from "react";
import { YearGuess } from "@/components/YearGuess";
import { MonthGuess } from "@/components/MonthGuess";
import { DayGuess } from "@/components/DayGuess";
import { GameResult } from "@/components/GameResult";
import { GameHeader } from "@/components/GameHeader";
import { 
  getRandomEvent, 
  evaluateGuess, 
  GameState, 
  initialGameState,
  saveGameState,
  loadGameState
} from "@/lib/game-utils";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  
  // Initialize game on first load
  useEffect(() => {
    const savedState = loadGameState();
    
    if (savedState) {
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
    setGameState({
      ...initialGameState,
      currentEvent: getRandomEvent(),
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
    } else if (yearResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
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
    } else if (monthResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
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
    } else if (dayResult === 'close') {
      newScore.closeGuesses += 1;
      newScore.totalPoints += 0.5;
    }
    
    setGameState({
      ...gameState,
      guessStage: 'result',
      dayGuess: day,
      score: newScore,
    });
  };
  
  const handleNextEvent = () => {
    setGameState({
      ...gameState,
      currentEvent: getRandomEvent(),
      guessStage: 'year',
      yearGuess: null,
      monthGuess: null,
      dayGuess: null,
    });
  };
  
  if (!gameState.currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vintage-background">
        <Button 
          onClick={startNewGame}
          className="bg-vintage-accent hover:bg-vintage-accent/80 text-white text-lg p-6"
        >
          Inizia il gioco
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 px-4 bg-vintage-background">
      <div className="container mx-auto max-w-4xl">
        <GameHeader score={gameState.score} />
        
        <div className="animate-fade-in">
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
