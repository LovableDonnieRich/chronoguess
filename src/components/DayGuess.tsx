
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HistoricalEvent, getMonthName } from "@/lib/game-utils";

interface DayGuessProps {
  event: HistoricalEvent;
  yearGuess: number;
  monthGuess: number;
  onGuess: (day: number) => void;
}

export const DayGuess = ({ event, yearGuess, monthGuess, onGuess }: DayGuessProps) => {
  const [selectedDay, setSelectedDay] = useState<string | undefined>();

  const daysInMonth = useMemo(() => {
    // Get the number of days in the given month and year
    return new Date(yearGuess, monthGuess, 0).getDate();
  }, [yearGuess, monthGuess]);

  const handleSubmit = () => {
    if (selectedDay) {
      onGuess(parseInt(selectedDay, 10));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto historical-card bg-vintage-paper">
      <CardHeader>
        <CardTitle className="text-2xl text-vintage-ink">{event.title}</CardTitle>
        <CardDescription className="text-vintage-text text-lg">
          On which day of {getMonthName(monthGuess)} {yearGuess} did this event happen?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-vintage-text">{event.description}</p>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="dayGuess" className="block text-sm font-medium text-vintage-text mb-1">
              Day
            </label>
            <Select onValueChange={setSelectedDay}>
              <SelectTrigger className="bg-vintage-background border-vintage-accent/30 focus-visible:ring-vintage-accent">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedDay}
          className="bg-vintage-accent hover:bg-vintage-accent/80 text-white"
        >
          Confirm
        </Button>
      </CardFooter>
    </Card>
  );
};
