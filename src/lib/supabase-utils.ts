
import { supabase } from "@/integrations/supabase/client";
import { HistoricalEvent } from "./game-utils";

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

// Save event to database to avoid duplication
export async function saveEventToDatabase(event: HistoricalEvent) {
  try {
    // First, let's format the date consistently as YYYY-MM-DD
    const formattedDate = event.date.toISOString().split('T')[0];
    console.log('Saving event to database with formatted date:', formattedDate);
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: formattedDate,
        category: event.category,
        difficulty: event.difficulty,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Duplicate key error
        console.log('Event already exists in database, ignoring duplicate key error');
        return null;
      }
      console.error('Error saving event:', error);
      return null;
    }

    console.log('Event saved successfully:', data);
    return data;
  } catch (err) {
    console.error('Exception when saving event:', err);
    return null;
  }
}

// Check if an event with the same date and title already exists
export async function checkEventExists(date: Date, title: string) {
  try {
    // Format date consistently as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    console.log('Checking if event exists with date:', formattedDate, 'and title:', title);
    
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('event_date', formattedDate)
      .eq('title', title)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        console.log('No existing event found');
        return false;
      }
      console.error('Error checking event:', error);
      return false;
    }

    console.log('Existing event found:', data);
    return !!data;
  } catch (err) {
    console.error('Exception when checking event:', err);
    return false;
  }
}

// Get event for today from the database
export async function getTodaysEventFromDB(): Promise<HistoricalEvent | null> {
  try {
    const todayDate = new Date().toISOString().split('T')[0];
    console.log('Checking for today\'s event in database with date:', todayDate);
    
    // Try to find an event that has been set for today's date
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_date', todayDate)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching today\'s event:', error);
      return null;
    }
    
    if (!data) {
      console.log('No event found for today in database');
      return null;
    }
    
    console.log('Found today\'s event in database:', data);
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: new Date(data.event_date),
      category: data.category,
      difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
    };
  } catch (err) {
    console.error('Exception when fetching today\'s event:', err);
    return null;
  }
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
  try {
    console.log('Saving user score to database:', {
      userId, eventId, yearGuess, yearAccuracy, monthGuess, monthAccuracy,
      dayGuess, dayAccuracy, totalPoints, exactGuesses, closeGuesses
    });
    
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
        close_guesses: closeGuesses,
        played_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user score:', error);
      return null;
    }

    console.log('User score saved successfully:', data);
    return data;
  } catch (err) {
    console.error('Exception when saving user score:', err);
    return null;
  }
}

// Get user's total score
export async function getUserTotalScore(userId: string) {
  try {
    console.log('Fetching total score for user:', userId);
    
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

    console.log('User scores data:', data);

    // Calculate total games played - count distinct events
    const uniqueEvents = new Set();
    data.forEach(score => {
      if (score.total_points > 0) {
        uniqueEvents.add(score.event_id);
      }
    });

    const gamesPlayed = uniqueEvents.size || 0;

    // Sum up the scores
    const totals = data.reduce((acc, score) => {
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
    
    console.log('Calculated total score:', totals);
    return totals;
  } catch (err) {
    console.error('Exception when fetching user total score:', err);
    return {
      totalPoints: 0,
      exactGuesses: 0,
      closeGuesses: 0,
      gamesPlayed: 0
    };
  }
}

// Check if user has played a specific event
export async function hasUserPlayedEvent(userId: string, eventId: string): Promise<boolean> {
  try {
    console.log('Checking if user has played event:', userId, eventId);
    
    const { data, error } = await supabase
      .from('user_scores')
      .select('id, day_guess')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) {
      console.error('Error checking if user played event:', error);
      return false;
    }

    // Consider the event fully played only if day_guess is not null
    // This handles the case where they might have started the game but not completed it
    const hasPlayed = !!data && data.day_guess !== null;
    console.log('User has played event:', hasPlayed);
    return hasPlayed;
  } catch (err) {
    console.error('Exception when checking if user played event:', err);
    return false;
  }
}

// Get last played date for user
export async function getLastPlayedDate(userId: string) {
  try {
    console.log('Getting last played date for user:', userId);
    
    const { data, error } = await supabase
      .from('user_scores')
      .select('played_at')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error getting last played date:', error);
      return null;
    }

    const lastPlayed = data?.played_at ? data.played_at.split('T')[0] : null;
    console.log('Last played date:', lastPlayed);
    return lastPlayed;
  } catch (err) {
    console.error('Exception when getting last played date:', err);
    return null;
  }
}

// Get current game state for user
export async function getCurrentGameState(userId: string, eventId: string): Promise<GameStateType | null> {
  try {
    console.log('Getting current game state for user:', userId, 'and event:', eventId);
    
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
      .maybeSingle();

    if (error) {
      console.error('Error getting current game state:', error);
      return null;
    }

    console.log('Current game state data:', data);
    return data as GameStateType | null;
  } catch (err) {
    console.error('Exception when getting current game state:', err);
    return null;
  }
}

// Save game state to database
export async function saveGameState(
  userId: string, 
  eventId: string, 
  gameState: {
    guessStage: 'year' | 'month' | 'day' | 'result';
    yearGuess: number | null;
    monthGuess: number | null;
    dayGuess: number | null;
    yearAccuracy?: 'exact' | 'close' | 'wrong';
    monthAccuracy?: 'exact' | 'close' | 'wrong';
    dayAccuracy?: 'exact' | 'close' | 'wrong';
    totalPoints?: number;
    exactGuesses?: number;
    closeGuesses?: number;
  }
) {
  try {
    console.log('Saving game state:', gameState);
    
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
      console.log('Updating existing game state record');
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
      
      console.log('Game state updated successfully:', data);
      return data;
    } else {
      // Insert new record
      console.log('Inserting new game state record');
      const { data, error } = await supabase
        .from('user_scores')
        .insert(updateData)
        .select()
        .single();
        
      if (error) {
        console.error('Error saving game state:', error);
        return null;
      }
      
      console.log('Game state saved successfully:', data);
      return data;
    }
  } catch (err) {
    console.error('Exception when saving game state:', err);
    return null;
  }
}
