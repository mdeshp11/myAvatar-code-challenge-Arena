import type { Genre, Choice } from '../types';

const GENRE_RULES: Record<Genre, string> = {
  Fantasy: 'Medieval settings, magic systems, mythical creatures, quests. Maintain internal logic of magic and world rules.',
  'Sci-Fi': 'Advanced technology, space exploration, futuristic concepts. Keep scientific consistency.',
  Mystery: 'Clues, suspense, unreliable narrators possible. Build tension toward revelation.',
  Romance: 'Emotional depth, chemistry between characters, relationship development. Balance passion with plot.',
  Horror: 'Atmosphere of dread, tension escalation, scary elements. Don\'t overuse gore; focus on psychological fear.',
  Comedy: 'Humor, irony, absurdity. Keep the tone light and entertainment-focused while maintaining story coherence.',
};

export class StoryWeaver {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
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
): Promise<any> {
  const payload = {
    system_instruction: {
      parts: [{
        text: systemPrompt
      }]
    },
    contents: [
      ...this.conversationHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    generation_config: {
      temperature: Math.max(0.1, Math.min(1, temperature)),
      top_k: 40,
      top_p: 0.95,
      max_output_tokens: 1024,
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
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(
          errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
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

  async genreRemix(
    fullStory: string,
    newGenre: Genre,
    temperature: number
  ): Promise<string> {
    // Extract last few paragraphs (latest section)
    const paragraphs = fullStory.split('\n\n');
    const lastTwoParagraphs = paragraphs.slice(-2).join('\n\n');

    const userPrompt = `Here is the full story so far (for context):
---
${fullStory}
---

Now rewrite ONLY the last section (below) in the style of ${newGenre} genre, while keeping the plot and character actions identical:

---
${lastTwoParagraphs}
---

Rewrite this section maintaining:
- All character names and actions
- The plot progression
- But with ${newGenre} genre conventions, tone, and style
- Genre Rules for ${newGenre}: ${GENRE_RULES[newGenre]}`;

    const response = await this.callGeminiAPI(userPrompt, this.getSystemPrompt(newGenre), temperature);
    return this.extractTextFromResponse(response);
  }

  async extractCharacters(fullStory: string): Promise<Array<{ name: string; description: string }>> {
    const userPrompt = `Analyze this story and extract all named characters with brief descriptions:

---
${fullStory}
---

Format your response as:
1. [Character Name]: [Brief description of their role/personality in 1 sentence]
2. [Character Name]: [Brief description]

Only list actual named characters, not generic descriptions like "the guard" unless they're repeatedly mentioned as important.`;

    const systemPrompt = 'You are a precise literary analysis assistant. Extract and describe only named characters.';
    const response = await this.callGeminiAPI(userPrompt, systemPrompt, 0.3);
    const text = this.extractTextFromResponse(response);

    const characters: Array<{ name: string; description: string }> = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const match = line.match(/^\d+\.\s+([^:]+):\s+(.+)$/);
      if (match) {
        characters.push({
          name: match[1].trim(),
          description: match[2].trim(),
        });
      }
    }

    return characters;
  }

  async generateVisualizationPrompt(latestParagraph: string): Promise<string> {
    const userPrompt = `Create a vivid, concise image generation prompt (for DALL-E, Midjourney, or Flux) based on this story excerpt:

---
${latestParagraph}
---

The prompt should be:
- 1-2 sentences maximum
- Descriptive and visual
- Include key visual elements, characters, and setting
- In natural language (not a list)
- Ready to use directly in an image AI

Format: Just output the prompt, nothing else.`;

    const systemPrompt = 'You are an expert at writing image generation prompts. Be concise and visual.';
    const response = await this.callGeminiAPI(userPrompt, systemPrompt, 0.6);
    return this.extractTextFromResponse(response).trim();
  }

  public undoLastTurn(): void {
    if (this.conversationHistory.length >= 2) {
      this.conversationHistory.pop();
      this.conversationHistory.pop();
    }
  }

  public reset(): void {
    this.conversationHistory = [];
  }
}
