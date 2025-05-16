
import { StarRating } from "./StarRating";
import { Score } from "@/lib/game-utils";
import { Calendar } from "lucide-react";

interface GameHeaderProps {
  score: Score;
}

export const GameHeader = ({ score }: GameHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-6 mb-8 bg-white rounded-xl shadow-lg border border-indigo-100">
      <div className="mb-4 md:mb-0 flex items-center">
        <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            CronoIndovina
          </h1>
          <p className="text-gray-600">Indovina quando sono accaduti i fatti storici</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center md:items-end">
        <div className="flex items-center gap-3 mb-1 bg-indigo-50 px-4 py-2 rounded-full">
          <span className="text-indigo-800 font-medium">Il tuo punteggio:</span>
          <span className="font-bold text-indigo-900 text-xl">{score.totalPoints}</span>
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
