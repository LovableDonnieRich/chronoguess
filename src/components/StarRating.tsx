
import { StarHalf, Star } from "lucide-react";

interface StarRatingProps {
  exactGuesses: number;
  closeGuesses: number;
}

export const StarRating = ({ exactGuesses, closeGuesses }: StarRatingProps) => {
  const totalStars = exactGuesses + closeGuesses / 2;
  
  const renderStars = () => {
    const stars = [];
    const maxStars = 3; // Changed from 5 to 3
    
    // Add full stars
    for (let i = 0; i < Math.min(Math.floor(totalStars), maxStars); i++) {
      stars.push(
        <Star 
          key={`full-${i}`} 
          className="text-vintage-accent" 
          fill="currentColor" 
          size={28} 
        />
      );
    }
    
    // Add half star if needed
    if (totalStars % 1 !== 0 && stars.length < maxStars) {
      stars.push(
        <StarHalf 
          key="half" 
          className="text-vintage-accent" 
          fill="currentColor" 
          size={28} 
        />
      );
    }
    
    // Add empty stars to reach maxStars total
    const emptyStars = maxStars - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className="text-muted-foreground" 
          size={28} 
        />
      );
    }
    
    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      {renderStars()}
    </div>
  );
};
