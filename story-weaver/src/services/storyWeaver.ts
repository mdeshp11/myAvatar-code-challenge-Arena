import type { Genre, Choice } from '../types';

const GENRE_RULES: Record<Genre, string> = {
  Fantasy: 'Medieval settings, magic systems, mythical creatures, quests. Maintain internal logic of magic and world rules.',
  'Sci-Fi': 'Advanced technology, space exploration, futuristic concepts. Keep scientific consistency.',
  Mystery: 'Clues, suspense, unreliable narrators possible. Build tension toward revelation.',
  Romance: 'Emotional depth, chemistry between characters, relationship development. Balance passion with plot.',
  Horror: 'Atmosphere of dread, tension escalation, scary elements. Don\'t overuse gore; focus on psychological fear.',
  Comedy: 'Humor, irony, absurdity. Keep the tone light and entertainment-focused while maintaining story coherence.',
};

interface GeminiRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  };
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

export class StoryWeaver {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required. Set VITE_GEMINI_API_KEY in .env.local');
    }
    this.apiKey = apiKey;
  }

  private getSystemPrompt(genre: Genre): string {
    return `You are a masterful collaborative storyteller specializing in ${genre} fiction. 

CRITICAL RULES:
1. NEVER contradict any previous plot points, character descriptions, or world-building
2. Keep ALL character names, personalities, and relationships EXACTLY consistent
3. Maintain the established ${genre} genre tone and style throughout
4. Genre Rules: ${GENRE_RULES[genre]}
5. Write in vivid, engaging third-person narrative
6. Keep paragraphs moderately paced - aim for 150-300 words per continuation
7. If continuing a story: read the entire history carefully before writing
8. If asked for choices: provide exactly 3 distinct branching paths that each make narrative sense

Remember: Story consistency is paramount. Never introduce contradictions.`;
  }

  async generateOpening(title: string, genre: Genre, hook: string): Promise<string> {
    const userPrompt = `Start a new ${genre} story.

Title: "${title}"
Setting/Hook: ${hook}

Write an engaging opening paragraph (150-250 words) that introduces the world, atmosphere, and draws the reader in. Set up the initial situation that will drive the story forward.`;

    this.conversationHistory = [];
    const response = await this.callGeminiAPI(userPrompt, this.getSystemPrompt(genre));
    const generatedText = this.extractTextFromResponse(response);
    
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: generatedText }],
    });

    return generatedText;
  }

  async continuStory(
    fullStory: string,
    userInput: string,
    genre: Genre,
    temperature: number
  ): Promise<string> {
    const userPrompt = `Here is the story so far:

---
${fullStory}
---

The user has written: "${userInput}"

Now continue the story with 1-2 paragraphs (200-400 words) that naturally follow from the user's contribution and maintain genre consistency.`;

    const response = await this.callGeminiAPI(userPrompt, this.getSystemPrompt(genre), temperature);
    const generatedText = this.extractTextFromResponse(response);

    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: generatedText }],
    });

    return generatedText;
  }

  async generateChoices(
    fullStory: string,
    genre: Genre,
    temperature: number
  ): Promise<Choice[]> {
    const userPrompt = `Here is the story so far:

---
${fullStory}
---

Generate exactly 3 distinct branching options for how the story could continue. Each option should be a single sentence (15-20 words) that represents a different narrative direction.

Format your response as:
1. [First choice]
2. [Second choice]
3. [Third choice]

Make sure each option:
- Is distinct and offers meaningful narrative choice
- Maintains genre consistency
- Could logically follow from the current story`;

    const response = await this.callGeminiAPI(userPrompt, this.getSystemPrompt(genre), temperature);
    const choicesText = this.extractTextFromResponse(response);
    return this.parseChoices(choicesText);
  }

  async continueWithChoice(
    fullStory: string,
    choice: string,
    genre: Genre,
    temperature: number
  ): Promise<string> {
    const userPrompt = `Here is the story so far:

---
${fullStory}
---

The user has chosen this narrative direction: "${choice}"

Continue the story with 1-2 coherent paragraphs (200-400 words) that incorporate this choice while maintaining plot consistency and genre tone.`;

    const response = await this.callGeminiAPI(userPrompt, this.getSystemPrompt(genre), temperature);
    const generatedText = this.extractTextFromResponse(response);

    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: generatedText }],
    });

    return generatedText;
  }

  private async callGeminiAPI(
    userMessage: string,
    systemPrompt: string,
    temperature: number = 0.7
  ): Promise<GeminiRequest> {
    const payload: GeminiRequest = {
      contents: [
        ...this.conversationHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: Math.max(0.1, Math.min(1, temperature)), // Clamp 0.1-1.0
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    try {
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || `API Error: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          throw new Error(
            'Rate limit reached. Please wait a moment and try again.'
          );
        }
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  private extractTextFromResponse(response: any): string {
    if (
      response.candidates &&
      response.candidates[0] &&
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts[0]
    ) {
      return response.candidates[0].content.parts[0].text;
    }
    throw new Error('Unexpected API response format');
  }

  private parseChoices(choicesText: string): Choice[] {
    const lines = choicesText.split('\n').filter(line => line.trim());
    const choices: Choice[] = [];
    let id = 1;

    for (const line of lines) {
      const match = line.match(/^\d+\.\s+(.+)$/);
      if (match) {
        choices.push({
          id,
          text: match[1].trim(),
        });
        id++;
      }
    }

    return choices.slice(0, 3); // Ensure max 3 choices
  }

  public reset(): void {
    this.conversationHistory = [];
  }
}
