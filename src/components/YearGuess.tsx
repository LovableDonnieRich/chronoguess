
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricalEvent } from "@/lib/game-utils";

interface YearGuessProps {
  event: HistoricalEvent;
  onGuess: (year: number) => void;
}

export const YearGuess = ({ event, onGuess }: YearGuessProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const yearGuess = parseInt(inputValue, 10);
    
    if (isNaN(yearGuess)) {
      setError("Please enter a valid year");
      return;
    }
    
    if (yearGuess < 0 || yearGuess > new Date().getFullYear()) {
      setError(`Please enter a year between 0 and ${new Date().getFullYear()}`);
      return;
    }
    
    onGuess(yearGuess);
  };

  return (
    <Card className="w-full max-w-md mx-auto historical-card bg-vintage-paper">
      <CardHeader>
        <CardTitle className="text-2xl text-vintage-ink">{event.title}</CardTitle>
        <CardDescription className="text-vintage-text text-lg">
          In which year did this event happen?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-vintage-text">{event.description}</p>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="yearGuess" className="block text-sm font-medium text-vintage-text mb-1">
                Year
              </label>
              <Input
                id="yearGuess"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type="number"
                placeholder="Enter year"
                className="bg-vintage-background border-vintage-accent/30 focus-visible:ring-vintage-accent"
              />
              {error && <p className="text-destructive text-sm mt-1">{error}</p>}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          className="bg-vintage-accent hover:bg-vintage-accent/80 text-white"
        >
          Confirm
        </Button>
      </CardFooter>
    </Card>
  );
};
