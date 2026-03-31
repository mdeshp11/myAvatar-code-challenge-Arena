import { useState, useCallback, useEffect } from 'react';
import { StorySetup } from './components/StorySetup';
import { StoryView } from './components/StoryView';
import { StoryWeaver } from './services/storyWeaver';
import type { StoryState, Genre, Choice, RetryState } from './types';
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
    undoHistory: [],
    characters: [],
    visualizationPrompt: null,
  });

  const [choices, setChoices] = useState<Choice[]>([]);
  const [weaver, setWeaver] = useState<StoryWeaver | null>(null);
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    countdown: 0,
    nextRetryTime: 0,
  });

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Retry countdown timer
  useEffect(() => {
    if (retryState.isRetrying && retryState.countdown > 0) {
      const timer = setTimeout(() => {
        const newCountdown = Math.max(0, retryState.countdown - 1);
        setRetryState((prev) => ({
          ...prev,
          countdown: newCountdown,
          isRetrying: newCountdown > 0,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryState.isRetrying, retryState.countdown]);

  const handleRateLimitError = () => {
    setRetryState({
      isRetrying: true,
      countdown: 60,
      nextRetryTime: Date.now() + 60000,
    });
  };

  const handleGenreRemix = useCallback(
    async (newGenre: Genre) => {
      if (!weaver) return;

      setStoryState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const remixedContent = await weaver.genreRemix(
          storyState.fullStory,
          newGenre,
          storyState.temperature
        );

        // Replace last section with remixed version
        const paragraphs = storyState.fullStory.split('\n\n');
        const newStory = paragraphs.slice(0, -2).join('\n\n') + '\n\n' + remixedContent;

        setStoryState((prev) => ({
          ...prev,
          fullStory: newStory,
          isLoading: false,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remix genre';
        if (message.includes('429')) {
          handleRateLimitError();
        }
        setStoryState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [weaver, storyState.fullStory, storyState.genre, storyState.temperature]
  );

  const handleUndo = useCallback(() => {
    if (!weaver) return;

    setStoryState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      weaver.undoLastTurn();

      // Remove last user + AI section from story
      const paragraphs = storyState.fullStory.split('\n\n');
      if (paragraphs.length >= 2) {
        const newStory = paragraphs.slice(0, -2).join('\n\n');
        setStoryState((prev) => ({
          ...prev,
          fullStory: newStory,
          isLoading: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to undo';
      setStoryState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [weaver, storyState.fullStory]);

  const handleExtractCharacters = useCallback(async () => {
    if (!weaver) return;

    try {
      const extracted = await weaver.extractCharacters(storyState.fullStory);
      setStoryState((prev) => ({
        ...prev,
        characters: extracted.map((char, idx) => ({
          name: char.name,
          description: char.description,
          firstMentioned: idx,
        })),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to extract characters';
      if (message.includes('429')) {
        handleRateLimitError();
      }
      setStoryState((prev) => ({
        ...prev,
        error: message,
      }));
    }
  }, [weaver, storyState.fullStory]);

  const handleGenerateVisualization = useCallback(async () => {
    if (!weaver) return;

    setStoryState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const paragraphs = storyState.fullStory.split('\n\n');
      const latestParagraph = paragraphs[paragraphs.length - 1];
      const prompt = await weaver.generateVisualizationPrompt(latestParagraph);

      setStoryState((prev) => ({
        ...prev,
        visualizationPrompt: prompt,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate visualization prompt';
      if (message.includes('429')) {
        handleRateLimitError();
      }
      setStoryState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [weaver, storyState.fullStory]);

  const handleExportMarkdown = useCallback(() => {
    const markdown = `# ${storyState.title}

**Genre:** ${storyState.genre}

---

## Story

${storyState.fullStory}

---

_Generated with AI Story Weaver_
`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown));
    element.setAttribute('download', `${storyState.title.replace(/\s+/g, '_')}_story.md`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [storyState.title, storyState.genre, storyState.fullStory]);

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
      if (message.includes('429')) {
        handleRateLimitError();
      }
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
      if (message.includes('429')) {
        handleRateLimitError();
      }
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
        if (message.includes('429')) {
          handleRateLimitError();
        }
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
      undoHistory: [],
      characters: [],
      visualizationPrompt: null,
    });
    setChoices([]);
    setRetryState({
      isRetrying: false,
      countdown: 0,
      nextRetryTime: 0,
    });
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
          onGenreRemix={handleGenreRemix}
          onUndo={handleUndo}
          onExtractCharacters={handleExtractCharacters}
          onGenerateVisualization={handleGenerateVisualization}
          onExportMarkdown={handleExportMarkdown}
          retryState={retryState}
          characters={storyState.characters}
          visualizationPrompt={storyState.visualizationPrompt}
        />
      )}
    </div>
  );
}

export default App;
