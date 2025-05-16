
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
      difficulty: event.difficulty
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
    .select('total_points, exact_guesses, close_guesses')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user scores:', error);
    return {
      totalPoints: 0,
      exactGuesses: 0,
      closeGuesses: 0
    };
  }

  return data.reduce((acc, score) => {
    return {
      totalPoints: acc.totalPoints + Number(score.total_points),
      exactGuesses: acc.exactGuesses + score.exact_guesses,
      closeGuesses: acc.closeGuesses + score.close_guesses
    };
  }, {
    totalPoints: 0,
    exactGuesses: 0,
    closeGuesses: 0
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
