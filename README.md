<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🎓 Gemini English Teacher

**매일 영어 토론 선생님**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Gemini API](https://img.shields.io/badge/Gemini-API-4285F4?logo=google)](https://ai.google.dev/)

**AI와 함께하는 실전 영어 토론 학습**

[AI Studio에서 보기](https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn) • [문서 보기](./CLAUDE.md)

</div>

---

## 📖 소개

**Gemini English Teacher**는 Google의 최신 Gemini API를 활용한 AI 기반 영어 학습 애플리케이션입니다.
실시간 음성 대화, 즉각적인 피드백, 체계적인 쉐도잉 연습을 통해 **CEFR B1-B2 레벨** 학습자의 영어 토론 능력을 향상시킵니다.

### ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🎤 **실시간 음성 대화** | AI 토론 파트너 Alex와 자연스러운 영어 대화 |
| 🚀 **Interrupt 지원** | AI 말하는 중에도 자연스럽게 끼어들 수 있음 (NEW!) |
| ⚡ **빠른 응답** | 최적화된 응답 지연으로 끊김 없는 대화 (NEW!) |
| 🎙️ **VAD 실시간 표시** | 음성 감지 상태를 UI로 실시간 확인 (NEW!) |
| 📰 **최신 뉴스 기반 토론** | Google Search를 활용한 실시간 뉴스 주제 |
| 📊 **상세한 피드백** | 문법, 어휘, 유창성에 대한 종합적인 분석 |
| 🗣️ **쉐도잉 연습** | 교정된 문장으로 발음 및 내재화 연습 |
| 🔊 **TTS 지원** | 브리핑 내용을 음성으로 들을 수 있는 기능 |
| 🌙 **다크 모드** | 눈의 피로를 줄이는 세련된 다크 테마 |
| 🛡️ **세션 보호** | 페이지 이탈 시 경고 및 데이터 유실 방지 |
| ⚠️ **재시작 확인** | 중요한 액션 전 확인 모달로 실수 방지 |

### 🎯 학습 플로우 (5단계)

```
1️⃣ Briefing (브리핑)
   ↓ 최신 뉴스 기사 + 핵심 어휘 학습

2️⃣ Discussion (토론)
   ↓ Alex와 실시간 음성 대화

3️⃣ Feedback (피드백)
   ↓ 문법, 어휘, 유창성 분석

4️⃣ Shadowing (쉐도잉)
   ↓ 교정된 문장 반복 연습

5️⃣ Completion (완료)
   ✓ 세션 완료 및 재시작
```

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js** (v18 이상 권장)
- **Gemini API 키** ([여기서 발급](https://aistudio.google.com/app/apikey))

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

브라우저에서 `http://localhost:3000` 을 열어주세요!

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

---

## 💡 사용 방법

### 1. API 키 입력
첫 실행 시 Gemini API 키를 입력하세요. 한 번 입력하면 브라우저에 저장됩니다.

### 2. 세션 시작
**"Start Today's Session"** 버튼을 클릭하면 AI가 최신 뉴스 기사를 찾아 브리핑을 생성합니다.

### 3. 브리핑 읽기
- 📝 주제 요약, 핵심 인사이트, 시사점 확인
- 📚 주요 어휘와 예문 학습
- 🔊 TTS 버튼으로 내용 듣기

### 4. 토론하기
- 🎙️ 마이크 버튼을 눌러 대화 시작
- 💬 Alex의 질문에 영어로 답변
- 📝 실시간 전사로 대화 내용 확인
- ⚠️ **중요**: 토론 중 페이지를 나가려 하면 경고가 표시됩니다

### 5. 피드백 받기
- ✅ 잘한 표현 확인
- ⚠️ 문법, 어휘 교정사항 확인
- 💡 유창성 개선 제안 확인

### 6. 쉐도잉 연습
- 🔊 교정된 문장 듣기
- 🗣️ 따라 말하기
- ✓ 다음 문장으로 진행

### 💡 유용한 팁
- **"Stop & Restart"** 버튼: 세션 중단 전 확인 모달이 표시됩니다
- **모바일 사용**: 토론 중 화면이 자동으로 켜진 상태로 유지됩니다 (Wake Lock)
- **비활성 감지**: 2분간 음성이 감지되지 않으면 경고가 표시됩니다
- **모델 선택**: 우측 상단에서 Flash(빠름) 또는 Pro(고품질) 선택 가능

---

## 🛠️ 기술 스택

### 프론트엔드
- **React 19.2.0** - UI 프레임워크
- **TypeScript 5.8.2** - 타입 안전성
- **Vite 6.2.0** - 빌드 도구
- **Tailwind CSS** - 스타일링

### AI & APIs
- **@google/genai 1.29.1** - Gemini API SDK
- **Gemini 2.5 Pro/Flash** - 콘텐츠 생성
- **Gemini Native Audio** - 실시간 음성 세션
- **Gemini TTS** - 텍스트 음성 변환
- **Google Search Tool** - 뉴스 검색

### 오디오 처리
- **Web Audio API** - 마이크 입력 및 오디오 재생
- **ScriptProcessorNode** - 실시간 오디오 처리

---

## 📁 프로젝트 구조

```
Gemini-Engilsh-Teacher/
├── App.tsx                 # 메인 애플리케이션
├── index.tsx              # React 진입점
├── index.html             # HTML 템플릿
├── types.ts               # TypeScript 타입
├── vite.config.ts         # Vite 설정
├── tsconfig.json          # TypeScript 설정
├── package.json           # 의존성
├── .env.local             # 환경 변수 (API 키)
├── README.md              # 프로젝트 설명
├── CLAUDE.md              # 개발자 가이드
├── TODO.md                # 작업 목록 및 향후 계획
│
├── components/
│   ├── Icons.tsx          # SVG 아이콘
│   └── Loader.tsx         # 로딩 컴포넌트
│
├── services/
│   ├── geminiService.ts   # Gemini API 서비스
│   └── ttsCache.ts        # TTS 캐싱 시스템
│
└── utils/
    ├── audio.ts           # 오디오 유틸리티
    ├── apiHelpers.ts      # API 헬퍼 함수
    └── wakeLock.ts        # 화면 꺼짐 방지
```

---

## ⚙️ 환경 변수

`.env.local` 파일에 다음 변수를 설정하세요:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

> ⚠️ **주의**: `.env.local` 파일은 Git에 커밋되지 않습니다. 절대 API 키를 공개 저장소에 올리지 마세요!

---

## 🎨 주요 기능 상세

### 1. 실시간 음성 대화
- Gemini의 Native Audio API를 사용한 저지연 음성 대화
- 실시간 전사(Transcription)로 대화 내용 시각화
- 16kHz 입력, 24kHz 출력 최적화

### 2. 지능형 피드백 시스템
```typescript
// 피드백 항목
{
  overall_assessment: "전반적 평가",
  praise_points: ["잘한 점들"],
  good_expressions: [{ 표현, 이유, 예시 }],
  improvement_suggestions: {
    grammar: [{ 원본, 교정, 이유 }],
    vocabulary: [{ 원본, 교정, 이유 }],
    fluency: [{ 제안, 이유 }]
  }
}
```

### 3. 적응형 브리핑 생성
- Google Search로 최신 뉴스 자동 검색 (3개월 이내)
- IT, AI, 금융, 자기계발 등 다양한 주제
- CEFR B1-B2 레벨에 맞는 어휘와 표현

---

## 🔧 개발자 가이드

### 코드베이스 문서
자세한 아키텍처, 컨벤션, 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

### 주요 컨벤션
- **TypeScript**: 모든 함수에 명시적 타입
- **React**: 함수형 컴포넌트 + Hooks
- **스타일**: Tailwind 유틸리티 클래스
- **네이밍**: PascalCase (컴포넌트), camelCase (함수/변수)

### 개발 명령어
```bash
npm run dev          # 개발 서버 시작 (포트 3000)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
```

---

## 🆕 최근 업데이트 (2025-12-03)

### ✅ 완료된 기능

#### 오전 업데이트
- **페이지 이탈 경고**: 학습 진행 중 페이지를 나가려 할 때 경고 표시
- **재시작 확인 모달**: "Stop & Restart" 버튼 클릭 시 확인 모달
- **TODO.md 추가**: 프로젝트 작업 목록 및 향후 계획 문서화

#### 오후 업데이트: **🚀 실시간 대화 3종 개선**
- **Interrupt 기능**: AI가 말하는 중에 사용자가 자연스럽게 끼어들 수 있음
  - 사용자 음성 감지 시 AI 오디오 자동 중단
  - AnalyserNode를 통한 실시간 음성 레벨 모니터링
- **응답 지연 최적화**: 더 빠르고 자연스러운 대화 흐름
  - 오디오 버퍼 크기 감소 (4096 → 2048)
  - VAD 침묵 감지 시간 단축 (1500ms → 800ms)
- **VAD (Voice Activity Detection) 개선**: 실시간 음성 활동 감지
  - 사용자가 말할 때 "🎤 음성 감지 중..." UI 표시
  - 자동 턴 전환으로 끊김 없는 대화

### 🔄 개선된 기능
- 세션 중단 시 데이터 유실 방지
- 사용자 의도 확인을 통한 실수 방지
- 모바일 UX 개선 (화면 꺼짐 방지, Wake Lock API)
- 대화 반응성 향상 (더 빠른 응답, 자연스러운 Interrupt)

---

## 🚀 향후 계획

상세한 로드맵은 [TODO.md](./TODO.md)를 참고하세요.

### 단기 목표 (1-2주)
- [ ] Gemini Pro TTS 적용 (브리핑 및 쉐도잉)
- [ ] localStorage 세션 자동 저장 (새로고침 복구)
- [ ] 로딩 스켈레톤 UI 적용

### 중기 목표 (1개월)
- [ ] **Supabase 통합**
  - 학습 세션 기록 저장
  - 사용자 진도 추적 대시보드
  - Edge Function으로 API 보안 강화
- [ ] **n8n 자동화 워크플로우**
  - 일일 학습 알림
  - 주간 리포트 자동 생성
  - 멀티 소스 뉴스 큐레이션

### 장기 목표 (2-3개월)
- [ ] App.tsx 분할 (컴포넌트 파일 분리)
- [ ] 커스텀 Hooks 추가 (`useAudioSession`, `useLiveSession`)
- [ ] ScriptProcessorNode → AudioWorklet 마이그레이션
- [ ] 난이도 레벨 선택 (A2, B1, B2, C1)
- [ ] 커스텀 주제 입력 기능
- [ ] 음성 인식 정확도 평가 및 발음 피드백

---

## 🐛 알려진 이슈

1. **LiveSession 타입**: Gemini SDK가 타입을 export하지 않아 `any` 사용
2. **ScriptProcessorNode**: Deprecated API 사용 (AudioWorklet 마이그레이션 예정)
3. **모바일 최적화**: 일부 모바일 브라우저에서 마이크 권한 문제 가능
4. **API 키 저장**: localStorage 사용 중 (향후 서버사이드 보안 강화 예정)

---

## 🤝 기여하기

이 프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 전 확인사항
- [ ] TypeScript 에러 없음 (`npm run build`)
- [ ] 모든 5단계 테스트 완료
- [ ] 모바일 반응형 확인
- [ ] [CLAUDE.md](./CLAUDE.md) 업데이트 (아키텍처 변경 시)

---

## 📄 라이선스

이 프로젝트는 Google AI Studio 앱에서 생성되었습니다.

---

## 🙏 감사의 말

- **Google Gemini Team** - 훌륭한 AI API 제공
- **React Team** - 최고의 UI 프레임워크
- **Vite Team** - 빠른 빌드 도구
- **Tailwind CSS Team** - 생산적인 스타일링 도구

---

## 📞 문의 및 지원

- **이슈 제보**: [GitHub Issues](https://github.com/HouuYa/Gemini-Engilsh-Teacher/issues)
- **AI Studio**: [원본 앱 보기](https://ai.studio/apps/drive/1hyv2-XvnyhVAbMmweC8AsHPJiwcmxFfn)
- **Gemini API 문서**: [https://ai.google.dev/docs](https://ai.google.dev/docs)

---

<div align="center">

**만든이**: Google AI Studio + Custom Development

**최종 업데이트**: 2025-12-03

[![Star on GitHub](https://img.shields.io/github/stars/HouuYa/Gemini-Engilsh-Teacher?style=social)](https://github.com/HouuYa/Gemini-Engilsh-Teacher)

</div>
