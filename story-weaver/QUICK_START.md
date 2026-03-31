# ⚡ Quick Start Guide - AI Story Weaver

## 🚀 Get Started in 5 Minutes

### Step 1: Get API Key
Visit https://aistudio.google.com/app/apikey and click "Create API Key"

**No credit card required!** Free tier: 1 million tokens/day

### Step 2: Configure Project
Open `.env.local` and paste your API key:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

### Step 3: Start Development Server
```bash
cd story-weaver

npm install          # First time only

npm run dev          # Start server
```

Open http://localhost:5173 in your browser

---

## 🎮 How to Use the App

### 1. **Setup Screen**
- Enter a story title
- Choose a genre (Fantasy, Sci-Fi, Mystery, Romance, Horror, Comedy)
- Write a hook/setting description
- Click "Start the Story" → AI generates opening

### 2. **Story Screen**
Choose how to continue:

| Action | What Happens |
|--------|--------------|
| **Add My Input** | Write 1-2 sentences → AI continues the story |
| **Continue with AI** | AI writes the next 1-2 paragraphs (no user input) |
| **Give Me Choices** | AI suggests 3 story directions → pick one |

### 3. **Advanced Options**
- 🎨 **Creativity Slider**: Low (predictable) → High (wild & creative)
- 🔄 **New Story**: Start fresh anytime

---

## 📋 Project Structure

```
story-weaver/
├── src/
│   ├── components/
│   │   ├── StorySetup.tsx      # Initial story form
│   │   └── StoryView.tsx        # Main story interface
│   ├── services/
│   │   └── storyWeaver.ts       # AI integration & prompts
│   ├── styles/
│   │   ├── App.css
│   │   ├── StorySetup.css
│   │   └── StoryView.css
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── .env.local (⭐ Add API key here)
└── SETUP_GUIDE.md (~
```

---

## 🔑 Environment Setup

### .env.local file

```env
VITE_GEMINI_API_KEY=paste_your_key_here
```

**⚠️ This file is git-ignored for security**

---

## 🛠️ Available Commands

```bash
npm run dev       # Start dev server (hot reload!)
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Check code for issues
```

---

## ✨ Key Features

✅ **Real-time AI Collaboration** - AI reads full story history  
✅ **Genre Consistency** - Custom prompts per genre  
✅ **Creative Control** - Temperature slider for AI behavior  
✅ **Branching Stories** - Get choices and pick your path  
✅ **Beautiful UI** - Dark theme, gradient buttons, smooth animations  
✅ **Type Safe** - Built with TypeScript  
✅ **Free** - Uses Gemini free tier (1M tokens/day)  

---

## 🐛 Troubleshooting

### "API key not configured"
→ Check `.env.local` file exists and has your key

### App won't start
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Rate limit error
→ Free tier allows 150 requests/minute. Wait 60 seconds and retry.

### Blank page
→ Press F12 (DevTools) → Console tab to see errors

---

## 📊 What's Inside

- **React 18** + TypeScript for type safety
- **Vite** for fast development & builds
- **Google Gemini 2.0 Flash** for AI
- **Custom CSS** with CSS variables (no frameworks!)
- **1,200+ lines** of production-ready code

---

## 🎯 How the AI Works

1. **Story Setup**: User provides title + hook
2. **Opening**: AI generates 150-250 word opening
3. **Continuation**: AI receives ENTIRE story + new input
4. **Consistency Check**: Prompts enforce:
   - No plot contradictions
   - Character consistency
   - Genre-specific tone
   - World-building rules

---

## 🚀 Next Steps

1. **Add your API key** to `.env.local`
2. **Run `npm run dev`**
3. **Open http://localhost:5173**
4. **Start creating stories!**

---

## 📚 Resources

- Gemini API: https://ai.google.dev
- React: https://react.dev
- Vite: https://vitejs.dev

---

**Questions?** Check SETUP_GUIDE.md for detailed documentation!

Happy storytelling! 🎭✨
