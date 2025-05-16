
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
      case 'exact': return <Check className="w-5 h-5 text-green-600" />;
      case 'close': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'wrong': return <X className="w-5 h-5 text-red-600" />;
    }
  };

  const getResultClass = (result: 'exact' | 'close' | 'wrong') => {
    switch (result) {
      case 'exact': return 'bg-green-100 text-green-800 border-green-200';
      case 'close': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'wrong': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
        <CardTitle className="text-2xl">{event.title}</CardTitle>
        <CardDescription className="text-indigo-100 text-lg">
          Risultato
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative aspect-video mb-6 rounded-lg overflow-hidden shadow-md">
          {event.imageUrl && (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="object-cover w-full h-full transform transition-transform hover:scale-105 duration-500" 
            />
          )}
        </div>
        
        <p className="mb-6 text-gray-700">{event.description}</p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-indigo-100 pb-4">
            <span className="text-lg font-medium text-gray-800">Data corretta:</span>
            <span className="font-semibold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md">
              {formatDate(event.date)}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">La tua risposta:</span>
            <span className="font-medium text-gray-800">
              {dayGuess}/{monthGuess}/{yearGuess}
            </span>
          </div>
          
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className={`flex justify-between items-center p-2 rounded-md border ${getResultClass(yearResult)}`}>
              <span>Anno:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{yearGuess}</span>
                {getResultIcon(yearResult)}
              </div>
            </div>
            
            <div className={`flex justify-between items-center p-2 rounded-md border ${getResultClass(monthResult)}`}>
              <span>Mese:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{monthGuess}</span>
                {getResultIcon(monthResult)}
              </div>
            </div>
            
            <div className={`flex justify-between items-center p-2 rounded-md border ${getResultClass(dayResult)}`}>
              <span>Giorno:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{dayGuess}</span>
                {getResultIcon(dayResult)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t border-indigo-100 pt-4 mt-4">
            <span className="text-lg font-semibold text-gray-800">Punteggio:</span>
            <div className="flex items-center gap-2">
              <StarRating exactGuesses={exactGuesses} closeGuesses={closeGuesses} />
              <span className="text-lg font-semibold text-indigo-900">({points} pt)</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-6 flex justify-end">
        <Button 
          onClick={onNextEvent}
          className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-transform hover:scale-105"
        >
          Torna domani
        </Button>
      </CardFooter>
    </Card>
  );
};
