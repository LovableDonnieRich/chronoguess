
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { HistoricalEvent, formatDate, evaluateGuess } from "@/lib/game-utils";

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

  const getResultClass = (result: 'exact' | 'close' | 'wrong') => {
    switch (result) {
      case 'exact': return 'text-green-600';
      case 'close': return 'text-amber-600';
      case 'wrong': return 'text-red-600';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto historical-card bg-vintage-paper">
      <CardHeader>
        <CardTitle className="text-2xl text-vintage-ink">{event.title}</CardTitle>
        <CardDescription className="text-vintage-text text-lg">
          Risultato
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
          {event.imageUrl && (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="object-cover w-full h-full" 
            />
          )}
        </div>
        
        <p className="mb-6 text-vintage-text">{event.description}</p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-vintage-accent/20 pb-2">
            <span className="text-lg">Data corretta:</span>
            <span className="font-semibold">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>La tua risposta:</span>
            <span className="font-semibold">
              {dayGuess}/{monthGuess}/{yearGuess}
            </span>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <span>Anno:</span>
              <span className={`font-semibold ${getResultClass(yearResult)}`}>
                {yearGuess} {yearResult === 'exact' ? '✓' : yearResult === 'close' ? '≈' : '✗'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Mese:</span>
              <span className={`font-semibold ${getResultClass(monthResult)}`}>
                {monthGuess} {monthResult === 'exact' ? '✓' : monthResult === 'close' ? '≈' : '✗'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Giorno:</span>
              <span className={`font-semibold ${getResultClass(dayResult)}`}>
                {dayGuess} {dayResult === 'exact' ? '✓' : dayResult === 'close' ? '≈' : '✗'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t border-vintage-accent/20 pt-4 mt-4">
            <span className="text-lg font-semibold">Punteggio:</span>
            <div className="flex items-center gap-2">
              <StarRating exactGuesses={exactGuesses} closeGuesses={closeGuesses} />
              <span className="text-lg font-semibold">({points} pt)</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={onNextEvent}
          className="bg-vintage-accent hover:bg-vintage-accent/80 text-white"
        >
          Prossimo evento
        </Button>
      </CardFooter>
    </Card>
  );
};
