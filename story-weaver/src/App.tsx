import { useState, useCallback } from 'react';
import { StorySetup } from './components/StorySetup';
import { StoryView } from './components/StoryView';
import { StoryWeaver } from './services/storyWeaver';
import type { StoryState, Genre, Choice } from './types';
import './styles/App.css';

function App() {
  const [storyState, setStoryState] = useState<StoryState>({
    title: '',
    genre: 'Fantasy',
    hook: '',
    fullStory: '',
    isStarted: false,
    temperature: 0.7,
    isLoading: false,
    error: null,
  });

  const [choices, setChoices] = useState<Choice[]>([]);
  const [weaver, setWeaver] = useState<StoryWeaver | null>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const handleStartStory = useCallback(
    async (title: string, genre: Genre, hook: string) => {
      if (!apiKey) {
        setStoryState((prev) => ({
          ...prev,
          error: 'API key not configured. Please add VITE_GEMINI_API_KEY to .env.local',
        }));
        return;
      }

      setStoryState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const weaverInstance = new StoryWeaver(apiKey);
        const opening = await weaverInstance.generateOpening(title, genre, hook);

        setWeaver(weaverInstance);
        setStoryState((prev) => ({
          ...prev,
          title,
          genre,
          hook,
          fullStory: opening,
          isStarted: true,
          isLoading: false,
        }));
        setChoices([]);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate opening';
        setStoryState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [apiKey]
  );

  const handleUserInput = useCallback(
    async (userText: string) => {
      if (!weaver) return;

      setStoryState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
      setChoices([]);

      try {
        const newContent = await weaver.continuStory(
          storyState.fullStory,
          userText,
          storyState.genre,
          storyState.temperature
        );

        setStoryState((prev) => ({
          ...prev,
          fullStory: prev.fullStory + '\n\n' + userText + '\n\n' + newContent,
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to continue story';
        setStoryState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [weaver, storyState.fullStory, storyState.genre, storyState.temperature]
  );

  const handleContinueWithAI = useCallback(async () => {
    if (!weaver) return;

    setStoryState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));
    setChoices([]);

    try {
      const newContent = await weaver.continuStory(
        storyState.fullStory,
        '',
        storyState.genre,
        storyState.temperature
      );

      setStoryState((prev) => ({
        ...prev,
        fullStory: prev.fullStory + '\n\n' + newContent,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to continue story';
      setStoryState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [weaver, storyState.fullStory, storyState.genre, storyState.temperature]);

  const handleGiveChoices = useCallback(async () => {
    if (!weaver) return;

    setStoryState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const generatedChoices = await weaver.generateChoices(
        storyState.fullStory,
        storyState.genre,
        storyState.temperature
      );

      setChoices(generatedChoices);
      setStoryState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate choices';
      setStoryState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [weaver, storyState.fullStory, storyState.genre, storyState.temperature]);

  const handleSelectChoice = useCallback(
    async (choiceText: string) => {
      if (!weaver) return;

      setStoryState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
      setChoices([]);

      try {
        const newContent = await weaver.continueWithChoice(
          storyState.fullStory,
          choiceText,
          storyState.genre,
          storyState.temperature
        );

        setStoryState((prev) => ({
          ...prev,
          fullStory: prev.fullStory + '\n\n' + newContent,
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to continue story';
        setStoryState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [weaver, storyState.fullStory, storyState.genre, storyState.temperature]
  );

  const handleTemperatureChange = (temp: number) => {
    setStoryState((prev) => ({
      ...prev,
      temperature: temp,
    }));
  };

  const handleReset = () => {
    if (weaver) {
      weaver.reset();
    }
    setStoryState({
      title: '',
      genre: 'Fantasy',
      hook: '',
      fullStory: '',
      isStarted: false,
      temperature: 0.7,
      isLoading: false,
      error: null,
    });
    setChoices([]);
  };

  return (
    <div className="app">
      {!storyState.isStarted ? (
        <StorySetup onStart={handleStartStory} isLoading={storyState.isLoading} />
      ) : (
        <StoryView
          title={storyState.title}
          genre={storyState.genre}
          fullStory={storyState.fullStory}
          temperature={storyState.temperature}
          onTemperatureChange={handleTemperatureChange}
          onUserInput={handleUserInput}
          onContinueWithAI={handleContinueWithAI}
          onGiveChoices={handleGiveChoices}
          onSelectChoice={handleSelectChoice}
          isLoading={storyState.isLoading}
          error={storyState.error}
          choices={choices}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
