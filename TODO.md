# Gemini English Teacher - TODO List

## 긴급 (High Priority)

### 버그 수정
- [x] beforeunload 이벤트로 페이지 이탈 경고 추가
- [x] Stop & Restart 버튼 클릭 시 확인 모달 추가
- [x] Step 1 Briefing TTS 버그 수정 (AudioContext suspended 상태 처리)
- [x] Safari/iOS TTS 오디오 재생 문제 수정 (unlockAudioContext 추가)
- [ ] localStorage 세션 자동 저장 (새로고침 후 복구 기능)
- [ ] 모바일 화면 꺼짐 방지 개선 (현재 Wake Lock 불안정)

### 보안
- [ ] API 키를 localStorage에서 제거하고 안전한 방법으로 저장
  - Edge Function으로 API 호출 이동 고려
  - 또는 Supabase Auth + 환경 변수 사용

## 단기 목표 (1-2주)

### 기능 개선
- [x] **실시간 대화 개선** (2025-12-03 완료)
  - ✅ Interrupt 기능: AI 말하는 중 사용자 끼어들기 가능
  - ✅ 응답 지연 최적화: 버퍼 크기 감소 (4096 → 2048)
  - ✅ VAD 개선: 실시간 음성 활동 감지 및 UI 표시
  - ✅ Gemini Live API 설정 최적화 (silenceDurationMs: 800ms)
- [x] **Token 사용량 최적화** (2025-12-09 완료)
  - ✅ 프롬프트 길이 70-80% 감소 (fetchBriefing, getFeedback, getShadowingSentences)
  - ✅ Live Session instruction 67% 단축
  - ✅ API config 최적화 (temperature, candidateCount)
  - ✅ 코드 리뷰 반영: 품질 유지 키워드 추가
- [ ] Gemini Pro TTS를 Step 1, 4에 적용
- [ ] 에러 발생 시 자동 재시도 로직 강화 (retryWithBackoff 개선)
- [ ] Step 2 대화 종료 후 전사 내용 localStorage 백업

### UX 개선
- [x] VAD 상태 실시간 표시 (음성 감지 중 UI 피드백)
- [ ] 로딩 스켈레톤 UI (현재 Loader 대체)
- [ ] Step 2 대화 중 배경 음악/효과음 추가 옵션
- [ ] 쉐도잉 연습 시 사용자 음성 녹음 및 비교 기능
- [ ] 모바일 반응형 개선 (특히 Step 2 Discussion 화면)

## 중기 목표 (1개월)

### Supabase 통합
- [ ] Supabase 프로젝트 생성 및 DB 스키마 설계
  ```sql
  -- 사용자 프로필
  CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT,
    level TEXT, -- CEFR 레벨
    created_at TIMESTAMP
  );

  -- 학습 세션 기록
  CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    topic TEXT,
    briefing_data JSONB,
    transcript JSONB,
    feedback_data JSONB,
    completed_at TIMESTAMP
  );

  -- 사용자 진도 추적
  CREATE TABLE user_progress (
    user_id UUID REFERENCES users(id),
    total_sessions INT,
    grammar_score_avg FLOAT,
    vocabulary_score_avg FLOAT,
    fluency_score_avg FLOAT,
    last_session_date TIMESTAMP
  );
  ```
- [ ] 학습 세션 기록 저장 기능 구현
- [ ] 사용자 진도 대시보드 (과거 세션 조회)
- [ ] Edge Function으로 브리핑 생성 로직 이전
  - API 키 보안 강화
  - 서버사이드에서 뉴스 검색 및 필터링
- [ ] Supabase Storage에 TTS 오디오 캐싱

### n8n 워크플로우
- [ ] n8n 인스턴스 설정 (self-hosted 또는 cloud)
- [ ] 일일 학습 알림 워크플로우 구축
  - Cron Trigger → Supabase 쿼리 → 이메일/푸시 알림
- [ ] 주간 리포트 자동 생성 워크플로우
  - 매주 월요일 지난 주 학습 데이터 분석
  - 진도 리포트 PDF 생성 및 이메일 전송
- [ ] 멀티 소스 뉴스 큐레이션 파이프라인
  - NewsAPI, Guardian API, NYT API 병렬 호출
  - 중복 제거 및 품질 필터링
  - Supabase에 큐레이션된 뉴스 저장

## 장기 목표 (2-3개월)

### 아키텍처 개선
- [ ] App.tsx 분할 (각 Step을 별도 파일로)
  ```
  components/
  ├── ApiKeyScreen.tsx
  ├── StartScreen.tsx
  ├── Step1Briefing.tsx
  ├── Step2Discussion.tsx
  ├── Step3Feedback.tsx
  ├── Step4Shadowing.tsx
  └── Step5Completion.tsx
  ```
- [ ] 커스텀 Hooks 추가
  - `useAudioSession` - 오디오 컨텍스트 관리
  - `useLiveSession` - 라이브 세션 관리
  - `useTTS` - TTS 재생 관리
- [ ] Context API 도입 (전역 상태 관리)
  - `AppContext` - 앱 전역 상태
  - `SessionContext` - 현재 세션 데이터
- [ ] ScriptProcessorNode → AudioWorklet 마이그레이션
  - Deprecated API 제거
  - 더 나은 성능 및 레이턴시

### 고급 기능
- [ ] AI 튜터 다양화 (Alex 외 다른 페르소나 추가)
  - Emma (친근한 스타일)
  - David (격식 있는 스타일)
  - Sarah (비즈니스 영어 전문)
- [ ] 난이도 레벨 선택 (A2, B1, B2, C1)
  - 레벨별 어휘 및 문법 조정
  - 대화 속도 조절
- [ ] 커스텀 주제 입력 기능
  - 사용자가 원하는 주제 선택
  - URL 직접 입력하여 기사 분석
- [ ] 전사 내보내기 (PDF, JSON)
  - 학습 후 전체 대화 내용 다운로드
  - 피드백 포함 리포트 생성
- [ ] 음성 인식 정확도 평가 (발음 피드백)
  - 사용자 발음을 AI가 분석
  - 개선점 제안

### 테스트
- [ ] Jest + React Testing Library 설정
- [ ] 단위 테스트 작성
  - `services/geminiService.ts` 테스트
  - `utils/audio.ts` 테스트
  - `utils/apiHelpers.ts` 테스트
- [ ] 컴포넌트 테스트
  - 각 Step 컴포넌트 렌더링 테스트
  - 사용자 인터랙션 시뮬레이션
- [ ] E2E 테스트 (Playwright)
  - 전체 학습 플로우 자동화 테스트
- [ ] CI/CD 파이프라인 구축
  - GitHub Actions로 자동 테스트 및 배포

## 백로그 (우선순위 낮음)

- [ ] 다크/라이트 모드 토글
- [ ] 다국어 지원 (영어 UI 옵션)
- [ ] PWA 변환 (오프라인 지원)
  - Service Worker 추가
  - 오프라인 시 캐시된 데이터 사용
- [ ] 소셜 공유 기능 (학습 성과 공유)
  - Twitter, LinkedIn 공유
  - 성과 이미지 자동 생성
- [ ] Gamification (뱃지, 스트릭 등)
  - 7일 연속 학습 뱃지
  - 월간 학습 시간 랭킹
- [ ] 음성 속도 조절 (느리게/빠르게)
- [ ] 키보드 단축키 추가
  - Space: TTS 재생/일시정지
  - Enter: 다음 단계
  - Esc: 세션 종료

## 완료

### 2025-12-09 업데이트
- [x] **Safari/iOS 호환성 개선**
  - Safari TTS 오디오 재생 문제 수정 (unlockAudioContext 추가)
  - 개발 환경 전용 로깅 (프로덕션 빌드 정리)
- [x] **Token 사용량 최적화 (60-70% 감소)**
  - 프롬프트 최적화: fetchBriefing (80%), getFeedback (73%), getShadowingSentences (73%)
  - Live Session instruction 67% 단축
  - API config 설정 추가 (temperature, candidateCount)
- [x] **코드 품질 개선**
  - 코드 리뷰 제안 반영 (unique, comprehensive, objective 키워드 추가)
  - 프롬프트 품질과 token 효율성 균형 유지

### 2025-12-03 업데이트
- [x] **실시간 대화 개선 3종 세트**
  - Interrupt 기능: AI 말하는 중 사용자가 끼어들 수 있도록 구현
  - 응답 지연 최적화: 오디오 버퍼 크기 감소 및 VAD 설정 최적화
  - VAD 개선: AnalyserNode 추가하여 실시간 음성 활동 감지 및 UI 표시
- [x] Step 1 Briefing TTS 버그 수정 (AudioContext suspended 상태 처리)
- [x] 문서화 표준 확립 (이모지 제거, 명사형 문장 종결)

### 이전 업데이트
- [x] Wake Lock API 통합 (모바일 화면 꺼짐 방지)
- [x] TTS 캐싱 시스템 구현
- [x] 비활성 타임아웃 경고 (2분 비활성 시)
- [x] 모델 선택 드롭다운 (Pro vs Flash)
- [x] 페이지 이탈 경고 (beforeunload 이벤트)
- [x] Stop & Restart 확인 모달

## n8n + Supabase 통합 상세 계획

### Phase 1: Supabase 기본 설정 (1주)
1. Supabase 프로젝트 생성
2. DB 스키마 설계 및 테이블 생성
3. Row Level Security (RLS) 정책 설정
4. React 앱에서 Supabase 클라이언트 연결

### Phase 2: 데이터 저장 (1주)
1. 학습 세션 완료 시 DB에 저장
2. 사용자 진도 자동 업데이트
3. 과거 세션 조회 UI 구현

### Phase 3: Edge Functions (1-2주)
1. 브리핑 생성 Edge Function
   - 입력: userId, preferences
   - 출력: BriefingData
   - Gemini API 호출은 서버사이드에서 처리
2. 피드백 분석 Edge Function
   - 입력: transcript
   - 출력: FeedbackData

### Phase 4: n8n 워크플로우 (2주)
1. n8n 설치 및 설정
2. Supabase 연동 설정
3. 워크플로우 구축:
   - 일일 학습 알림
   - 주간 리포트
   - 뉴스 큐레이션

### 예상 아키텍처
```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────┐
│  Gemini API     │  │  Supabase        │
│  (Live Session) │  │  - Database      │
│                 │  │  - Edge Functions│
└─────────────────┘  │  - Storage       │
                     │  - Auth          │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   n8n Workflows │
                     │  - Notifications│
                     │  - Reports      │
                     │  - Curation     │
                     └─────────────────┘
```

## 참고 리소스

- [Gemini API Docs](https://ai.google.dev/docs)
- [Supabase Docs](https://supabase.com/docs)
- [n8n Docs](https://docs.n8n.io/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)

---

**최종 업데이트**: 2025-12-09
**버전**: 1.2
