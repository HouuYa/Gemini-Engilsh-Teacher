# CLAUDE.md - AI Assistant Guide for Gemini English Teacher

## Project Overview

**Gemini English Teacher** (매일 영어 토론 선생님) is an AI-powered English learning application that provides comprehensive language learning through structured discussions. Built with React and powered by Google Gemini API, it offers:

- **Real-time voice conversations** with an AI discussion partner (Alex)
- **Structured learning flow** across 5 steps: Briefing → Discussion → Feedback → Shadowing → Completion
- **Comprehensive feedback** on grammar, vocabulary, and fluency
- **Shadowing practice** for pronunciation and internalization
- **Text-to-Speech (TTS)** capabilities for reading aloud
- **Multi-modal AI interactions** using Gemini's native audio and live session APIs

**Target Audience**: CEFR B1-B2 level English learners (intermediate)

**Original Platform**: Google AI Studio app (https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn)

---

## Tech Stack

### Core Technologies
- **React 19.2.0** - UI framework with hooks and functional components
- **TypeScript 5.8.2** - Type safety and improved DX
- **Vite 6.2.0** - Build tool and dev server
- **Tailwind CSS** (CDN) - Utility-first styling
- **@google/genai 1.29.1** - Google Gemini API SDK

### Build & Development
- **Module System**: ESNext modules
- **JSX Transform**: react-jsx (automatic runtime)
- **TypeScript Config**: Bundler resolution with path aliases (`@/*`)
- **Dev Server**: Port 3000, host 0.0.0.0

### APIs Used
1. **Gemini 2.5 Pro/Flash** - General content generation
2. **Gemini 2.5 Flash Native Audio Preview** - Live voice sessions
3. **Gemini 2.5 Flash Preview TTS** - Text-to-speech synthesis
4. **Google Search Tool** - Finding recent news articles

---

## Codebase Structure

```
/
├── App.tsx                 # Main application component and state management
├── index.tsx              # React entry point
├── index.html             # HTML template with Tailwind config
├── types.ts               # TypeScript type definitions
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
├── .env.local             # Environment variables (GEMINI_API_KEY)
│
├── components/
│   ├── Icons.tsx          # SVG icon components
│   └── Loader.tsx         # Loading spinner component
│
├── services/
│   └── geminiService.ts   # Gemini API integration layer
│
└── utils/
    └── audio.ts           # Audio encoding/decoding utilities
```

### File Responsibilities

#### `App.tsx` (802 lines)
The monolithic main component containing:
- **State Management**: All application state using React hooks
- **Business Logic**: Step progression, session management, API orchestration
- **UI Components**: Inline component definitions for all 5 steps
- **Audio Management**: Web Audio API integration for input/output
- **Live Session Handling**: Microphone access, real-time transcription, audio playback

**Key Components Defined**:
- `ModelSelector` - Model selection dropdown
- `ApiKeyScreen` - API key input form
- `StartScreen` - Welcome screen
- `Step1Briefing` - Topic briefing display
- `Step2Discussion` - Live conversation interface
- `Step3Feedback` - Feedback display
- `Step4Shadowing` - Shadowing practice
- `Step5Completion` - Session complete screen

#### `services/geminiService.ts`
Centralized API service layer:
- `checkApiStatus()` - Validates API key
- `fetchBriefing()` - Generates new topic briefing
- `getFeedback()` - Analyzes conversation transcript
- `getShadowingSentences()` - Extracts sentences for practice
- `parseJsonResponse()` - JSON parsing with error handling

#### `utils/audio.ts`
Audio processing utilities:
- `encode()` - Base64 encoding for audio data
- `decode()` - Base64 decoding
- `decodeAudioData()` - Convert PCM to AudioBuffer
- `createBlob()` - Convert Float32Array to Gemini Blob format

#### `types.ts`
Type definitions for:
- `Step` - Step numbers (1-5)
- `LiveStatus` - Live session states
- `BriefingData` - Topic briefing structure
- `FeedbackData` - Feedback structure
- `TranscriptItem` - Conversation transcript items

---

## Key Architectural Patterns

### 1. State Management
All state is managed in the main `App` component using React hooks:
- **Lifting state up** pattern for shared state
- **Refs** for imperative audio/session management
- **Callback functions** passed down to child components

### 2. Step-Based Flow
Five-step linear progression:
```
0 (apiKey) → 1 (briefing) → 2 (discussion) → 3 (feedback) → 4 (shadowing) → 5 (completion)
```

**State Variables**:
- `appStage`: 'apiKey' | 'checking' | 'ready' | 'running' | 'error'
- `step`: 0 | 1 | 2 | 3 | 4 | 5

### 3. Live Audio Session Management
Uses `useRef` for audio contexts and sessions to avoid re-renders:
- `sessionPromiseRef` - Holds Gemini live session promise
- `outputAudioContextRef` - For playing Alex's voice
- `inputAudioContextRef` - For capturing user microphone
- `mediaStreamRef` - User's media stream
- `scriptProcessorRef` - Audio processing node

**Important**: Must call `cleanupLiveSession()` when unmounting or changing steps!

### 4. Service Layer Abstraction
All Gemini API calls go through `geminiService.ts`:
- Centralizes API key management
- Standardizes error handling
- Provides JSON parsing utilities
- Separates concerns from UI logic

### 5. Real-time Transcription
Two parallel transcription streams:
- `liveUserTranscript` - Current user speech (transient)
- `liveAlexTranscript` - Current AI response (transient)
- `transcript` - Complete conversation history (persistent)

On turn completion, transient transcripts are moved to persistent transcript array.

---

## Development Workflows

### Initial Setup
```bash
# Install dependencies
npm install

# Set up API key
echo "GEMINI_API_KEY=your-key-here" > .env.local

# Start dev server
npm run dev
```

### Build & Deploy
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
- `GEMINI_API_KEY` - Required for all API calls
- Stored in `.env.local` (gitignored)
- Also stored in localStorage after validation

---

## Key Conventions

### TypeScript Conventions
1. **Explicit typing** for all function parameters and return types
2. **Interface over type** for object shapes (e.g., `BriefingData`, `FeedbackData`)
3. **Type over enum** for string unions (e.g., `LiveStatus`)
4. **Generic typing** for utility functions (e.g., `parseJsonResponse<T>`)

### React Conventions
1. **Functional components** with hooks (no class components)
2. **React.FC** type annotation for components
3. **useCallback** for functions passed to child components
4. **useEffect** cleanup functions for audio/session management
5. **Inline component definitions** within App.tsx (no separate files for step components)

### Styling Conventions
1. **Tailwind utility classes** for all styling
2. **Custom color palette** defined in index.html:
   - `brand-blue` (#4285F4) - Primary actions
   - `brand-green` (#34A853) - Success/positive
   - `brand-yellow` (#FBBC05) - Highlights
   - `brand-red` (#EA4335) - Errors/warnings
   - `dark-bg` (#1e1f22) - Background
   - `dark-surface` (#2b2d31) - Card backgrounds
   - `dark-text-primary` (#f2f3f5) - Primary text
   - `dark-text-secondary` (#b5bac1) - Secondary text
3. **Responsive design** with mobile-first approach (sm:, md: breakpoints)
4. **Dark mode only** (no light mode)

### Naming Conventions
1. **Components**: PascalCase (e.g., `Step1Briefing`)
2. **Hooks**: camelCase with 'handle' prefix (e.g., `handleStartNewTopic`)
3. **State**: descriptive camelCase (e.g., `liveUserTranscript`)
4. **Refs**: camelCase with 'Ref' suffix (e.g., `sessionPromiseRef`)
5. **Types**: PascalCase (e.g., `BriefingData`)

---

## Common Development Tasks

### Adding a New Step
1. Add step number to `Step` type in `types.ts`
2. Create component function in `App.tsx` (e.g., `StepXComponent`)
3. Add case in `renderContent()` switch statement
4. Update step progression logic in existing step's completion handler

### Adding a New API Service
1. Define TypeScript interface in `types.ts`
2. Add service function in `geminiService.ts`:
   ```typescript
   export const myService = async (params: any, model: string, apiKey: string): Promise<MyType> => {
     const ai = getAi(apiKey);
     const response = await ai.models.generateContent({ ... });
     return parseJsonResponse<MyType>(response.text, 'myService');
   };
   ```
3. Call from component using try-catch with loading state

### Modifying TTS Behavior
TTS is handled in two places:
1. **Step 1 briefing TTS**: `handlePlayTTS()` function with `ttsState` management
2. **Step 4 shadowing TTS**: `playShadowingSentence()` function

Both use `gemini-2.5-flash-preview-tts` model with `Zephyr` voice.

### Debugging Live Sessions
Common issues:
1. **Microphone not working**: Check `navigator.mediaDevices.getUserMedia` permissions
2. **Audio not playing**: Check AudioContext state and sample rates
3. **Transcription not appearing**: Check `onmessage` callback in live session
4. **Memory leaks**: Ensure `cleanupLiveSession()` is called properly

---

## Important Technical Notes

### Web Audio API Considerations
1. **Sample Rates**:
   - Input (microphone): 16kHz
   - Output (TTS/Live): 24kHz
   - Important for correct audio processing
2. **ScriptProcessorNode** is deprecated but still used here
   - Consider migrating to AudioWorklet in future
3. **Audio Context Lifecycle**:
   - Must be closed when not in use
   - Cannot reuse closed contexts
   - Check state before operations

### Gemini API Quirks
1. **Type Issue**: `LiveSession` type not exported from SDK
   - Workaround: Use `any` type for `sessionPromiseRef`
2. **JSON Responses**: Models may return markdown-wrapped JSON
   - Strip ```json markers in `parseJsonResponse()`
3. **Google Search Tool**: Only works with specific models
   - Used in `fetchBriefing()` for finding articles
4. **Audio Format**: Requires specific PCM format
   - Use `createBlob()` utility for correct format

### State Management Gotchas
1. **Cleanup on unmount**: Always cleanup audio/sessions
2. **Ref vs State**: Use refs for imperative APIs, state for rendering
3. **Async state updates**: Use functional updates when depending on previous state
4. **Effect dependencies**: Include all used variables in dependency arrays

### Performance Considerations
1. **Large component**: App.tsx is 802 lines - consider splitting if it grows
2. **Re-renders**: Use `useCallback` for functions passed to children
3. **Audio buffering**: Audio sources tracked in Set to prevent memory leaks
4. **Transcript growth**: Long conversations may slow down rendering

---

## Error Handling Patterns

### API Errors
```typescript
try {
  const result = await apiCall();
  // process result
} catch (e) {
  console.error(e);
  setError('User-friendly error message');
  setIsLoading(false);
}
```

### Audio Errors
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // process stream
} catch (err) {
  setError('Could not access microphone...');
  cleanupLiveSession();
}
```

### JSON Parsing Errors
Handled in `parseJsonResponse()`:
- Logs raw text on failure
- Throws descriptive error
- Caller should catch and show user message

---

## Testing Checklist

When making changes, manually test:
- [ ] API key validation (valid/invalid keys)
- [ ] Step 1: Briefing loads and TTS works
- [ ] Step 2: Microphone access, live transcription, Alex responds
- [ ] Step 3: Feedback generated from transcript
- [ ] Step 4: Shadowing sentences play and advance
- [ ] Step 5: Completion screen and restart
- [ ] Model switching (pro vs flash)
- [ ] Stop & Restart button at any step
- [ ] Browser console for errors
- [ ] Mobile responsiveness

---

## Known Issues & Limitations

1. **LiveSession Type**: SDK doesn't export type, using `any`
2. **ScriptProcessorNode**: Deprecated API, should migrate to AudioWorklet
3. **Monolithic App.tsx**: Large single file, could benefit from splitting
4. **No Tests**: No automated testing infrastructure
5. **API Key Storage**: Stored in localStorage (consider security implications)
6. **Error Recovery**: Limited retry logic for API failures
7. **Offline Support**: None - requires internet connection

---

## Future Improvement Ideas

1. **Code Organization**:
   - Split App.tsx into separate step components
   - Create custom hooks for audio/session management
   - Add context providers for global state

2. **Features**:
   - Progress tracking across sessions
   - Topic history and review
   - Difficulty level selection
   - Custom topic input
   - Export transcript feature

3. **Technical**:
   - Add automated tests (Jest, React Testing Library)
   - Migrate to AudioWorklet
   - Add proper TypeScript types for SDK
   - Implement error boundaries
   - Add logging/analytics

4. **UX**:
   - Loading skeletons instead of spinners
   - Better mobile experience
   - Keyboard shortcuts
   - Accessibility improvements (ARIA labels)

---

## AI Assistant Guidelines

When working with this codebase:

1. **Maintain Consistency**: Follow existing patterns for state management, styling, and component structure
2. **Preserve Flow**: The 5-step flow is core to the UX - don't break it
3. **Handle Cleanup**: Always cleanup audio contexts and sessions when modifying audio logic
4. **Type Safety**: Add proper TypeScript types for new functions/components
5. **Error Handling**: Wrap API calls in try-catch with user-friendly messages
6. **Responsive Design**: Test changes on mobile viewport
7. **Testing**: Manually test the full flow after changes
8. **Comments**: Add comments for complex audio/API logic
9. **Performance**: Consider re-render impact when modifying state
10. **Security**: Never commit API keys or sensitive data

### Before Committing Changes

1. Run `npm run build` to check for TypeScript errors
2. Test all 5 steps in the UI
3. Check browser console for errors/warnings
4. Verify responsive design on mobile
5. Update this CLAUDE.md if architecture changes

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build

# Debugging
# Open browser DevTools → Console for errors
# Open DevTools → Application → Local Storage to check API key
# Open DevTools → Network to check API calls
```

---

## Contact & Resources

- **AI Studio App**: https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn
- **Gemini API Docs**: https://ai.google.dev/docs
- **Gemini SDK**: https://github.com/google/genai-js
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com

---

**Last Updated**: 2025-11-17
**Version**: Initial documentation based on codebase analysis
