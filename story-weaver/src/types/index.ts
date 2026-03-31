export type Genre = 'Fantasy' | 'Sci-Fi' | 'Mystery' | 'Romance' | 'Horror' | 'Comedy';

export interface StoryState {
  title: string;
  genre: Genre;
  hook: string;
  fullStory: string;
  isStarted: boolean;
  temperature: number;
  isLoading: boolean;
  error: string | null;
  undoHistory: string[];
  characters: Character[];
  visualizationPrompt: string | null;
}

export interface APIError {
  code: string;
  message: string;
}

export interface Choice {
  id: number;
  text: string;
}

export interface Character {
  name: string;
  description: string;
  firstMentioned: number; // paragraph index
}

export interface RetryState {
  isRetrying: boolean;
  countdown: number;
  nextRetryTime: number;
}
