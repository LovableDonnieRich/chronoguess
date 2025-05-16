
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HistoricalEvent, getMonthName } from "@/lib/game-utils";

interface MonthGuessProps {
  event: HistoricalEvent;
  yearGuess: number;
  onGuess: (month: number) => void;
}

export const MonthGuess = ({ event, yearGuess, onGuess }: MonthGuessProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();

  const handleSubmit = () => {
    if (selectedMonth) {
      onGuess(parseInt(selectedMonth, 10));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto historical-card bg-vintage-paper">
      <CardHeader>
        <CardTitle className="text-2xl text-vintage-ink">{event.title}</CardTitle>
        <CardDescription className="text-vintage-text text-lg">
          In che mese dell'anno {yearGuess} è accaduto questo evento?
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
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="monthGuess" className="block text-sm font-medium text-vintage-text mb-1">
              Mese
            </label>
            <Select onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-vintage-background border-vintage-accent/30 focus-visible:ring-vintage-accent">
                <SelectValue placeholder="Seleziona un mese" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {getMonthName(month)}
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
          disabled={!selectedMonth}
          className="bg-vintage-accent hover:bg-vintage-accent/80 text-white"
        >
          Conferma
        </Button>
      </CardFooter>
    </Card>
  );
};
