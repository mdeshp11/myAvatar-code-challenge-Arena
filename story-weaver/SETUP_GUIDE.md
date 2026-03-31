# AI Story Weaver - Setup & Installation Guide

## Project Overview

A collaborative storytelling web application where users partner with an AI powered by Google Gemini API to create interactive stories across multiple genres. The app features:

- **Story Setup**: Define title, genre, and initial hook
- **Main Storytelling**: Write collaboratively with AI
- **AI Features**: Continuations, branching choices, temperature control
- **Full History Tracking**: AI remembers entire story for consistency
- **6 Genres**: Fantasy, Sci-Fi, Mystery, Romance, Horror, Comedy

---

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **LLM**: Google Gemini 2.0 Flash API (free tier)
- **Styling**: CSS3 with CSS Variables
- **Development Server**: Vite dev server

---

## Prerequisites

- Node.js 18+ (Download from https://nodejs.org/)
- npm 9or higher
- Google account (for Gemini API)

---

## Step 1: Get Your Google Gemini API Key

### Option A: Using AI Studio (Easiest)

1. **Visit**: https://aistudio.google.com/app/apikey
2. **Click**: "Create API Key"
3. **Click**: "Get API Key in Google Cloud"
4. **Select**: "Create API key in a new Google Cloud project"
5. **Confirm**: Your API key is shown
6. **Copy**: Save it somewhere safe

**No credit card required** for the free tier (1 million tokens/day).

### Option B: Using Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable the Generative Language API
4. Create an API key in the Credentials section
5. Copy the API key

---

## Step 2: Configure Environment Variables

1. **Navigate to project folder**:
   ```bash
   cd story-weaver
   ```

2. **Open `.env.local`** in the project root

3. **Add your API key**:
   ```
   VITE_GEMINI_API_KEY=paste_your_api_key_here
   ```

   Replace `paste_your_api_key_here` with your actual key (no quotes needed).

4. **Save the file**

> **Note**: The `.env.local` file is already in `.gitignore` for security.

---

## Step 3: Install Dependencies

In the `story-weaver` folder, run:

```bash
npm install
```

This installs:
- React 18
- TypeScript
- Vite
- All necessary dependencies

---

## Step 4: Start the Development Server

```bash
npm run dev
```

You'll see:
```
  ➜  local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser.

---

## Step 5: Using the App

### Story Setup Screen

1. **Enter Story Title**: e.g., "The Lost Kingdom"
2. **Select Genre**: Choose from 6 genres
3. **Write Initial Hook**: Describe your story's setting/premise (max 500 chars)
4. **Click "Start the Story"**: AI generates a 150-250 word opening

### Main Storytelling View

Once the story starts:

- **🎨 Creativity Slider**: Adjust temperature (0-100%)
  - Low (20%): Conservative, predictable
  - High (80%+): Creative, unpredictable

- **Add Your Input**: Write 1-2 sentences and click "Add My Input"
  - AI reads full history and continues coherently

- **Continue with AI**: Let AI write the next 1-2 paragraphs
  - No user input needed

- **Give Me Choices**: Get 3 branching story paths
  - Click one to see how story continues

- **🔄 New Story**: Start a fresh story anytime

---

## Key Features Explained

### Temperature / Creativity

- **10-30%**: Logical, consistent, predictable storytelling
- **40-60%**: Balanced creativity and coherence
- **70-100%**: Wild, creative, surprising directions

### Automatic Consistency

The AI receives the **entire story history** with every request, ensuring:
- Character names stay consistent
- Plot points aren't contradicted
- Genre tone is maintained
- Character personalities are preserved

### Error Handling

- **Rate Limit**: "Rate limit reached, try again in a moment"
  - Free tier has generous limits
  - Wait 60 seconds and retry

- **API Key Missing**: Check .env.local configuration
  - Make sure key is set correctly
  - No spaces or quotes around key

---

## Project Structure

```
story-weaver/
├── src/
│   ├── components/
│   │   ├── StorySetup.tsx       # Setup form screen
│   │   └── StoryView.tsx         # Main storytelling view
│   ├── services/
│   │   └── storyWeaver.ts        # Google Gemini API integration
│   ├── styles/
│   │   ├── App.css              # Main styles + root CSS vars
│   │   ├── StorySetup.css       # Setup form styles
│   │   └── StoryView.css        # Story view styles
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Main app component (state management)
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global reset
├── .env.example                 # Example environment variables
├── .env.local                   # Your API key (git-ignored)
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies list
```

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## Troubleshooting

### "API key not configured"
- Check `.env.local` file exists
- Verify `VITE_GEMINI_API_KEY=your_key_here` (no spaces)
- Restart dev server after changing .env.local

### "Rate limit reached"
- Free tier has 1 million tokens/day
- Wait a moment and retry
- Average story continuation uses ~200-400 tokens

### App shows blank screen
- Check browser console for errors (F12 → Console)
- Verify React is rendering (check Network tab in DevTools)
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Styles not loading
- Clear browser cache
- Restart dev server
- Check all .css files in src/styles/ folder exist

---

## AI Customization

### Improving Story Quality

The system prompt in `storyWeaver.ts` controls AI behavior. To modify:

1. Open `src/services/storyWeaver.ts`
2. Find the `getSystemPrompt()` method
3. Edit the prompt text to adjust tone, style, or rules

Example: To add more detail:
```typescript
Write in vivid, detailed third-person narrative with sensory descriptions.
```

### Genre Rules

Modify the `GENRE_RULES` object to change how genres are described:

```typescript
const GENRE_RULES: Record<Genre, string> = {
  Fantasy: 'Your custom rules here...',
  // ...
};
```

---

## Performance Notes

- **Story Length**: Entire story is sent with each API call for consistency
  - Keep stories under 10,000 words for best performance
  - Typical continuation takes 3-5 seconds

- **Token Usage**: Average operations use:
  - Opening generation: 300-500 tokens
  - Story continuation: 200-400 tokens
  - Choice generation: 400-600 tokens

---

## Free Tier Limits

Google Gemini free tier includes:
- **1,000,000 tokens per day**
- **150 requests per minute**
- **32,000 token limit per request**

Perfect for prototyping and testing!

---

## Next Steps & Enhancements

Consider adding:
- **Story Export**: Download as .txt or .pdf
- **History Sidebar**: Browse/edit previous story segments
- **User Accounts**: Save multiple stories with authentication
- **Mobile UI**: Optimize layout for phones/tablets
- **Story Branches**: Visual tree of different story paths
- **Multi-Author**: Real-time collaboration
- **Image Generation**: AI-generated cover art or scene illustrations

---

## Support & Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

## Project Statistics

- **Components**: 2 (StorySetup, StoryView)
- **Services**: 1 (StoryWeaver - Gemini integration)
- **Lines of Code**: ~1,200 (React + TS)
- **CSS Lines**: ~600
- **Build Size**: ~150KB (gzipped)

---

Happy storytelling! 🎭✨
