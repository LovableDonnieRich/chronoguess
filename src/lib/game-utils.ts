// Game scoring utilities
export interface Score {
  exactGuesses: number;
  closeGuesses: number;
  totalPoints: number;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

export interface GameState {
  currentEvent: HistoricalEvent | null;
  score: Score;
  guessStage: 'year' | 'month' | 'day' | 'result';
  yearGuess: number | null;
  monthGuess: number | null;
  dayGuess: number | null;
  lastPlayedDate: string | null;
}

export const initialGameState: GameState = {
  currentEvent: null,
  score: {
    exactGuesses: 0,
    closeGuesses: 0,
    totalPoints: 0,
  },
  guessStage: 'year',
  yearGuess: null,
  monthGuess: null,
  dayGuess: null,
  lastPlayedDate: null,
};

// Sample historical events data
import { historicalEvents, getRandomEvent as getRandomEventFromData } from '@/data/historical-events';

// Get today's event based on the date
export function getTodaysEvent(): HistoricalEvent {
  // Use the date as a seed to select a consistent event for each day
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // Use a simple hash of the date string to get a consistent index
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the absolute value of hash to ensure positive index
  const positiveHash = Math.abs(hash);
  const index = positiveHash % historicalEvents.length;
  
  return historicalEvents[index];
}

// Check if the user has already played today
export function hasPlayedToday(lastPlayedDate: string | null): boolean {
  if (!lastPlayedDate) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return lastPlayedDate === today;
}

// Get a random historical event (keeping this for compatibility)
export function getRandomEvent(): HistoricalEvent {
  return getRandomEventFromData();
}

// Evaluate the guess accuracy
export function evaluateGuess(
  guess: number,
  actual: number,
  type: 'year' | 'month' | 'day'
): 'exact' | 'close' | 'wrong' {
  const tolerance = {
    year: 2, // Within 2 years
    month: 1, // Within 1 month
    day: 5, // Within 5 days
  };

  if (guess === actual) {
    return 'exact';
  } else if (Math.abs(guess - actual) <= tolerance[type]) {
    return 'close';
  } else {
    return 'wrong';
  }
}

// Format the date in Italian
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Get month name in Italian
export function getMonthName(month: number): string {
  const date = new Date();
  date.setMonth(month - 1);
  return new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(date);
}

// Save game state to localStorage
export function saveGameState(state: GameState): void {
  localStorage.setItem('cronoindovina-game-state', JSON.stringify(state));
}

// Load game state from localStorage
export function loadGameState(): GameState | null {
  const savedState = localStorage.getItem('cronoindovina-game-state');
  if (savedState) {
    const state = JSON.parse(savedState);
    // Convert date string back to Date object
    if (state.currentEvent?.date) {
      state.currentEvent.date = new Date(state.currentEvent.date);
    }
    return state;
  }
  return null;
}

// Clear game state from localStorage
export function clearGameState(): void {
  localStorage.removeItem('cronoindovina-game-state');
}
