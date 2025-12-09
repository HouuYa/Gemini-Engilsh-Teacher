# Gemini English Teacher

<div align="center">

**AI와 함께하는 실전 영어 토론 학습**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini API](https://img.shields.io/badge/Gemini-API-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

[AI Studio 원본](https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn) • [개발자 가이드](./CLAUDE.md) • [작업 목록](./TODO.md)

</div>

---

## Overview

Google Gemini API를 활용한 AI 기반 영어 학습 애플리케이션입니다. 실시간 음성 대화, 즉각적인 피드백, 체계적인 학습 플로우를 통해 CEFR B1-B2 레벨 학습자의 영어 토론 능력 향상을 지원합니다.

**Target Users**: 중급 영어 학습자 (CEFR B1-B2), 토론 능력 향상, 자기주도 학습

---

## Features

### Real-time Conversation (2025-12-03 Major Update)

| Feature | Improvement | Impact |
|---------|-------------|--------|
| **Response Latency** | Buffer 4096 → 2048, Silence 1500ms → 800ms | 53% faster turn-taking |
| **Interrupt Support** | User voice detection stops AI audio | Natural conversation flow |
| **VAD Display** | Real-time "Voice Detected" UI indicator | Immediate user feedback |

### Learning Flow (5 Steps)

1. **Briefing** - Latest news article + key vocabulary
2. **Discussion** - Real-time voice conversation with AI partner Alex
3. **Feedback** - Grammar, vocabulary, fluency analysis
4. **Shadowing** - Repeat corrected sentences
5. **Completion** - Session wrap-up

### Additional Features

- Google Search integration for current news topics
- Text-to-Speech for briefing and shadowing
- Session protection (beforeunload warning)
- Wake Lock API for mobile screens
- Dark mode UI

---

## Quick Start

### Prerequisites

- Node.js v18+
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone repository
git clone https://github.com/HouuYa/Gemini-Engilsh-Teacher.git
cd Gemini-Engilsh-Teacher

# Install dependencies
npm install

# Configure API key
echo "GEMINI_API_KEY=your-api-key-here" > .env.local

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build

```bash
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Tech Stack

### Frontend
- **React** 19.2.0 - UI framework
- **TypeScript** 5.8.2 - Type safety
- **Vite** 6.2.0 - Build tool
- **Tailwind CSS** - Styling

### AI & APIs
- **@google/genai** 1.29.1 - Gemini SDK
- **Gemini 2.5 Flash/Pro** - Content generation
- **Gemini Native Audio** - Real-time voice session
- **Gemini TTS** - Text-to-speech
- **Google Search Tool** - News search

### Audio Processing
- **Web Audio API** - Microphone input and audio playback
- **ScriptProcessorNode** - Real-time audio processing (2048 buffer)
- **AnalyserNode** - Voice Activity Detection (VAD)

---

## Architecture

### Project Structure

```
Gemini-Engilsh-Teacher/
├── App.tsx                   # Main application (802 lines)
├── index.tsx                 # React entry point
├── types.ts                  # TypeScript definitions
├── components/
│   ├── Icons.tsx            # SVG icons
│   └── Loader.tsx           # Loading spinner
├── services/
│   ├── geminiService.ts     # Gemini API layer
│   └── ttsCache.ts          # TTS caching
└── utils/
    ├── audio.ts             # Audio encoding/decoding
    ├── apiHelpers.ts        # API helpers
    └── wakeLock.ts          # Screen wake lock
```

### Audio Processing Flow

```
[Microphone] → getUserMedia → AudioContext (16kHz)
    ↓
ScriptProcessorNode (2048) + AnalyserNode (VAD)
    ↓                              ↓
PCM Encoding → Gemini Live API     Interrupt Detection
    ↓                              ↓
Server VAD (800ms) → Transcription Stop AI Audio
    ↓
Base64 Audio → AudioContext (24kHz) → Speaker
```

---

## Changelog

### v2.1 (2025-12-03)

**Real-time Conversation Improvements**
- Response latency: 53% faster (buffer 4096→2048, silence 1500ms→800ms)
- Interrupt support: AI audio stops when user speaks
- VAD UI indicator: Real-time voice detection display

**UX Enhancements**
- Page leave warning (data loss prevention)
- Restart confirmation modal
- Wake Lock API for mobile
- Inactivity detection (2-minute warning)

**Bug Fixes**
- TTS AudioContext suspended state handling (iOS compatibility)

### v2.0 (2025-11-17)
- CLAUDE.md developer guide
- Service layer separation (geminiService.ts)
- TypeScript type definitions (types.ts)

### v1.0 (Initial Release)
- 5-step learning flow
- Gemini Native Audio API integration
- Google Search integration
- TTS functionality
- Dark mode UI

---

## Development

### Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Detailed developer guide (architecture, conventions, patterns) |
| [TODO.md](./TODO.md) | Roadmap and task list |
| [README.md](./README.md) | Project overview (this file) |

### Coding Conventions

**TypeScript**
```typescript
// Explicit typing for all functions
export const parseJsonResponse = <T,>(text: string): T => { /* ... */ };

// Interface for objects, Type for unions
export interface BriefingData { topic: string; }
export type LiveStatus = 'idle' | 'connecting' | 'listening';
```

**React**
```typescript
// Functional components with React.FC
const Step1Briefing: React.FC<{ data: BriefingData; onStart: () => void }> =
  ({ data, onStart }) => { /* ... */ };

// useCallback for passed callbacks
const handleStart = useCallback(() => { /* ... */ }, [deps]);
```

**Naming**
- Components: `PascalCase` (Step1Briefing, ModelSelector)
- Handlers: `handlePascalCase` (handleStartNewTopic)
- State: `camelCase` (liveUserTranscript)
- Refs: `camelCaseRef` (sessionPromiseRef)

### Testing Checklist

Before deployment:
- [ ] All 5 steps functional
- [ ] API key validation works
- [ ] Interrupt feature works
- [ ] TTS playback works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)

### Known Issues

| Issue | Status | Solution |
|-------|--------|----------|
| LiveSession type not exported | Using `any` | Awaiting SDK update |
| ScriptProcessorNode deprecated | In use | Migrate to AudioWorklet |
| API key in localStorage | Current | Move to server-side |

---

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Guidelines**
- Follow TypeScript and React conventions above
- Complete testing checklist
- Update documentation for architecture changes
- Use clear commit messages (e.g., `feat:`, `fix:`, `docs:`)

---

## Roadmap

See [TODO.md](./TODO.md) for detailed roadmap.

**Short-term (1-2 weeks)**
- Gemini Pro TTS integration
- localStorage session recovery
- Loading skeleton UI
- Error boundary implementation

**Mid-term (1 month)**
- Supabase integration (session history, progress tracking)
- n8n automation workflows (daily reminders, weekly reports)

**Long-term (2-3 months)**
- App.tsx refactoring (component separation)
- Custom hooks (useAudioSession, useLiveSession)
- AudioWorklet migration
- Difficulty level selection (A2, B1, B2, C1)
- Pronunciation feedback

---

## License

Originally created by **Google AI Studio**, enhanced with **Claude Code**.

**Version**: v2.1 | **Last Updated**: 2025-12-03

---

## Resources

- **Issues**: [GitHub Issues](https://github.com/HouuYa/Gemini-Engilsh-Teacher/issues)
- **AI Studio**: [Original App](https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn)
- **Gemini API Docs**: [https://ai.google.dev/docs](https://ai.google.dev/docs)

---

<div align="center">

[![Star on GitHub](https://img.shields.io/github/stars/HouuYa/Gemini-Engilsh-Teacher?style=social)](https://github.com/HouuYa/Gemini-Engilsh-Teacher)

Made with ❤️ for English Learners

</div>
