
import { saveEventToDatabase, checkEventExists, getTodaysEventFromDB } from './supabase-utils';

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

// Get a random number between min and max (inclusive)
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get the last day of a specific month
function getLastDayOfMonth(year: number, month: number): number {
  // JavaScript months are 0-indexed, so we use month and not month-1
  return new Date(year, month, 0).getDate();
}

// Fetch a historical event from the API
async function fetchHistoricalEvent(): Promise<HistoricalEvent | null> {
  try {
    // Generate random month and day
    const month = getRandomNumber(1, 12);
    const maxDay = getLastDayOfMonth(new Date().getFullYear(), month);
    const day = getRandomNumber(1, maxDay);
    
    // Construct the API URL
    const url = `https://events.historylabs.io/date?month=${month}&day=${day}&minYear=1100`;
    console.log(`Fetching historical event from API: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch events:', response.statusText);
      return null;
    }
    
    const events = await response.json();
    
    // If no events are returned
    if (!events || events.length === 0) {
      console.error('No events found for the given date');
      return null;
    }
    
    // Get a random event from the results
    const randomIndex = Math.floor(Math.random() * events.length);
    const event = events[randomIndex];
    
    // Transform the event to match our expected format
    const historicalEvent: HistoricalEvent = {
      id: event.id?.toString() || Math.random().toString(36).substr(2, 9),
      title: event.title || 'Historical Event',
      description: event.description || 'A significant historical event.',
      date: new Date(event.date),
      category: event.category || 'History',
      difficulty: determineDifficulty(new Date(event.date)),
    };
    
    return historicalEvent;
  } catch (error) {
    console.error('Error fetching historical event:', error);
    return null;
  }
}

// Determine difficulty based on the date
function determineDifficulty(date: Date): 'easy' | 'medium' | 'hard' {
  const year = date.getFullYear();
  if (year > 1900) return 'easy';
  if (year > 1700) return 'medium';
  return 'hard';
}

// Get today's event based on the date
export async function getTodaysEvent(): Promise<HistoricalEvent> {
  // First, try to fetch from database
  console.log('Checking for today\'s event in the database...');
  const dbEvent = await getTodaysEventFromDB();
  
  if (dbEvent) {
    console.log('Found today\'s event in database:', dbEvent.title);
    return dbEvent;
  }
  
  console.log('No event found for today, fetching from API...');
  // If not in database, try to fetch an event from the API
  const event = await fetchHistoricalEvent();
  
  // Fallback event in case the API fails
  if (!event) {
    const fallbackEvent = {
      id: '1',
      title: 'Discovery of America',
      description: 'Christopher Columbus reaches the Americas, marking the beginning of European exploration in the New World.',
      date: new Date('1492-10-12'),
      category: 'Exploration',
      difficulty: 'easy' as const,
    };
    
    // Save the fallback event to the database
    console.log('API fetch failed, using fallback event:', fallbackEvent.title);
    await saveEventToDatabase(fallbackEvent);
    
    return fallbackEvent;
  }
  
  // Save the event to the database
  console.log('Saving new event to database:', event.title);
  await saveEventToDatabase(event);
  
  return event;
}

// Check if the user has already played today
export function hasPlayedToday(lastPlayedDate: string | null): boolean {
  if (!lastPlayedDate) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return lastPlayedDate === today;
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

// Format the date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Get month name
export function getMonthName(month: number): string {
  const date = new Date();
  date.setMonth(month - 1);
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
}
