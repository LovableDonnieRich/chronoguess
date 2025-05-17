
import { StarRating } from "./StarRating";
import { Score } from "@/lib/game-utils";
import { Calendar } from "lucide-react";

interface GameHeaderProps {
  score: Score;
}

export const GameHeader = ({ score }: GameHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-6 mb-8 bg-white border-4 border-black">
      <div className="mb-4 md:mb-0 flex items-center">
        <Calendar className="h-8 w-8 mr-3" />
        <div>
          <h1 className="text-3xl font-mono font-bold uppercase tracking-tight">
            ChronoGuess
          </h1>
          <p className="text-sm text-black/70 uppercase tracking-tight">Guess when historical events happened</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center md:items-end">
        <div className="flex items-center gap-3 mb-1 bg-black text-white px-4 py-2">
          <span className="font-mono uppercase text-sm">Your score:</span>
          <span className="font-mono font-bold text-xl">{score.totalPoints}</span>
        </div>
        <div className="flex items-center">
          <StarRating 
            exactGuesses={score.exactGuesses} 
            closeGuesses={score.closeGuesses} 
          />
        </div>
      </div>
    </header>
  );
}
