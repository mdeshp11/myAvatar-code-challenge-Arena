import React, { useState } from 'react';
import type { Genre, Choice, Character, RetryState } from '../types';
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
  onGenreRemix: (genre: Genre) => void;
  onUndo: () => void;
  onExtractCharacters: () => void;
  onGenerateVisualization: () => void;
  onExportMarkdown: () => void;
  retryState: RetryState;
  characters: Character[];
  visualizationPrompt: string | null;
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
  onGenreRemix,
  onUndo,
  onExtractCharacters,
  onGenerateVisualization,
  onExportMarkdown,
  retryState,
  characters,
  visualizationPrompt,
}) => {
  const [userText, setUserText] = useState('');
  const [showCharacters, setShowCharacters] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [selectedRemixGenre, setSelectedRemixGenre] = useState<Genre>(genre);

    const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (userText.trim()) {
      onUserInput(userText);
      setUserText('');
    }
  };

  const formatStoryText = (text: string): string | (string | React.ReactNode)[] => {
    // Parse markdown-style formatting and return JSX elements
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    const boldRegex = /\*([^*]+)\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold section
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold element
      parts.push(
        <strong key={`bold-${match.index}`} className="bold-text">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
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
          {fullStory && (
            <div className="story-body">
              {formatStoryText(fullStory)}
            </div>
          )}
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
              {retryState.isRetrying && (
                <div className="retry-notice">
                  ⏱️ Rate limited. Retry in {retryState.countdown}s
                </div>
              )}

              <div className="bonus-features">
                <div className="feature-group">
                  <label htmlFor="remix-genre">🎭 Genre Remix:</label>
                  <select
                    id="remix-genre"
                    value={selectedRemixGenre}
                    onChange={(e) => setSelectedRemixGenre(e.target.value as Genre)}
                    disabled={isLoading}
                  >
                    <option value="Fantasy">Fantasy</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Romance">Romance</option>
                    <option value="Horror">Horror</option>
                    <option value="Comedy">Comedy</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-feature"
                    onClick={() => onGenreRemix(selectedRemixGenre)}
                    disabled={isLoading || retryState.isRetrying}
                    title="Rewrite the last section in a different genre"
                  >
                    🔄 Remix
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-feature"
                  onClick={onUndo}
                  disabled={isLoading || retryState.isRetrying}
                  title="Remove the last AI-generated section"
                >
                  ↶ Undo
                </button>

                <button
                  type="button"
                  className="btn btn-feature"
                  onClick={() => {
                    onExtractCharacters();
                    setShowCharacters(!showCharacters);
                  }}
                  disabled={isLoading}
                  title="Extract and display story characters"
                >
                  👥 Characters ({characters.length})
                </button>

                <button
                  type="button"
                  className="btn btn-feature"
                  onClick={() => {
                    onGenerateVisualization();
                    setShowVisualization(!showVisualization);
                  }}
                  disabled={isLoading}
                  title="Generate image prompt for visualizing this scene"
                >
                  🖼️ Visualize
                </button>

                <button
                  type="button"
                  className="btn btn-feature"
                  onClick={onExportMarkdown}
                  disabled={isLoading}
                  title="Download story as Markdown file"
                >
                  💾 Export
                </button>
              </div>

              {showCharacters && characters.length > 0 && (
                <div className="characters-panel">
                  <h4>📖 Story Characters</h4>
                  <ul className="character-list">
                    {characters.map((char, idx) => (
                      <li key={idx}>
                        <strong>{char.name}</strong>
                        <p>{char.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showVisualization && visualizationPrompt && (
                <div className="visualization-panel">
                  <h4>🎨 Visualization Prompt</h4>
                  <p className="visualization-text">{visualizationPrompt}</p>
                  <p className="visualization-hint">
                    Use this prompt with DALL-E, Midjourney, or Flux to generate an image.
                  </p>
                </div>
              )}

              <div className="main-buttons">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !userText.trim() || retryState.isRetrying}
                >
                  📝 Add My Input
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onContinueWithAI}
                  disabled={isLoading || retryState.isRetrying}
                >
                  ✨ Continue with AI
                </button>
                <button
                  type="button"
                  className="btn btn-tertiary"
                  onClick={onGiveChoices}
                  disabled={isLoading || retryState.isRetrying}
                >
                  🎲 Give Me Choices
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
