import React, { useState } from 'react';
import type { Genre } from '../types';
import '../styles/StorySetup.css';

interface StorySetupProps {
  onStart: (title: string, genre: Genre, hook: string) => void;
  isLoading: boolean;
}

const GENRES: Genre[] = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Comedy'];

export const StorySetup: React.FC<StorySetupProps> = ({ onStart, isLoading }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<Genre>('Fantasy');
  const [hook, setHook] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && hook.trim()) {
      onStart(title, genre, hook);
    }
  };

  return (
    <div className="story-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h1>🎭 AI Story Weaver</h1>
          <p>Collaborate with AI to create an amazing story</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="title">Story Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Last Dragon"
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              disabled={isLoading}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hook">Initial Hook / Setting</label>
            <textarea
              id="hook"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Describe your story's initial setting, characters, or situation..."
              disabled={isLoading}
              maxLength={500}
              rows={6}
            />
            <span className="char-count">{hook.length}/500</span>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !title.trim() || !hook.trim()}
          >
            {isLoading ? '✨ Generating Opening...' : '🚀 Start the Story'}
          </button>
        </form>
      </div>
    </div>
  );
};
