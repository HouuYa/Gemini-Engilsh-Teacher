# Gemini English Teacher

<div align="center">

**매일 영어 토론 선생님 - AI와 함께하는 실전 영어 학습**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini API](https://img.shields.io/badge/Gemini-API-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Custom-green.svg)](LICENSE)

[AI Studio에서 보기](https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn) • [개발자 가이드](./CLAUDE.md) • [작업 목록](./TODO.md)

**최종 업데이트**: 2025-12-03 | **버전**: 2.1

</div>

---

## 📑 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [학습 플로우](#-학습-플로우-5단계)
- [빠른 시작](#-빠른-시작)
- [사용 방법](#-사용-방법)
- [기술 스택](#-기술-스택)
- [아키텍처](#-아키텍처)
- [개발 환경](#%EF%B8%8F-개발-환경)
- [변경 이력](#-변경-이력)
- [향후 계획](#-향후-계획)
- [개발자 가이드](#-개발자-가이드)
- [기여하기](#-기여하기)
- [문의 및 지원](#-문의-및-지원)

---

## 🎯 프로젝트 개요

**Gemini English Teacher**는 Google의 최신 Gemini API를 활용한 AI 기반 영어 학습 애플리케이션입니다.
실시간 음성 대화, 즉각적인 피드백, 체계적인 쉐도잉 연습을 통해 CEFR B1-B2 레벨 학습자의 영어 토론 능력 향상을 지원합니다.

### 🎓 대상 사용자

| 레벨 | 설명 |
|------|------|
| **CEFR B1-B2** | 중급 영어 학습자 |
| **토론 학습자** | 실전 토론 능력 향상을 원하는 사용자 |
| **자기주도 학습자** | 실시간 피드백을 통한 학습을 선호하는 사용자 |

### ✨ 핵심 가치

- ✅ **실시간 대화**: Gemini Native Audio API 기반 끊김 없는 음성 대화
- ✅ **체계적 학습**: 5단계 구조화된 학습 플로우
- ✅ **맞춤형 피드백**: 문법, 어휘, 유창성에 대한 상세한 분석
- ✅ **최신 뉴스 기반**: Google Search를 활용한 실시간 토론 주제

---

## 🚀 주요 기능

### 💬 실시간 대화 기능 (2025-12-03 대폭 개선)

<table>
<tr>
<td width="50%">

#### ⚡ 성능 최적화
- **빠른 응답**: 턴 전환 **53% 개선** (1.5초 → 0.8초)
- **낮은 지연**: 오디오 버퍼 **50% 감소** (4096 → 2048)
- **실시간 VAD**: 음성 활동 감지 및 UI 표시

</td>
<td width="50%">

#### 🎙️ 자연스러운 대화
- **Interrupt 지원**: AI 말하는 중에도 끼어들기 가능
- **자동 턴 전환**: 침묵 감지 시 자동 응답
- **실시간 전사**: 대화 내용을 실시간으로 확인

</td>
</tr>
</table>

### 📚 학습 기능

| 기능 | 설명 |
|------|------|
| **최신 뉴스 브리핑** | Google Search를 활용한 실시간 뉴스 주제 |
| **종합 피드백** | 문법, 어휘, 유창성에 대한 AI 분석 |
| **쉐도잉 연습** | 교정된 문장으로 발음 및 내재화 연습 |
| **TTS 지원** | Gemini TTS로 브리핑 음성 청취 가능 |
| **대화 히스토리** | 전체 대화 내용 보관 및 복습 |

### 🎨 UX 기능

- **세션 보호**: 페이지 이탈 시 경고 (데이터 유실 방지)
- **재시작 확인**: 중요한 액션 전 확인 모달 (실수 방지)
- **Wake Lock API**: 모바일에서 화면 꺼짐 방지
- **다크 모드**: 눈의 피로를 줄이는 세련된 다크 테마
- **반응형 디자인**: 모바일/데스크톱 모두 최적화

---

## 📖 학습 플로우 (5단계)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Briefing (브리핑)                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • 최신 뉴스 기사 자동 검색                                    │
│  • 핵심 어휘 및 예문 학습                                      │
│  • TTS로 브리핑 청취                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Discussion (토론)                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • AI 파트너 Alex와 실시간 음성 대화                           │
│  • Interrupt 지원 (자연스러운 끼어들기)                        │
│  • 실시간 전사 및 음성 감지 표시                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Feedback (피드백)                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • 문법 교정 및 설명                                          │
│  • 어휘 개선 제안                                             │
│  • 유창성 분석 및 팁                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Shadowing (쉐도잉)                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • 교정된 문장 TTS 재생                                       │
│  • 따라 말하기 연습                                           │
│  • 발음 및 억양 개선                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Completion (완료)                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • 세션 완료 축하                                             │
│  • 새로운 세션 시작                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏃 빠른 시작

### 사전 요구사항

- **Node.js** v18 이상 권장
- **npm** 또는 **yarn**
- **Gemini API 키** ([발급 방법](https://aistudio.google.com/app/apikey))
- 최신 브라우저 (Chrome, Edge, Safari 권장)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/HouuYa/Gemini-Engilsh-Teacher.git
cd Gemini-Engilsh-Teacher

# 2. 의존성 설치
npm install

# 3. API 키 설정
echo "GEMINI_API_KEY=your-api-key-here" > .env.local

# 4. 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

---

## 📱 사용 방법

### 1️⃣ API 키 입력
- 첫 실행 시 Gemini API 키 입력
- 한 번 입력하면 브라우저 localStorage에 저장됨

### 2️⃣ 세션 시작
- "Start Today's Session" 버튼 클릭
- AI가 최신 뉴스 기사를 찾아 브리핑 생성

### 3️⃣ 브리핑 읽기
- 주제 요약, 핵심 인사이트, 시사점 확인
- 주요 어휘와 예문 학습
- 🔊 TTS 버튼으로 내용 청취

### 4️⃣ 토론하기
- 🎙️ 마이크 버튼을 눌러 대화 시작
- Alex의 질문에 영어로 답변
- 실시간 전사로 대화 내용 확인
- ⚠️ **중요**: 토론 중 페이지를 나가려 하면 경고가 표시됨

### 5️⃣ 피드백 받기
- ✅ 잘한 표현 확인
- 📝 문법, 어휘 교정사항 확인
- 💡 유창성 개선 제안 확인

### 6️⃣ 쉐도잉 연습
- 🎧 교정된 문장 청취
- 🗣️ 따라 말하기
- ➡️ 다음 문장으로 진행

### 💡 유용한 팁

| 팁 | 설명 |
|-----|------|
| **Stop & Restart 버튼** | 세션 중단 전 확인 모달 표시 |
| **모바일 사용** | 토론 중 화면이 자동으로 켜진 상태 유지 (Wake Lock) |
| **비활성 감지** | 2분간 음성이 감지되지 않으면 경고 표시 |
| **모델 선택** | 우측 상단에서 Flash(빠름) 또는 Pro(고품질) 선택 가능 |

---

## 🛠️ 기술 스택

### Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19.2.0 | UI 프레임워크 (함수형 컴포넌트 + Hooks) |
| **TypeScript** | 5.8.2 | 타입 안전성 및 개발자 경험 향상 |
| **Vite** | 6.2.0 | 빠른 빌드 도구 및 개발 서버 |
| **Tailwind CSS** | CDN | 유틸리티 우선 스타일링 |

### AI & APIs

| 기술 | 설명 |
|------|------|
| **@google/genai** | Gemini API SDK (v1.29.1) |
| **Gemini 2.5 Pro** | 고품질 콘텐츠 생성 |
| **Gemini 2.5 Flash** | 빠른 응답 (기본 모델) |
| **Gemini Native Audio** | 실시간 음성 세션 API |
| **Gemini TTS** | 텍스트 음성 변환 |
| **Google Search Tool** | 최신 뉴스 검색 |

### Audio Processing

- **Web Audio API**: 마이크 입력 및 오디오 재생
- **ScriptProcessorNode**: 실시간 오디오 처리 (향후 AudioWorklet 마이그레이션 예정)
- **AnalyserNode**: 음성 활동 감지 (VAD)

### Browser APIs

- **getUserMedia**: 마이크 접근
- **Wake Lock API**: 화면 꺼짐 방지
- **beforeunload Event**: 페이지 이탈 경고
- **localStorage**: API 키 및 설정 저장

---

## 🏗️ 아키텍처

### 프로젝트 구조

```
Gemini-Engilsh-Teacher/
├── 📄 App.tsx                   # 메인 애플리케이션 컴포넌트 (802줄)
├── 📄 index.tsx                 # React 진입점
├── 📄 index.html                # HTML 템플릿 (Tailwind 설정)
├── 📄 types.ts                  # TypeScript 타입 정의
├── 📄 vite.config.ts            # Vite 빌드 설정
├── 📄 tsconfig.json             # TypeScript 컴파일러 설정
├── 📄 package.json              # 의존성 및 스크립트
├── 📄 .env.local                # 환경 변수 (API 키, gitignore됨)
├── 📄 README.md                 # 프로젝트 문서 (현재 파일)
├── 📄 CLAUDE.md                 # 상세 개발자 가이드 (아키텍처, 컨벤션)
├── 📄 TODO.md                   # 작업 목록 및 향후 계획
│
├── 📁 components/
│   ├── Icons.tsx                # SVG 아이콘 컴포넌트들
│   └── Loader.tsx               # 로딩 스피너 컴포넌트
│
├── 📁 services/
│   ├── geminiService.ts         # Gemini API 통합 레이어
│   └── ttsCache.ts              # TTS 캐싱 시스템
│
└── 📁 utils/
    ├── audio.ts                 # 오디오 인코딩/디코딩
    ├── apiHelpers.ts            # API 헬퍼 함수
    └── wakeLock.ts              # 화면 꺼짐 방지
```

### 시스템 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                          │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐     │
│  │              React App (App.tsx)                   │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │  상태 관리 (React Hooks)                     │ │     │
│  │  │  • useState, useRef, useEffect, useCallback  │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │  UI 컴포넌트 (5단계 플로우)                  │ │     │
│  │  │  Step1~5 + ApiKeyScreen + StartScreen       │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────┴───────────────────────────┐     │
│  │          서비스 레이어 (services/)                 │     │
│  │  • geminiService.ts - API 호출 추상화             │     │
│  │  • ttsCache.ts - TTS 결과 캐싱                    │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────┴───────────────────────────┐     │
│  │        유틸리티 레이어 (utils/)                    │     │
│  │  • audio.ts - 오디오 인코딩/디코딩                 │     │
│  │  • apiHelpers.ts - API 헬퍼                       │     │
│  │  • wakeLock.ts - Wake Lock 관리                   │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────┴───────────────────────────┐     │
│  │      브라우저 APIs (Web Audio, Wake Lock)         │     │
│  │  • AudioContext (16kHz/24kHz)                     │     │
│  │  • MediaStream (getUserMedia)                     │     │
│  │  • AnalyserNode (VAD)                             │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓ HTTPS
┌──────────────────────────────────────────────────────────────┐
│                    Google Gemini API                         │
├──────────────────────────────────────────────────────────────┤
│  • Gemini 2.5 Flash/Pro (텍스트 생성)                         │
│  • Gemini Native Audio (실시간 음성 세션)                     │
│  • Gemini TTS (음성 합성)                                     │
│  • Google Search Tool (뉴스 검색)                             │
└──────────────────────────────────────────────────────────────┘
```

### 실시간 오디오 처리 흐름

```
[사용자 마이크]
      ↓
[getUserMedia] → MediaStream 획득
      ↓
[AudioContext (16kHz)] → ScriptProcessorNode (2048 버퍼)
      ↓                       ↓
      ↓                  [AnalyserNode]
      ↓                       ↓
      ↓              VAD (음성 활동 감지)
      ↓                       ↓
      ↓              Interrupt 감지 → AI 오디오 중단
      ↓
[PCM 인코딩] → Base64
      ↓
[Gemini Live API]
      ↓
┌─────┴─────┐
│           │
↓           ↓
[서버 측 VAD]  [AI 응답 생성]
침묵 감지      텍스트 + 오디오
(800ms)
↓           ↓
턴 전환     Base64 Audio
↓           ↓
전사 업데이트  [AudioContext (24kHz)]
              ↓
          [스피커 출력]
```

### 상태 관리 패턴

- **상태 끌어올리기**: 모든 상태를 `App.tsx`에서 관리
- **Refs 활용**: 재렌더링 방지가 필요한 객체 (AudioContext, LiveSession)
- **함수형 업데이트**: 비동기 상태 업데이트 시 이전 상태 참조
- **Cleanup 패턴**: useEffect cleanup으로 메모리 누수 방지

---

## 🖥️ 개발 환경

### 개발 도구

| 도구 | 버전 | 설명 |
|------|------|------|
| **Node.js** | v18+ | JavaScript 런타임 |
| **npm** | v9+ | 패키지 매니저 |
| **VSCode** | - | 권장 에디터 (TypeScript 지원) |
| **Git** | - | 버전 관리 |

### 환경 변수

`.env.local` 파일 설정:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

⚠️ **보안 주의사항**:
- `.env.local` 파일은 절대 커밋하지 마세요 (.gitignore에 포함됨)
- API 키를 공개 저장소에 올리지 마세요
- 프로덕션에서는 서버사이드에서 API 키 관리 권장

### 개발 명령어

```bash
# 개발 서버 시작 (포트 3000, HMR 지원)
npm run dev

# TypeScript 타입 체크
npm run build  # 빌드 시 자동 체크

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기 (포트 4173)
npm run preview
```

### 디버깅 팁

| 문제 | 해결 방법 |
|------|----------|
| **마이크 작동 안 함** | 브라우저 권한 설정 확인 (chrome://settings/content/microphone) |
| **오디오 재생 안 됨** | AudioContext 상태 확인 (DevTools Console) |
| **API 에러** | Network 탭에서 요청/응답 확인 |
| **메모리 누수** | React DevTools Profiler로 리렌더링 확인 |

### 브라우저 호환성

| 브라우저 | 지원 | 노트 |
|---------|------|------|
| Chrome | ✅ | 권장 (Web Audio API 최적화) |
| Edge | ✅ | Chromium 기반 |
| Safari | ✅ | iOS/macOS 지원 (일부 제한) |
| Firefox | ⚠️ | 일부 Web Audio 기능 제한 가능 |

---

## 📜 변경 이력

### v2.1 (2025-12-03) - 실시간 대화 대폭 개선

#### 🎙️ 실시간 대화 3종 개선 세트

<table>
<tr>
<th>개선 사항</th>
<th>이전</th>
<th>개선 후</th>
<th>효과</th>
</tr>
<tr>
<td><b>⚡ 응답 지연 최적화</b></td>
<td>
• 버퍼: 4096<br>
• 침묵 감지: 1500ms<br>
• 턴 전환: ~2초
</td>
<td>
• 버퍼: 2048 ✨<br>
• 침묵 감지: 800ms ✨<br>
• 턴 전환: ~1초 ✨
</td>
<td>
🚀 <b>53% 빨라짐</b><br>
🎯 더 자연스러운 대화
</td>
</tr>
<tr>
<td><b>🎯 Interrupt 기능</b></td>
<td>
AI 말하는 동안<br>
대기해야 함
</td>
<td>
사용자 음성 감지 시<br>
AI 오디오 자동 중단 ✨
</td>
<td>
💬 실제 대화처럼<br>
자연스러운 턴테이킹
</td>
</tr>
<tr>
<td><b>👀 VAD UI 표시</b></td>
<td>
음성 감지 상태<br>
알 수 없음
</td>
<td>
"음성 감지 중..." ✨<br>
실시간 표시
</td>
<td>
📊 즉각적인<br>
사용자 피드백
</td>
</tr>
</table>

#### 🛡️ UX 개선

- **페이지 이탈 경고**: 학습 진행 중 페이지를 나가려 할 때 경고 표시 (데이터 유실 방지)
- **재시작 확인 모달**: "Stop & Restart" 버튼 클릭 시 확인 모달 표시 (실수 방지)
- **Wake Lock API**: 모바일에서 토론 중 화면 자동 꺼짐 방지
- **비활성 감지**: 2분간 음성이 감지되지 않으면 경고 표시

#### 🐛 버그 수정

- **TTS AudioContext 버그 수정**: Step 1 Briefing TTS에서 AudioContext suspended 상태 처리 추가 (iOS/브라우저 제한 대응)

#### 📝 문서화

- **TODO.md 추가**: 프로젝트 작업 목록 및 향후 계획 문서화
- **CLAUDE.md 업데이트**: 실시간 대화 개선 사항 상세 문서화

### v2.0 (2025-11-17) - 문서화 및 안정성 개선

- **CLAUDE.md 추가**: 상세한 개발자 가이드 및 아키텍처 문서
- **코드 구조 개선**: 서비스 레이어 분리 (geminiService.ts)
- **타입 안전성 강화**: types.ts로 타입 정의 분리

### v1.0 (초기 버전) - 기본 기능 구현

- **5단계 학습 플로우**: Briefing → Discussion → Feedback → Shadowing → Completion
- **Gemini Native Audio API**: 실시간 음성 대화 구현
- **Google Search 통합**: 최신 뉴스 기사 자동 검색
- **TTS 기능**: 브리핑 및 쉐도잉에 음성 합성 적용
- **다크 모드 UI**: Tailwind CSS 기반 세련된 디자인

---

## 🗺️ 향후 계획

상세한 로드맵은 [TODO.md](./TODO.md) 참고

### 🎯 단기 목표 (1-2주)

- [ ] **Gemini Pro TTS 적용**: 브리핑 및 쉐도잉에 고품질 TTS 사용
- [ ] **localStorage 세션 저장**: 새로고침 시 세션 복구 기능
- [ ] **로딩 스켈레톤 UI**: 스피너 대신 콘텐츠 구조 미리 표시
- [ ] **에러 바운더리**: 예상치 못한 에러 처리 및 복구

### 🚀 중기 목표 (1개월)

- [ ] **Supabase 통합**
  - 학습 세션 기록 저장
  - 사용자 진도 추적 대시보드
  - Edge Function으로 API 키 보안 강화
- [ ] **n8n 자동화 워크플로우**
  - 일일 학습 알림 (이메일/푸시)
  - 주간 리포트 자동 생성
  - 멀티 소스 뉴스 큐레이션

### 🌟 장기 목표 (2-3개월)

- [ ] **코드 리팩토링**
  - App.tsx 분할 (컴포넌트 파일 분리)
  - 커스텀 Hooks 추가 (`useAudioSession`, `useLiveSession`)
  - ScriptProcessorNode → AudioWorklet 마이그레이션
- [ ] **기능 확장**
  - 난이도 레벨 선택 (A2, B1, B2, C1)
  - 커스텀 주제 입력 기능
  - 음성 인식 정확도 평가 및 발음 피드백
  - 학습 통계 및 진척도 시각화

---

## 👨‍💻 개발자 가이드

### 📚 문서

| 문서 | 내용 |
|------|------|
| **[CLAUDE.md](./CLAUDE.md)** | 상세 개발자 가이드 (아키텍처, 컨벤션, 베스트 프랙티스) |
| **[TODO.md](./TODO.md)** | 작업 목록 및 향후 계획 |
| **[README.md](./README.md)** | 프로젝트 개요 및 사용 방법 (현재 문서) |

### 🎨 코딩 컨벤션

#### TypeScript
```typescript
// ✅ Good - 명시적 타이핑
export const parseJsonResponse = <T,>(text: string, typeName: string): T => {
  // ...
};

// ✅ Good - Interface for objects
export interface BriefingData {
  topic: string;
  article: { ... };
}

// ✅ Good - Type for unions
export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'speaking';
```

#### React
```typescript
// ✅ Good - 함수형 컴포넌트
const Step1Briefing: React.FC<{
  data: BriefingData;
  onStart: () => void;
}> = ({ data, onStart }) => {
  // ...
};

// ✅ Good - useCallback for callbacks
const handleStart = useCallback(() => {
  // ...
}, [dependencies]);
```

#### 네이밍

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 | PascalCase | `Step1Briefing`, `ModelSelector` |
| 핸들러 | handle + PascalCase | `handleStartNewTopic` |
| 상태 | camelCase | `liveUserTranscript` |
| Refs | camelCase + Ref | `sessionPromiseRef` |
| 타입/인터페이스 | PascalCase | `BriefingData`, `LiveStatus` |

### 🧪 테스트 체크리스트

변경 사항 적용 후 수동 테스트:

- [ ] **API 키 검증**: 유효/무효 키 모두 테스트
- [ ] **단계 1**: 브리핑 로드 및 TTS 작동
- [ ] **단계 2**: 마이크 접근, 라이브 전사, Alex 응답, Interrupt 기능
- [ ] **단계 3**: 전사로부터 피드백 생성
- [ ] **단계 4**: 쉐도잉 문장 재생 및 진행
- [ ] **단계 5**: 완료 화면 및 재시작
- [ ] **모델 전환**: Flash ↔ Pro
- [ ] **Stop & Restart**: 모든 단계에서 확인 모달 표시
- [ ] **페이지 이탈 경고**: 학습 중 경고 표시
- [ ] **모바일**: 반응형 디자인 및 Wake Lock 작동
- [ ] **브라우저 콘솔**: 에러 없음

### 🐛 알려진 이슈

| 이슈 | 설명 | 해결 계획 |
|------|------|----------|
| **LiveSession 타입** | SDK가 타입 export 안 함 | `any` 사용 중 |
| **ScriptProcessorNode** | Deprecated API | AudioWorklet 마이그레이션 예정 |
| **모바일 최적화** | 일부 브라우저 마이크 권한 이슈 | 브라우저별 대응 추가 예정 |
| **API 키 저장** | localStorage 사용 | 향후 서버사이드 보안 강화 |

### ✅ 기여 전 확인사항

1. **빌드 성공**: `npm run build` 에러 없음
2. **타입 체크**: TypeScript 에러 없음
3. **전체 플로우 테스트**: 5단계 모두 정상 작동
4. **모바일 반응형**: 최소 1개 모바일 기기에서 테스트
5. **문서 업데이트**:
   - 아키텍처 변경 시 `CLAUDE.md` 업데이트
   - 새 기능 추가 시 `README.md` 업데이트
   - 작업 목록 변경 시 `TODO.md` 업데이트

---

## 🤝 기여하기

이 프로젝트에 기여하고 싶다면:

### 기여 방법

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### 기여 가이드라인

- [ ] **코딩 컨벤션** 준수 (위 개발자 가이드 참고)
- [ ] **TypeScript** 명시적 타이핑
- [ ] **테스트** 체크리스트 완료
- [ ] **문서** 업데이트 (해당 시)
- [ ] **커밋 메시지** 명확하게 작성
  - 예: `feat: Add custom topic input feature`
  - 예: `fix: Resolve TTS AudioContext bug on iOS`
  - 예: `docs: Update architecture diagram in CLAUDE.md`

### 버그 리포트

이슈 제보 시 다음 정보 포함:

- 브라우저 및 버전
- 운영체제
- 재현 방법
- 예상 동작 vs 실제 동작
- 스크린샷 (해당 시)

---

## 📞 문의 및 지원

### 리소스

- **이슈 제보**: [GitHub Issues](https://github.com/HouuYa/Gemini-Engilsh-Teacher/issues)
- **AI Studio 원본 앱**: [보러 가기](https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn)
- **Gemini API 문서**: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- **React 문서**: [https://react.dev](https://react.dev)
- **Tailwind 문서**: [https://tailwindcss.com](https://tailwindcss.com)

### 커뮤니티

- **Discussions**: GitHub Discussions에서 질문하기
- **Pull Requests**: 기능 제안 및 개선 사항 제출

---

## 📄 라이선스

이 프로젝트는 **Google AI Studio** 앱에서 생성되었으며,
**Claude Code**를 통해 지속적으로 개선되고 있습니다.

---

## 🙏 감사의 말

이 프로젝트는 다음 훌륭한 기술들 덕분에 가능했습니다:

<table>
<tr>
<td align="center" width="25%">
<img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="60"><br>
<b>Google Gemini Team</b><br>
강력한 AI API
</td>
<td align="center" width="25%">
<img src="https://react.dev/favicon.ico" width="60"><br>
<b>React Team</b><br>
최고의 UI 프레임워크
</td>
<td align="center" width="25%">
<img src="https://vitejs.dev/logo.svg" width="60"><br>
<b>Vite Team</b><br>
빠른 빌드 도구
</td>
<td align="center" width="25%">
<img src="https://tailwindcss.com/favicons/favicon-32x32.png" width="60"><br>
<b>Tailwind CSS Team</b><br>
생산적인 스타일링
</td>
</tr>
</table>

---

<div align="center">

### 만든이

**Google AI Studio** + **Custom Development** + **Claude Code**

### 버전

**v2.1** - 최종 업데이트: 2025-12-03

---

[![⭐ Star on GitHub](https://img.shields.io/github/stars/HouuYa/Gemini-Engilsh-Teacher?style=social)](https://github.com/HouuYa/Gemini-Engilsh-Teacher)
[![🍴 Fork on GitHub](https://img.shields.io/github/forks/HouuYa/Gemini-Engilsh-Teacher?style=social)](https://github.com/HouuYa/Gemini-Engilsh-Teacher/fork)

**Made with ❤️ for English Learners**

</div>
