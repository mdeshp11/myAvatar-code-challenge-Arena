import React, { useState } from 'react';
import type { Genre, Choice } from '../types';
import '../styles/StoryView.css';

interface StoryViewProps {
  title: string;
  genre: Genre;
  fullStory: string;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  onUserInput: (text: string) => void;
  onContinueWithAI: () => void;
  onGiveChoices: () => void;
  onSelectChoice: (choice: string) => void;
  isLoading: boolean;
  error: string | null;
  choices: Choice[];
  onReset: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  title,
  genre,
  fullStory,
  temperature,
  onTemperatureChange,
  onUserInput,
  onContinueWithAI,
  onGiveChoices,
  onSelectChoice,
  isLoading,
  error,
  choices,
  onReset,
}) => {
  const [userText, setUserText] = useState('');

  const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (userText.trim()) {
      onUserInput(userText);
      setUserText('');
    }
  };

  const getGenreIcon = (g: Genre): string => {
    const icons: Record<Genre, string> = {
      Fantasy: '🧙',
      'Sci-Fi': '🚀',
      Mystery: '🕵️',
      Romance: '💕',
      Horror: '👻',
      Comedy: '😂',
    };
    return icons[g];
  };

  const getGenreRules = (g: Genre): string => {
    const rules: Record<Genre, string> = {
      Fantasy: 'Medieval settings, magic systems, mythical creatures, quests',
      'Sci-Fi': 'Advanced technology, space exploration, futuristic concepts',
      Mystery: 'Clues, suspense, tension building toward revelation',
      Romance: 'Emotional depth, chemistry, relationship development',
      Horror: 'Atmosphere of dread, tension escalation, psychological fear',
      Comedy: 'Humor, irony, absurdity with story coherence',
    };
    return rules[g];
  };

  return (
    <div className="story-view">
      <div className="story-header">
        <div className="header-top">
          <h1>{title}</h1>
          <button className="reset-btn" onClick={onReset} title="Start a new story">
            🔄 New Story
          </button>
        </div>
        <div className="genre-info">
          <span className="genre-badge">
            {getGenreIcon(genre)} {genre}
          </span>
          <span className="genre-rules">{getGenreRules(genre)}</span>
        </div>
      </div>

      <div className="story-content">
        <div className="story-text">
          {fullStory && <div className="story-body">{fullStory}</div>}
        </div>

        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>✨ The AI is thinking...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>

      <div className="story-controls">
        <div className="creativity-control">
          <label htmlFor="temperature">
            🎨 Creativity Level: <strong>{Math.round(temperature * 100)}%</strong>
          </label>
          <input
            id="temperature"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            disabled={isLoading}
            className="slider"
          />
          <div className="slider-labels">
            <span>Conservative</span>
            <span>Creative</span>
          </div>
        </div>

        {choices.length > 0 ? (
          <div className="choices-section">
            <h3>Where should the story go?</h3>
            <div className="choices-list">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  className="choice-btn"
                  onClick={() => onSelectChoice(choice.text)}
                  disabled={isLoading}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUserInput} className="user-input-form">
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Add your own sentence or paragraph to the story..."
              disabled={isLoading}
              maxLength={500}
              rows={3}
            />
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !userText.trim()}
              >
                📝 Add My Input
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onContinueWithAI}
                disabled={isLoading}
              >
                ✨ Continue with AI
              </button>
              <button
                type="button"
                className="btn btn-tertiary"
                onClick={onGiveChoices}
                disabled={isLoading}
              >
                🎲 Give Me Choices
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
