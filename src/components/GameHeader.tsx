
import { StarRating } from "./StarRating";
import { Score } from "@/lib/game-utils";

interface GameHeaderProps {
  score: Score;
}

export const GameHeader = ({ score }: GameHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-4 mb-8 bg-vintage-paper rounded-lg shadow-md">
      <div className="mb-4 md:mb-0">
        <h1 className="text-3xl font-bold text-vintage-ink">CronoIndovina</h1>
        <p className="text-vintage-text">Indovina quando sono accaduti i fatti storici</p>
      </div>
      
      <div className="flex flex-col items-center md:items-end">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-vintage-text font-medium">Il tuo punteggio:</span>
          <span className="font-bold text-vintage-ink">{score.totalPoints} pt</span>
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
};
