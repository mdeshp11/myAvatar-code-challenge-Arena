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
}

export interface APIError {
  code: string;
  message: string;
}

export interface Choice {
  id: number;
  text: string;
}
