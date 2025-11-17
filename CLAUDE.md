# CLAUDE.md - AI Assistant Guide for Gemini English Teacher

## 📋 프로젝트 개요

**Gemini English Teacher** (매일 영어 토론 선생님)는 Google Gemini API를 활용한 AI 기반 영어 학습 애플리케이션입니다.

### 핵심 기능
- 🎤 **실시간 음성 대화** - AI 토론 파트너 Alex와 자연스러운 대화
- 📚 **5단계 학습 플로우** - Briefing → Discussion → Feedback → Shadowing → Completion
- ✅ **종합 피드백** - 문법, 어휘, 유창성에 대한 상세한 분석
- 🗣️ **쉐도잉 연습** - 발음과 내재화를 위한 반복 학습
- 🔊 **TTS 기능** - 텍스트 읽기 기능 제공
- 🎯 **멀티모달 AI** - Gemini의 네이티브 오디오 및 라이브 세션 API 활용

### 대상 사용자
- **CEFR B1-B2 레벨** 영어 학습자 (중급)
- 토론 능력 향상을 원하는 학습자
- 실시간 피드백을 통한 학습을 선호하는 사용자

### 원본 플랫폼
- Google AI Studio 앱: https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn

---

## 🛠️ 기술 스택

### 핵심 기술
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.0 | UI 프레임워크 (함수형 컴포넌트 + Hooks) |
| TypeScript | 5.8.2 | 타입 안전성 및 개발자 경험 향상 |
| Vite | 6.2.0 | 빌드 도구 및 개발 서버 |
| Tailwind CSS | CDN | 유틸리티 우선 스타일링 |
| @google/genai | 1.29.1 | Google Gemini API SDK |

### 빌드 및 개발 환경
- **모듈 시스템**: ESNext modules
- **JSX 변환**: react-jsx (자동 런타임)
- **TypeScript 설정**: Bundler 해상도, 경로 별칭 (`@/*`)
- **개발 서버**: 포트 3000, 호스트 0.0.0.0

### 사용 중인 Gemini API
1. **Gemini 2.5 Pro/Flash** - 일반 콘텐츠 생성
2. **Gemini 2.5 Flash Native Audio Preview** - 라이브 음성 세션
3. **Gemini 2.5 Flash Preview TTS** - 텍스트 음성 변환
4. **Google Search Tool** - 최신 뉴스 기사 검색

---

## 📁 코드베이스 구조

```
/
├── App.tsx                 # 메인 애플리케이션 컴포넌트 및 상태 관리
├── index.tsx              # React 진입점
├── index.html             # HTML 템플릿 (Tailwind 설정 포함)
├── types.ts               # TypeScript 타입 정의
├── vite.config.ts         # Vite 설정
├── tsconfig.json          # TypeScript 설정
├── package.json           # 의존성 및 스크립트
├── .env.local             # 환경 변수 (GEMINI_API_KEY)
├── .gitignore             # Git 무시 파일 목록
│
├── components/
│   ├── Icons.tsx          # SVG 아이콘 컴포넌트들
│   └── Loader.tsx         # 로딩 스피너 컴포넌트
│
├── services/
│   └── geminiService.ts   # Gemini API 통합 레이어
│
└── utils/
    └── audio.ts           # 오디오 인코딩/디코딩 유틸리티
```

### 파일별 상세 설명

#### 📄 `App.tsx` (802줄)
애플리케이션의 핵심 컴포넌트:

**담당 역할**:
- ✨ **상태 관리**: React Hooks를 사용한 모든 애플리케이션 상태
- 🔄 **비즈니스 로직**: 단계 진행, 세션 관리, API 오케스트레이션
- 🎨 **UI 컴포넌트**: 모든 5단계에 대한 인라인 컴포넌트 정의
- 🎵 **오디오 관리**: 입출력을 위한 Web Audio API 통합
- 🎙️ **라이브 세션**: 마이크 접근, 실시간 전사, 오디오 재생

**정의된 주요 컴포넌트**:
```typescript
- ModelSelector      // 모델 선택 드롭다운
- ApiKeyScreen       // API 키 입력 폼
- StartScreen        // 환영 화면
- Step1Briefing      // 주제 브리핑 표시
- Step2Discussion    // 라이브 대화 인터페이스
- Step3Feedback      // 피드백 표시
- Step4Shadowing     // 쉐도잉 연습
- Step5Completion    // 세션 완료 화면
```

#### 📄 `services/geminiService.ts`
중앙 집중식 API 서비스 레이어:

```typescript
checkApiStatus()          // API 키 검증
fetchBriefing()          // 새 주제 브리핑 생성
getFeedback()            // 대화 전사 분석
getShadowingSentences()  // 연습용 문장 추출
parseJsonResponse()      // JSON 파싱 및 에러 처리
```

#### 📄 `utils/audio.ts`
오디오 처리 유틸리티:

```typescript
encode()           // 오디오 데이터 Base64 인코딩
decode()           // Base64 디코딩
decodeAudioData()  // PCM을 AudioBuffer로 변환
createBlob()       // Float32Array를 Gemini Blob 형식으로 변환
```

#### 📄 `types.ts`
TypeScript 타입 정의:

```typescript
Step            // 단계 번호 (1-5)
LiveStatus      // 라이브 세션 상태
BriefingData    // 주제 브리핑 구조
FeedbackData    // 피드백 구조
TranscriptItem  // 대화 전사 항목
```

---

## 🏗️ 핵심 아키텍처 패턴

### 1. 상태 관리
메인 `App` 컴포넌트에서 React Hooks로 모든 상태 관리:

- **상태 끌어올리기** 패턴으로 공유 상태 관리
- **Refs** 사용으로 재렌더링 방지 (오디오/세션 관리)
- **콜백 함수**를 자식 컴포넌트로 전달

**주요 상태 변수**:
```typescript
// 앱 단계
const [appStage, setAppStage] = useState<AppStage>('apiKey');
const [step, setStep] = useState<Step | 0>(0);

// 데이터 상태
const [briefing, setBriefing] = useState<BriefingData | null>(null);
const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
const [feedback, setFeedback] = useState<FeedbackData | null>(null);

// 오디오 세션 관리 (Refs)
const sessionPromiseRef = useRef<Promise<any> | null>(null);
const outputAudioContextRef = useRef<AudioContext | null>(null);
const inputAudioContextRef = useRef<AudioContext | null>(null);
```

### 2. 단계 기반 플로우
5단계 선형 진행:

```
단계 0 (API 키)
  ↓
단계 1 (브리핑) → 주제 및 어휘 학습
  ↓
단계 2 (토론) → Alex와 실시간 대화
  ↓
단계 3 (피드백) → 문법, 어휘, 유창성 분석
  ↓
단계 4 (쉐도잉) → 교정된 문장 연습
  ↓
단계 5 (완료) → 세션 종료 및 재시작
```

**상태 변수 흐름**:
```typescript
appStage: 'apiKey' → 'checking' → 'ready' → 'running' → 'error'
step: 0 → 1 → 2 → 3 → 4 → 5
```

### 3. 라이브 오디오 세션 관리
재렌더링을 피하기 위해 `useRef` 사용:

```typescript
sessionPromiseRef      // Gemini 라이브 세션 Promise
outputAudioContextRef  // Alex 음성 재생용
inputAudioContextRef   // 사용자 마이크 캡처용
mediaStreamRef         // 사용자 미디어 스트림
scriptProcessorRef     // 오디오 처리 노드
```

⚠️ **중요**: 언마운트 또는 단계 변경 시 반드시 `cleanupLiveSession()` 호출!

### 4. 서비스 레이어 추상화
모든 Gemini API 호출은 `geminiService.ts`를 통해 처리:

- ✅ API 키 관리 중앙화
- ✅ 표준화된 에러 처리
- ✅ JSON 파싱 유틸리티 제공
- ✅ UI 로직과 관심사 분리

### 5. 실시간 전사(Transcription)
두 개의 병렬 전사 스트림:

```typescript
liveUserTranscript  // 현재 사용자 발화 (임시)
liveAlexTranscript  // 현재 AI 응답 (임시)
transcript          // 전체 대화 히스토리 (영구)
```

턴 완료 시 임시 전사를 영구 전사 배열로 이동.

---

## 🚀 개발 워크플로우

### 초기 설정
```bash
# 의존성 설치
npm install

# API 키 설정
echo "GEMINI_API_KEY=your-api-key-here" > .env.local

# 개발 서버 시작
npm run dev
```

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview
```

### 환경 변수
- `GEMINI_API_KEY` - 모든 API 호출에 필수
- `.env.local`에 저장 (gitignore됨)
- 검증 후 localStorage에도 저장됨

---

## 📐 코딩 컨벤션

### TypeScript 컨벤션
1. ✅ **명시적 타이핑** - 모든 함수 매개변수 및 반환 타입
2. ✅ **Interface over Type** - 객체 구조에는 interface 사용
3. ✅ **Type over Enum** - 문자열 유니온에는 type 사용
4. ✅ **제네릭 타이핑** - 유틸리티 함수에 제네릭 활용

**예시**:
```typescript
// Good
export const parseJsonResponse = <T,>(text: string, typeName: string): T => {
  // ...
};

// Good
export interface BriefingData {
  topic: string;
  article: { ... };
}

// Good
export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'speaking';
```

### React 컨벤션
1. ✅ **함수형 컴포넌트** - 클래스 컴포넌트 사용 안 함
2. ✅ **React.FC** 타입 어노테이션
3. ✅ **useCallback** - 자식에게 전달되는 함수
4. ✅ **useEffect 정리** - 오디오/세션 관리 시 cleanup
5. ✅ **인라인 컴포넌트** - App.tsx 내부에 정의

**예시**:
```typescript
const Step1Briefing: React.FC<{
  data: BriefingData;
  onStart: () => void;
}> = ({ data, onStart }) => {
  // 컴포넌트 로직
};
```

### 스타일링 컨벤션
1. ✅ **Tailwind 유틸리티 클래스** 모든 스타일링에 사용
2. ✅ **커스텀 컬러 팔레트** (index.html에 정의):
   ```javascript
   'brand-blue': '#4285F4',      // 주요 액션
   'brand-green': '#34A853',     // 성공/긍정
   'brand-yellow': '#FBBC05',    // 강조
   'brand-red': '#EA4335',       // 에러/경고
   'dark-bg': '#1e1f22',         // 배경
   'dark-surface': '#2b2d31',    // 카드 배경
   'dark-text-primary': '#f2f3f5',   // 주요 텍스트
   'dark-text-secondary': '#b5bac1', // 보조 텍스트
   ```
3. ✅ **반응형 디자인** - 모바일 우선 접근 (sm:, md: breakpoints)
4. ✅ **다크 모드 전용** - 라이트 모드 없음

### 네이밍 컨벤션
| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 | PascalCase | `Step1Briefing`, `ModelSelector` |
| 핸들러 | camelCase + handle 접두사 | `handleStartNewTopic` |
| 상태 | descriptive camelCase | `liveUserTranscript` |
| Refs | camelCase + Ref 접미사 | `sessionPromiseRef` |
| 타입 | PascalCase | `BriefingData`, `LiveStatus` |

---

## 🔧 일반적인 개발 작업

### 새로운 단계 추가하기
1. `types.ts`의 `Step` 타입에 단계 번호 추가
2. `App.tsx`에 컴포넌트 함수 생성 (예: `StepXComponent`)
3. `renderContent()` switch 문에 케이스 추가
4. 기존 단계의 완료 핸들러에 진행 로직 업데이트

### 새로운 API 서비스 추가하기
1. `types.ts`에 TypeScript 인터페이스 정의
2. `geminiService.ts`에 서비스 함수 추가:
   ```typescript
   export const myService = async (
     params: any,
     model: string,
     apiKey: string
   ): Promise<MyType> => {
     const ai = getAi(apiKey);
     const response = await ai.models.generateContent({ ... });
     return parseJsonResponse<MyType>(response.text, 'myService');
   };
   ```
3. 컴포넌트에서 try-catch와 로딩 상태로 호출

### TTS 동작 수정하기
TTS는 두 곳에서 처리됨:

1. **단계 1 브리핑 TTS**: `handlePlayTTS()` 함수 + `ttsState` 관리
2. **단계 4 쉐도잉 TTS**: `playShadowingSentence()` 함수

둘 다 `gemini-2.5-flash-preview-tts` 모델과 `Zephyr` 음성 사용.

### 라이브 세션 디버깅
일반적인 문제:

| 문제 | 확인 사항 |
|------|----------|
| 마이크 작동 안 함 | `navigator.mediaDevices.getUserMedia` 권한 확인 |
| 오디오 재생 안 됨 | AudioContext 상태 및 샘플 레이트 확인 |
| 전사 표시 안 됨 | 라이브 세션의 `onmessage` 콜백 확인 |
| 메모리 누수 | `cleanupLiveSession()` 호출 여부 확인 |

---

## ⚠️ 중요한 기술적 노트

### Web Audio API 고려사항

#### 샘플 레이트
```typescript
// 입력 (마이크): 16kHz
inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });

// 출력 (TTS/Live): 24kHz
outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
```
⚠️ 정확한 오디오 처리를 위해 중요함!

#### ScriptProcessorNode 사용
- ⚠️ 현재 **deprecated** API 사용 중
- 💡 향후 **AudioWorklet**으로 마이그레이션 고려

#### AudioContext 생애주기
```typescript
// ✅ 사용하지 않을 때는 반드시 닫기
if (audioContext && audioContext.state !== 'closed') {
  audioContext.close();
}

// ❌ 닫힌 컨텍스트는 재사용 불가
// ✅ 작업 전에 상태 확인
```

### Gemini API 주의사항

#### 1. 타입 이슈
```typescript
// ❌ SDK에서 LiveSession 타입을 export하지 않음
// ✅ 해결방법: any 타입 사용
const sessionPromiseRef = useRef<Promise<any> | null>(null);
```

#### 2. JSON 응답 처리
```typescript
// 모델이 마크다운으로 감싼 JSON을 반환할 수 있음
const parseJsonResponse = <T,>(text: string, typeName: string): T => {
  const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
  return JSON.parse(cleanedText);
};
```

#### 3. Google Search Tool
- ⚠️ 특정 모델에서만 작동
- `fetchBriefing()`에서 기사 검색에 사용

#### 4. 오디오 포맷
```typescript
// Gemini는 특정 PCM 포맷 필요
{
  data: encode(new Uint8Array(int16.buffer)),
  mimeType: 'audio/pcm;rate=16000',
}
```

### 상태 관리 주의사항

| 주의사항 | 설명 |
|---------|------|
| 언마운트 시 정리 | 항상 오디오/세션 cleanup |
| Ref vs State | Ref는 명령형 API, State는 렌더링용 |
| 비동기 상태 업데이트 | 이전 상태에 의존 시 함수형 업데이트 |
| Effect 의존성 | 사용된 모든 변수를 의존성 배열에 포함 |

### 성능 고려사항
1. 📦 **큰 컴포넌트**: App.tsx가 802줄 - 더 커지면 분할 고려
2. 🔄 **리렌더링**: 자식에게 전달되는 함수에 `useCallback` 사용
3. 🎵 **오디오 버퍼링**: Set으로 오디오 소스 추적하여 메모리 누수 방지
4. 📝 **전사 증가**: 긴 대화는 렌더링 속도 저하 가능

---

## 🔍 에러 핸들링 패턴

### API 에러
```typescript
try {
  const result = await apiCall();
  // 결과 처리
} catch (e) {
  console.error(e);
  setError('사용자 친화적인 에러 메시지');
  setIsLoading(false);
}
```

### 오디오 에러
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // 스트림 처리
} catch (err) {
  setError('마이크에 접근할 수 없습니다...');
  cleanupLiveSession();
}
```

### JSON 파싱 에러
`parseJsonResponse()`에서 처리:
- 실패 시 원본 텍스트 로깅
- 설명적인 에러 throw
- 호출자는 catch하여 사용자 메시지 표시

---

## ✅ 테스트 체크리스트

변경 사항 적용 시 수동 테스트:

- [ ] API 키 검증 (유효/무효 키)
- [ ] 단계 1: 브리핑 로드 및 TTS 작동
- [ ] 단계 2: 마이크 접근, 라이브 전사, Alex 응답
- [ ] 단계 3: 전사로부터 피드백 생성
- [ ] 단계 4: 쉐도잉 문장 재생 및 진행
- [ ] 단계 5: 완료 화면 및 재시작
- [ ] 모델 전환 (pro vs flash)
- [ ] 모든 단계에서 중지 및 재시작 버튼
- [ ] 브라우저 콘솔 에러 확인
- [ ] 모바일 반응형

---

## 🐛 알려진 문제 및 제한사항

1. ⚠️ **LiveSession 타입**: SDK가 타입을 export하지 않음, `any` 사용
2. ⚠️ **ScriptProcessorNode**: Deprecated API, AudioWorklet으로 마이그레이션 필요
3. ⚠️ **모놀리식 App.tsx**: 큰 단일 파일, 분할 고려 필요
4. ⚠️ **테스트 없음**: 자동화된 테스트 인프라 없음
5. ⚠️ **API 키 저장**: localStorage 저장 (보안 고려 필요)
6. ⚠️ **에러 복구**: API 실패에 대한 재시도 로직 제한적
7. ⚠️ **오프라인 지원**: 없음 - 인터넷 연결 필수

---

## 💡 향후 개선 아이디어

### 1. 코드 구조
- [ ] App.tsx를 개별 단계 컴포넌트로 분할
- [ ] 오디오/세션 관리용 커스텀 훅 생성
- [ ] 전역 상태용 Context Provider 추가

### 2. 기능
- [ ] 세션 간 진행 상황 추적
- [ ] 주제 히스토리 및 복습
- [ ] 난이도 레벨 선택
- [ ] 커스텀 주제 입력
- [ ] 전사 내보내기 기능

### 3. 기술
- [ ] 자동화된 테스트 추가 (Jest, React Testing Library)
- [ ] AudioWorklet으로 마이그레이션
- [ ] SDK용 적절한 TypeScript 타입 추가
- [ ] Error Boundary 구현
- [ ] 로깅/분석 추가

### 4. UX
- [ ] 스피너 대신 로딩 스켈레톤
- [ ] 모바일 경험 개선
- [ ] 키보드 단축키
- [ ] 접근성 개선 (ARIA 레이블)

---

## 🤖 AI 어시스턴트 가이드라인

이 코드베이스 작업 시:

### ✅ DO
1. **일관성 유지** - 기존 상태 관리, 스타일링, 컴포넌트 구조 패턴 따르기
2. **플로우 보존** - 5단계 플로우는 UX의 핵심, 절대 변경 금지
3. **정리 처리** - 오디오 로직 수정 시 항상 컨텍스트와 세션 정리
4. **타입 안전성** - 새 함수/컴포넌트에 적절한 TypeScript 타입 추가
5. **에러 핸들링** - API 호출을 try-catch로 감싸고 사용자 친화적 메시지
6. **반응형 디자인** - 모바일 뷰포트에서 변경 사항 테스트
7. **테스팅** - 변경 후 전체 플로우 수동 테스트
8. **주석** - 복잡한 오디오/API 로직에 주석 추가
9. **성능** - 상태 수정 시 리렌더링 영향 고려
10. **보안** - API 키나 민감한 데이터 절대 커밋 금지

### ❌ DON'T
1. 5단계 플로우 변경 금지
2. 정리 없이 오디오 컨텍스트 수정 금지
3. API 키를 코드에 하드코딩 금지
4. 기존 타입 시스템 무시 금지
5. 테스트 없이 배포 금지

### 변경 사항 커밋 전

1. `npm run build` 실행하여 TypeScript 에러 확인
2. UI에서 모든 5단계 테스트
3. 브라우저 콘솔에서 에러/경고 확인
4. 모바일에서 반응형 디자인 검증
5. 아키텍처 변경 시 이 CLAUDE.md 업데이트

---

## 📚 유용한 명령어

```bash
# 개발
npm run dev          # 포트 3000에서 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run preview      # 프로덕션 빌드 미리보기

# 디버깅
# 브라우저 DevTools → Console에서 에러 확인
# DevTools → Application → Local Storage에서 API 키 확인
# DevTools → Network에서 API 호출 확인
```

---

## 🔗 연락처 및 리소스

- **AI Studio 앱**: https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn
- **Gemini API 문서**: https://ai.google.dev/docs
- **Gemini SDK**: https://github.com/google/genai-js
- **React 문서**: https://react.dev
- **Tailwind 문서**: https://tailwindcss.com

---

## 📝 버전 정보

**최종 업데이트**: 2025-11-17
**버전**: 2.0 (개선된 문서화)
**작성자**: AI 어시스턴트를 위한 종합 가이드
