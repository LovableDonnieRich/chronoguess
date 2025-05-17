
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { HistoricalEvent, formatDate, evaluateGuess } from "@/lib/game-utils";
import { Check, X, AlertCircle } from "lucide-react";

interface GameResultProps {
  event: HistoricalEvent;
  yearGuess: number;
  monthGuess: number;
  dayGuess: number;
  onNextEvent: () => void;
}

export const GameResult = ({ event, yearGuess, monthGuess, dayGuess, onNextEvent }: GameResultProps) => {
  const actualYear = event.date.getFullYear();
  const actualMonth = event.date.getMonth() + 1; // JavaScript months are 0-indexed
  const actualDay = event.date.getDate();

  const yearResult = evaluateGuess(yearGuess, actualYear, 'year');
  const monthResult = evaluateGuess(monthGuess, actualMonth, 'month');
  const dayResult = evaluateGuess(dayGuess, actualDay, 'day');

  const exactGuesses = [yearResult, monthResult, dayResult].filter(result => result === 'exact').length;
  const closeGuesses = [yearResult, monthResult, dayResult].filter(result => result === 'close').length;
  
  // Calculate points: 1 for exact, 0.5 for close
  const points = exactGuesses + (closeGuesses * 0.5);

  const getResultIcon = (result: 'exact' | 'close' | 'wrong') => {
    switch (result) {
      case 'exact': return <Check className="w-5 h-5" />;
      case 'close': return <AlertCircle className="w-5 h-5" />;
      case 'wrong': return <X className="w-5 h-5" />;
    }
  };

  const getResultClass = (result: 'exact' | 'close' | 'wrong') => {
    switch (result) {
      case 'exact': return 'bg-white border-4 border-black';
      case 'close': return 'bg-white border-2 border-black';
      case 'wrong': return 'bg-white border border-black';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-4 border-black bg-white">
      <CardHeader className="bg-black text-white p-6">
        <CardTitle className="text-2xl font-mono uppercase">{event.title}</CardTitle>
        <CardDescription className="text-white/80 font-mono uppercase text-lg">
          Result
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <p className="mb-6 font-mono text-black/80">{event.description}</p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-4">
            <span className="text-lg font-mono font-bold uppercase">Correct date:</span>
            <span className="font-mono font-bold bg-black text-white px-3 py-1">
              {formatDate(event.date)}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono uppercase">Your guess:</span>
            <span className="font-mono font-bold">
              {dayGuess}/{monthGuess}/{yearGuess}
            </span>
          </div>
          
          <div className="space-y-4 p-4 border-2 border-black">
            <div className={`flex justify-between items-center p-2 ${getResultClass(yearResult)}`}>
              <span className="font-mono uppercase">Year:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{yearGuess}</span>
                {getResultIcon(yearResult)}
              </div>
            </div>
            
            <div className={`flex justify-between items-center p-2 ${getResultClass(monthResult)}`}>
              <span className="font-mono uppercase">Month:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{monthGuess}</span>
                {getResultIcon(monthResult)}
              </div>
            </div>
            
            <div className={`flex justify-between items-center p-2 ${getResultClass(dayResult)}`}>
              <span className="font-mono uppercase">Day:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{dayGuess}</span>
                {getResultIcon(dayResult)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t-2 border-black pt-4 mt-4">
            <span className="text-lg font-mono font-bold uppercase">Score:</span>
            <div className="flex items-center gap-2">
              <StarRating exactGuesses={exactGuesses} closeGuesses={closeGuesses} />
              <span className="text-lg font-mono font-bold">({points} pts)</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-black p-6 flex justify-end">
        <Button 
          onClick={onNextEvent}
          className="bg-white text-black border-2 border-white hover:bg-black hover:text-white font-mono uppercase"
        >
          Come back tomorrow
        </Button>
      </CardFooter>
    </Card>
  );
};
