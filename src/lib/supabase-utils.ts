
import { supabase } from "@/integrations/supabase/client";
import { HistoricalEvent } from "./game-utils";

// Save event to database to avoid duplication
export async function saveEventToDatabase(event: HistoricalEvent) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.date.toISOString(),
      category: event.category,
      difficulty: event.difficulty,
      created_at: new Date().toISOString(),
      used_on_date: new Date().toISOString().split('T')[0] // Save the date this event was used
    })
    .select()
    .single();

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error('Error saving event:', error);
    return null;
  }

  return data;
}

// Check if an event with the same date and title already exists
export async function checkEventExists(date: Date, title: string) {
  const { data, error } = await supabase
    .from('events')
    .select('id')
    .eq('event_date', date.toISOString().split('T')[0])
    .eq('title', title)
    .single();

  if (error && error.code !== 'PGRST116') { // No rows returned
    console.error('Error checking event:', error);
    return false;
  }

  return !!data;
}

// Get event for today from the database
export async function getTodaysEventFromDB() {
  const todayDate = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('used_on_date', todayDate)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error fetching today\'s event:', error);
    return null;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    date: new Date(data.event_date),
    category: data.category,
    difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
  };
}

// Save user score to database
export async function saveUserScore(
  userId: string,
  eventId: string,
  yearGuess: number,
  yearAccuracy: 'exact' | 'close' | 'wrong',
  monthGuess: number,
  monthAccuracy: 'exact' | 'close' | 'wrong',
  dayGuess: number,
  dayAccuracy: 'exact' | 'close' | 'wrong',
  totalPoints: number,
  exactGuesses: number,
  closeGuesses: number
) {
  const { data, error } = await supabase
    .from('user_scores')
    .insert({
      user_id: userId,
      event_id: eventId,
      year_guess: yearGuess,
      year_accuracy: yearAccuracy,
      month_guess: monthGuess,
      month_accuracy: monthAccuracy,
      day_guess: dayGuess,
      day_accuracy: dayAccuracy,
      total_points: totalPoints,
      exact_guesses: exactGuesses,
      close_guesses: closeGuesses
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving user score:', error);
    return null;
  }

  return data;
}

// Get user's total score
export async function getUserTotalScore(userId: string) {
  const { data, error } = await supabase
    .from('user_scores')
    .select('total_points, exact_guesses, close_guesses, event_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user scores:', error);
    return {
      totalPoints: 0,
      exactGuesses: 0,
      closeGuesses: 0,
      gamesPlayed: 0
    };
  }

  // Calculate total games played - count distinct events
  const uniqueEvents = new Set();
  data.forEach(score => {
    if (score.total_points > 0) {
      uniqueEvents.add(score.event_id);
    }
  });

  const gamesPlayed = uniqueEvents.size || 0;

  // Sum up the scores
  return data.reduce((acc, score) => {
    return {
      totalPoints: acc.totalPoints + Number(score.total_points || 0),
      exactGuesses: acc.exactGuesses + (score.exact_guesses || 0),
      closeGuesses: acc.closeGuesses + (score.close_guesses || 0),
      gamesPlayed
    };
  }, {
    totalPoints: 0,
    exactGuesses: 0,
    closeGuesses: 0,
    gamesPlayed: 0
  });
}

// Check if user has played a specific event
export async function hasUserPlayedEvent(userId: string, eventId: string) {
  const { data, error } = await supabase
    .from('user_scores')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  if (error && error.code !== 'PGRST116') { // No rows returned
    console.error('Error checking user played event:', error);
    return false;
  }

  return !!data;
}

// Get last played date for user
export async function getLastPlayedDate(userId: string) {
  const { data, error } = await supabase
    .from('user_scores')
    .select('played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error getting last played date:', error);
    return null;
  }

  return data?.played_at ? data.played_at.split('T')[0] : null;
}

// Define a GameStateType to avoid circular references
export type GameStateType = {
  year_guess: number | null;
  month_guess: number | null;
  day_guess: number | null;
  year_accuracy: string | null;
  month_accuracy: string | null;
  day_accuracy: string | null;
  played_at: string | null;
  total_points: number;
  exact_guesses: number;
  close_guesses: number;
};

// Get current game state for user
export async function getCurrentGameState(userId: string, eventId: string): Promise<GameStateType | null> {
  const { data, error } = await supabase
    .from('user_scores')
    .select(`
      year_guess, 
      month_guess, 
      day_guess, 
      year_accuracy, 
      month_accuracy, 
      day_accuracy,
      played_at,
      total_points,
      exact_guesses,
      close_guesses
    `)
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error getting current game state:', error);
    return null;
  }

  return data;
}

// Save game state to database
export async function saveGameState(
  userId: string, 
  eventId: string, 
  gameState: {
    guessStage: string;
    yearGuess: number | null;
    monthGuess: number | null;
    dayGuess: number | null;
    yearAccuracy?: string;
    monthAccuracy?: string;
    dayAccuracy?: string;
    totalPoints?: number;
    exactGuesses?: number;
    closeGuesses?: number;
  }
) {
  // Check if a record already exists
  const existing = await getCurrentGameState(userId, eventId);

  const updateData = {
    user_id: userId,
    event_id: eventId,
    year_guess: gameState.yearGuess,
    month_guess: gameState.monthGuess,
    day_guess: gameState.dayGuess,
    year_accuracy: gameState.yearAccuracy,
    month_accuracy: gameState.monthAccuracy,
    day_accuracy: gameState.dayAccuracy,
    played_at: new Date().toISOString(),
    total_points: gameState.totalPoints || 0,
    exact_guesses: gameState.exactGuesses || 0,
    close_guesses: gameState.closeGuesses || 0
  };

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('user_scores')
      .update(updateData)
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating game state:', error);
      return null;
    }
    
    return data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('user_scores')
      .insert(updateData)
      .select()
      .single();
      
    if (error) {
      console.error('Error saving game state:', error);
      return null;
    }
    
    return data;
  }
}
