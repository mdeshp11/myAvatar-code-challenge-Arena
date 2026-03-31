# 📖 AI-Powered Collaborative Storytelling Application

An interactive, collaborative storytelling application where users and AI take turns crafting narratives together. Built with React, TypeScript, and Google's Gemini AI model.

![Story Weaver](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Gemini](https://img.shields.io/badge/Gemini-Pro-red)

---

## 🎯 Features

### Core Features
- ✍️ **Collaborative Storytelling** - Write with AI that understands full story context
- 🎭 **6 Genres** - Fantasy, Sci-Fi, Mystery, Romance, Horror, Comedy with distinct voice personalities
- 🎚️ **Creativity Control** - Adjust temperature (0.1-1.0) to influence AI response style
- 🎲 **Branching Paths** - Request 3 AI-generated story directions and choose one
- 📝 **User Input Modes**
  - Add custom sentences/paragraphs to the story
  - Continue with pure AI generation
  - Request multiple choice options

### Bonus Features (✨ 6 Advanced Features Implemented)
1. **🎭 Genre Remix** - Rewrite the last story section in a completely different genre while preserving plot
2. **👥 Character Tracker** - Auto-extract and display all named characters with descriptions
3. **🖼️ Visualization Prompt** - Generate image-generation-ready prompts for DALL-E/Flux integration
4. **💾 Markdown Export** - Download your complete story as a clean markdown file
5. **↶ Undo Last Turn** - Remove the most recent AI-generated section
6. **⏱️ Rate-Limit Friendly Retry** - Smart 60-second countdown timer when hitting API limits

### UI/UX Features
- 🎨 Beautiful dark theme with gradient accents
- 📱 Responsive design optimized for 800px-1200px widths
- ✨ Smooth animations and transitions
- **Bold formatting** in story text for better readability
- Real-time character count and creativity level display

---

## 🚀 Quick Start (5 Minutes)

### 1️⃣ Get Your API Key (Free)

Visit: https://aistudio.google.com/app/apikey 

Sign in with Google → Click "Create API Key" → Copy the key

**No credit card required!** Free tier: 1,000,000 tokens/day

### 2️⃣ Clone and Setup

```bash
git clone <repository-url>
cd myAvatar-code-challenge-Arena/story-weaver
npm install
```

### 3️⃣ Configure Environment

Create `.env.local` in the `story-weaver/` folder:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

Open http://localhost:5174 in your browser

---

## 🏗️ Project Structure

```
myAvatar-code-challenge-Arena/
├── README.md                          # This file
├── story-weaver/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StorySetup.tsx        # Initial setup form
│   │   │   └── StoryView.tsx          # Main story interface with bonus features
│   │   ├── services/
│   │   │   └── storyWeaver.ts         # AI integration & story logic
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── StorySetup.css
│   │   │   └── StoryView.css
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.local                     # ⭐ Add API key here
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
```

---

## 🤖 Technical Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.3.1 |
| **TypeScript** | Type Safety | 5.3.3 |
| **Vite** | Build Tool | 5.0.8 |
| **Google Gemini API** | AI Model | Pro (v1beta) |
| **CSS3** | Styling | Custom variables |

---

## 🧠 AI Model & Provider

### Model: Google Gemini Pro
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Provider**: Google AI Studio (Free tier: 1M tokens/day)
- **Rate Limit**: 150 requests/minute
- **Temperature Range**: 0.1 (conservative) to 1.0 (creative)

### Why Gemini Pro?
- ✅ Free tier with generous limits
- ✅ Excellent at context-aware generation
- ✅ Supports long prompts (preserves full story history)
- ✅ Fast response times
- ✅ No credit card required for setup

---

## 📋 Final System Prompt

The AI uses carefully crafted system prompts that vary by genre. Here's the core template:

```
You are a mystery storyteller crafting a collaborative narrative. 

GENRE RULES for Mystery:
[Genre-specific conventions and tone guidelines]

CRITICAL CONSTRAINTS:
1. Maintain all existing character names, personalities, and relationships
2. Preserve all plot points and world-building rules established so far
3. Write 1-2 coherent paragraphs (150-250 words)
4. Match the tone and style of previous sections
5. No contradictions with story history
6. Use descriptive, immersive language

STORY SO FAR:
[Full story provided for context]

YOUR TURN: Continue the story naturally from where it left off.
```

### Genre-Specific Rules Applied

Each genre gets customized instructions:

**Fantasy**: Medieval settings, magic systems, mythical creatures, quests. Maintain internal logic of magic and world rules.

**Sci-Fi**: Advanced technology, space exploration, futuristic concepts. Keep scientific consistency.

**Mystery**: Clues, suspense, unreliable narrators possible. Build tension toward revelation.

**Romance**: Emotional depth, chemistry between characters, relationship development. Balance passion with plot.

**Horror**: Atmosphere of dread, tension escalation, scary elements. Don't overuse gore; focus on psychological fear.

**Comedy**: Humor, irony, absurdity. Keep the tone light and entertainment-focused while maintaining story coherence.

---

## 💾 Memory & Consistency Strategy

### Full Story Context Preservation

Every AI call receives the **complete story history**. This ensures:

1. **Character Consistency** - AI always knows all characters introduced
2. **Plot Coherence** - No contradictions or forgotten plot threads
3. **World Rules** - Magic systems, technology, and world-building remain consistent
4. **Tone Matching** - AI adapts to established narrative voice
5. **Reference Accuracy** - No reset; every scene is remembered

### Conversation History Management

- **Conversation history array** stores alternating user actions and AI responses
- **Story state** maintains:
  - Full story text (concatenated)
  - Current genre and temperature
  - Character list (extracted after each turn)
  - Undo history (for reverting actions)
  - Visualization prompt for AI art integration

### Recovery from API Errors

- **Rate limit handling**: 60-second countdown timer + automatic retry capability
- **Network errors**: User-friendly error messages + manual retry buttons
- **Invalid responses**: Detected and re-prompt with adjusted temperature

---

## ✨ Bonus Features Implementation

### 1. 🎭 Genre Remix
**What it does**: Rewrites the last 2 paragraphs in a completely different genre

**Implementation**:
- Extracts final 2 paragraphs from story
- Sends to Gemini with target genre rules
- Maintains character names and plot actions
- Replaces only the last section with genre-remixed version

```typescript
// Signature
genreRemix(fullStory: string, newGenre: Genre, temperature: number): Promise<string>
```

---

### 2. 👥 Character Tracker
**What it does**: Automatically extracts all named characters and displays them

**Implementation**:
- Calls dedicated AI endpoint with character extraction prompt
- Parses numbered response: "1. Name: Description"
- Stores in TypeScript `Character[]` array
- Displays in expandable panel with character details

```typescript
interface Character {
  name: string;
  description: string;
  firstMentioned: number;
}
```

**Usage**: Click "👥 Characters" button to expand/collapse character list

---

### 3. 🖼️ Visualization Prompt
**What it does**: Generates AI art-ready image prompts from the latest story section

**Implementation**:
- Extracts most recent paragraph
- Sends to AI with art-generation prompt template
- Generates 1-2 sentence visual description
- Format optimized for DALL-E/Midjourney/Flux

**Example**: "A misty Victorian mansion with gothic architecture overlooking a fog-covered moor, oil painting style"

**Usage**: Click "🖼️ Visualize" button to see and copy prompt

---

### 4. 💾 Markdown Export
**What it does**: Downloads complete story as formatted markdown file

**Implementation**:
- Formats story with title, genre, and metadata
- Converts story text (including bold sections) to markdown
- Creates downloadable file: `story_title_YYYYMMDD.md`
- Preserves all formatting for external use

**File Format**:
```markdown
# Story Title
**Genre**: Mystery | **Creativity**: 70%

## Story

[Full story text with **bold** elements preserved]
```

---

### 5. ↶ Undo Last Turn
**What it does**: Removes the most recent AI-generated section from the story

**Implementation**:
- Maintains `undoHistory` array
- Pops last 2 items (user input + AI response)
- Rebuilds story from previous state
- User can undo multiple times

**Constraints**: Cannot undo if no AI contributions yet

---

### 6. ⏱️ Rate-Limit Friendly Retry
**What it does**: Graceful handling of API rate limits with user-friendly countdown

**Implementation**:
- Detects HTTP 429 (Too Many Requests) errors
- Triggers `RetryState` with 60-second countdown
- Disables all API-calling buttons during cooldown
- Shows countdown: "⏱️ Rate limited. Retry in 45s"
- Automatically enables buttons after countdown

```typescript
interface RetryState {
  isRetrying: boolean;
  countdown: number;
  nextRetryTime: number;
}
```

**Behavior**: 
- Free tier: 150 requests/minute → Retry handles this gracefully
- Visual feedback + prevented user frustration
- Countdown uses `useEffect` with 1-second intervals

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

```bash
# 1. Clone repository
git clone <repo-url>
cd myAvatar-code-challenge-Arena/story-weaver

# 2. Install dependencies
npm install

# 3. Create .env.local
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start development server
npm run dev

# 5. Open browser
# Visit http://localhost:5174
```

---

## 🐛 What Didn't Work at First (& How I Fixed It)

### Problem: Multiple API Model/Version Failures 🔴

**Initial Attempt 1**: Used `gemini-2.0-flash` model with v1 endpoint
- **Error**: `404 Not Found` - Model doesn't exist
- **Root Cause**: Model availability varies by API version

**Initial Attempt 2**: Switched to `gemini-1.5-flash` with v1beta endpoint
- **Error**: `400 Bad Request - Invalid request`
- **Root Cause**: Payload format expected camelCase in v1, but v1beta uses snake_case

**Initial Attempt 3**: Fixed camelCase → snake_case, but still got 404
- **Error**: `404 - gemini-1.5-flash not found for v1beta`
- **Root Cause**: Model availability is version-specific; `gemini-1.5-flash` not available in v1beta

### Solution ✅

After testing and research, found that **`gemini-pro` with v1beta** is:
- Most stable
- Universally available
- Excellent for long-context stories
- Fastest response times

**Final Working Configuration**:
```typescript
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

const payload = {
  system_instruction: systemPrompt,
  contents: [...conversationHistory],
  generation_config: {
    temperature: 0.7,
    max_output_tokens: 1024
  }
};
```

## 🚀 Future Improvements (Next 8 Hours)

### High Priority

1. **🎨 Story Illustration Gallery**
   - Auto-generate images for key scenes using Stability AI / DALL-E API
   - Build visual timeline of the story
   - Include character portraits
   - **Effort**: 2 hours

2. **📚 Story Persistence & Database**
   - Save stories to cloud (Firebase or Supabase)
   - User accounts & story library
   - Export/import stories
   - **Effort**: 3 hours

3. **🗣️ Multi-User Collaboration**
   - Real-time collaborative writing (WebSocket)
   - Multiple users contributing to same story
   - Live cursor positions & chat
   - **Effort**: 3 hours

### Medium Priority

4. **🔄 Advanced Branching & Time Travel**
   - Visual story tree showing all branching paths
   - Jump to any previous point and explore alternate timelines
   - Compare different genre remixes side-by-side
   - **Effort**: 2 hours

5. **🎯 Smart Story Analysis**
   - Character relationship map
   - Plot point timeline visualization
   - Thematic consistency checker
   - Word count & reading level analysis
   - **Effort**: 2 hours

6. **🎤 Audio Features**
   - Text-to-speech narrator for stories
   - Character voice selection
   - Ambient music/sound effects per genre
   - **Effort**: 2 hours

### Nice-to-Have

7. **📱 Mobile App**
   - React Native version for iOS/Android
   - Touch-optimized UI
   - **Effort**: 4 hours

8. **🌐 Web Sharing**
   - Public story URLs
   - Community leaderboard
   - Story ratings & comments
   - **Effort**: 3 hours

### Priority Implementation Order
1. Database integration (enables many features)
2. Multi-user collaboration (highest user value)
3. Story illustrations (most visually impressive)
4. Branching visualization (best for user experience)

---

## 🐞 Troubleshooting

### Issue: "VITE_GEMINI_API_KEY is not set"
**Solution**: 
- Create `.env.local` file in `story-weaver/` folder
- Add: `VITE_GEMINI_API_KEY=your_key`
- Restart dev server

### Issue: "Rate limit exceeded"
**Solution**: 
- Free tier: 150 requests/minute
- Use the built-in ⏱️ retry countdown (60 seconds)
- Reduce creativity level to get shorter responses

### Issue: Blank page / Port 5173 already in use
**Solution**:
```bash
# Use different port
npm run dev -- --port 5175
```

### Issue: TypeScript errors on `npm run build`
**Solution**:
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run build
```

---

## 📖 Technologies & Libraries

- **React 18.3.1** - UI framework with hooks
- **TypeScript 5.3.3** - Type safety
- **Vite 5.0.8** - Fast build tool with HMR
- **Google Gemini API** - AI model for story generation
- **CSS3** - Custom properties, flexbox, gradients
- **Fetch API** - HTTP requests (no-dependency approach)

### Why No External UI Libraries?
✅ Full control over styling  
✅ Smaller bundle size (~210KB gzipped)  
✅ Perfect for learning React patterns  
✅ Custom animations optimized for this use case