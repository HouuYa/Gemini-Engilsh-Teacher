
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Removed 'LiveSession' as it is not an exported member of '@google/genai'.
import type { LiveServerMessage } from '@google/genai';
import { fetchBriefing, getFeedback, getShadowingSentences, checkApiStatus } from './services/geminiService';
import { encode, decode, decodeAudioData, createBlob } from './utils/audio';
import { getUserFriendlyErrorMessage } from './utils/apiHelpers';
import { requestWakeLock, releaseWakeLock, isWakeLockSupported } from './utils/wakeLock';
import { generateTTSAudio, preloadTTSAudios, ttsCache } from './services/ttsCache';
import type { Step, BriefingData, FeedbackData, TranscriptItem, LiveStatus } from './types';
import { Loader } from './components/Loader';
import { MicrophoneIcon, StopIcon, PlayIcon, CheckIcon, SpeakerIcon, StopCircleIcon, KeyIcon } from './components/Icons';

type AppStage = 'apiKey' | 'checking' | 'ready' | 'running' | 'error';

const ModelSelector: React.FC<{ selectedModel: string; onModelChange: (model: string) => void; onChangeKey: () => void; }> = ({ selectedModel, onModelChange, onChangeKey }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const models = [
        { value: 'gemini-2.5-flash', label: 'Flash (추천)', description: '빠르고 경제적인 모델' },
        { value: 'gemini-2.5-pro', label: 'Pro', description: '더 높은 품질의 분석과 피드백' }
    ];

    return (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button onClick={onChangeKey} className="p-2 bg-dark-surface border border-gray-600 rounded-md text-sm text-dark-text-secondary hover:bg-gray-700 transition-colors" title="Change API Key">
                <KeyIcon />
            </button>
            <div className="relative">
                <select
                    id="model-select"
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="bg-dark-surface border border-gray-600 rounded-md px-2 py-1 text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                    {models.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                </select>
                <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="ml-1 text-dark-text-secondary hover:text-brand-blue"
                    aria-label="Model information"
                >
                    ⓘ
                </button>
                {showTooltip && (
                    <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 border border-gray-600 rounded-md shadow-lg text-xs z-20">
                        <p className="font-semibold text-brand-blue mb-1">Flash (추천)</p>
                        <p className="text-dark-text-secondary mb-2">빠르고 경제적인 모델. 일상적인 대화에 충분한 품질 제공</p>
                        <p className="font-semibold text-brand-blue mb-1">Pro</p>
                        <p className="text-dark-text-secondary">더 높은 품질의 분석과 피드백. 비용이 더 높음</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [appStage, setAppStage] = useState<AppStage>('apiKey');
  const [appStatusMessage, setAppStatusMessage] = useState<string>('System status check...');
  const [step, setStep] = useState<Step | 0>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const [liveAlexTranscript, setLiveAlexTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [shadowingSentences, setShadowingSentences] = useState<string[]>([]);
  const [currentShadowingIndex, setCurrentShadowingIndex] = useState<number>(0);
  const [isAlexSpeaking, setIsAlexSpeaking] = useState<boolean>(false);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
  const [model, setModel] = useState('gemini-2.5-flash'); // 기본 모델을 Flash로 변경
  const [ttsState, setTtsState] = useState<{ playing: boolean; sectionId: string | null }>({ playing: false, sectionId: null });
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);
  const [ttsPreloadProgress, setTtsPreloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [lastUserActivityTime, setLastUserActivityTime] = useState<number>(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [showRestartConfirmModal, setShowRestartConfirmModal] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false); // VAD 상태 표시

  // FIX: Replaced 'LiveSession' with 'any' to resolve the type error.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null); // VAD용 Analyser
  const ttsAudioContextRef = useRef<AudioContext | null>(null);
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ttsPreloadAudioContextRef = useRef<AudioContext | null>(null);

  // AudioContext unlock 기능 (iOS 대응)
  const unlockAudioContext = useCallback(async () => {
    if (audioContextUnlocked) return;

    try {
      // 무음 오디오를 재생하여 AudioContext를 활성화
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      await ctx.close();

      setAudioContextUnlocked(true);
      console.log('AudioContext unlocked successfully');
    } catch (error) {
      console.error('Failed to unlock AudioContext:', error);
    }
  }, [audioContextUnlocked]);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key');
    if (savedKey) {
        setApiKey(savedKey);
        setAppStage('checking');
    } else {
        setAppStage('apiKey');
    }
  }, []);

  const handleKeySubmit = useCallback(async (key: string) => {
    if (!key) {
        setError("API key cannot be empty.");
        return;
    }
    setError(null);
    setAppStage('checking');
    setAppStatusMessage('Checking Gemini API connection...');
    const { ok, message } = await checkApiStatus(model, key);
    if (ok) {
        localStorage.setItem('gemini-api-key', key);
        setApiKey(key);
        setAppStage('ready');
    } else {
        localStorage.removeItem('gemini-api-key');
        setApiKey(null);
        setError(message);
        setAppStage('apiKey');
    }
  }, [model]);

  const handleChangeApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey(null);
    setError(null);
    setAppStage('apiKey');
    setStep(0);
  };
  
  const stopTtsPlayback = useCallback(() => {
    if (ttsSourceRef.current) {
        ttsSourceRef.current.stop();
        ttsSourceRef.current.disconnect();
        ttsSourceRef.current = null;
    }
    if (ttsAudioContextRef.current && ttsAudioContextRef.current.state !== 'closed') {
        ttsAudioContextRef.current.close();
        ttsAudioContextRef.current = null;
    }
    setTtsState({ playing: false, sectionId: null });
  }, []);

  const stopAudioPlayback = useCallback(() => {
    if (outputAudioContextRef.current) {
        for (const source of audioSourcesRef.current.values()) {
            source.stop();
            audioSourcesRef.current.delete(source);
        }
        nextAudioStartTimeRef.current = 0;
    }
    setIsAlexSpeaking(false);
  }, []);

  const cleanupLiveSession = useCallback(() => {
      stopAudioPlayback();

      if (mediaStreamSourceRef.current && scriptProcessorRef.current) {
        mediaStreamSourceRef.current.disconnect();
        scriptProcessorRef.current.disconnect();
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if(inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
      }
      if(outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
      }

      inputAudioContextRef.current = null;
      outputAudioContextRef.current = null;
      scriptProcessorRef.current = null;
      mediaStreamSourceRef.current = null;

      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
      }
      setLiveStatus('idle');
      setUserSpeaking(false);
  }, [stopAudioPlayback]);
  
  const handleStartNewTopic = useCallback(() => {
    // 학습 진행 중일 때는 확인 모달 표시
    if (step >= 2 && step <= 4) {
      setShowRestartConfirmModal(true);
      return;
    }

    // 확인 후 실행되는 실제 초기화 로직
    executeRestart();
  }, [step]);

  const executeRestart = useCallback(() => {
    cleanupLiveSession();
    stopTtsPlayback();
    setStep(0);
    setAppStage('ready');
    setIsLoading(false);
    setError(null);
    setBriefing(null);
    setTranscript([]);
    setLiveUserTranscript('');
    setLiveAlexTranscript('');
    setFeedback(null);
    setShadowingSentences([]);
    setCurrentShadowingIndex(0);
    setShowRestartConfirmModal(false);
  }, [cleanupLiveSession, stopTtsPlayback]);

  useEffect(() => {
    if (appStage === 'checking' && apiKey) {
        handleKeySubmit(apiKey);
    }
  }, [appStage, apiKey, handleKeySubmit]);

  useEffect(() => {
    if (appStage === 'running' && step === 1 && !briefing && apiKey) {
      const init = async () => {
        setIsLoading(true);
        setLoadingMessage('Finding a new topic for you...');
        try {
          const briefingData = await fetchBriefing(model, apiKey);
          setBriefing(briefingData);

          // TTS 오디오 사전 로딩
          setLoadingMessage('Preparing audio playback...');
          ttsPreloadAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

          const textsToPreload = [
            briefingData.summary.en,
            briefingData.key_insights.map(i => i.en).join('. '),
            briefingData.implications.en
          ];

          await preloadTTSAudios(
            textsToPreload,
            apiKey,
            ttsPreloadAudioContextRef.current,
            (current, total) => {
              setTtsPreloadProgress({ current, total });
            }
          );

          setTtsPreloadProgress(null);
        } catch (e) {
          const friendlyMessage = getUserFriendlyErrorMessage(e);
          setError(friendlyMessage);
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      init();
    }
  }, [step, briefing, model, apiKey, appStage]);

  const handlePlayTTS = useCallback(async (text: string, sectionId: string) => {
    if (!apiKey) return;

    // Safari/iOS 대응: AudioContext unlock
    await unlockAudioContext();

    if (ttsState.playing) {
      stopTtsPlayback();
      if (ttsState.sectionId === sectionId) {
        return;
      }
    }

    setTtsState({ playing: true, sectionId });
    try {
      // TTS 캐싱 시스템 사용
      if (!ttsAudioContextRef.current || ttsAudioContextRef.current.state === 'closed') {
        ttsAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const ctx = ttsAudioContextRef.current;

      // AudioContext가 suspended 상태일 수 있음 (iOS/브라우저 제한) - resume 필요
      if (ctx.state === 'suspended') {
        if (import.meta.env.DEV) {
          console.log('[TTS] Resuming suspended AudioContext...');
        }
        await ctx.resume();
        if (import.meta.env.DEV) {
          console.log('[TTS] AudioContext state after resume:', ctx.state);
        }
      }

      const audioBuffer = await generateTTSAudio(text, apiKey, ctx);

      const source = ctx.createBufferSource();
      ttsSourceRef.current = source;
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.addEventListener('ended', () => {
        if (ttsSourceRef.current === source) {
          stopTtsPlayback();
        }
      });
      source.start();
    } catch (e) {
      console.error("TTS failed:", e);
      const friendlyMessage = getUserFriendlyErrorMessage(e);
      setError(friendlyMessage);
      stopTtsPlayback();
    }
  }, [apiKey, ttsState.playing, ttsState.sectionId, stopTtsPlayback, unlockAudioContext]);

  // 비활성 타임아웃 관리
  const resetInactivityTimer = useCallback(() => {
    setLastUserActivityTime(Date.now());
    setShowInactivityWarning(false);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // 2분 비활성 시 경고, 3분 비활성 시 자동 종료
    inactivityTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);

      // 추가 1분 대기 후 자동 종료
      inactivityTimerRef.current = setTimeout(() => {
        if (liveStatus === 'listening') {
          console.log('Auto-closing session due to inactivity');
          cleanupLiveSession();
          setError('세션이 비활성으로 인해 자동 종료되었습니다.');
        }
      }, 60000); // 1분 후
    }, 120000); // 2분 후
  }, [liveStatus, cleanupLiveSession]);

  // Live Session 중 사용자 활동 감지
  useEffect(() => {
    if (liveStatus === 'listening') {
      resetInactivityTimer();
    } else {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      setShowInactivityWarning(false);
    }
  }, [liveStatus, resetInactivityTimer]);

  // 페이지 이탈 경고 (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // step 2(Discussion), 3(Feedback), 4(Shadowing) 진행 중일 때만 경고
      if (appStage === 'running' && (step === 2 || step === 3 || step === 4)) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '토론이 진행 중입니다. 정말 페이지를 나가시겠습니까? 진행 상황이 저장되지 않습니다.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appStage, step]);

  useEffect(() => {
    return () => {
        cleanupLiveSession();
        stopTtsPlayback();
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        releaseWakeLock();
    };
  }, [cleanupLiveSession, stopTtsPlayback]);
  
  const startLiveSession = useCallback(async (systemInstruction: string) => {
    if (liveStatus !== 'idle' || !apiKey) return;

    // AudioContext unlock (첫 사용자 인터랙션)
    await unlockAudioContext();

    // Wake Lock 요청
    if (isWakeLockSupported()) {
      const wakeLockGranted = await requestWakeLock();
      setWakeLockActive(wakeLockGranted);
    }

    setLiveStatus('connecting');
    setError(null);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const { GoogleGenAI, Modality } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                systemInstruction,
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                // 🚀 개선 #2 & #3: VAD 최적화 - 더 빠른 턴 전환과 자연스러운 대화
                realtimeInputConfig: {
                    automaticActivityDetection: {
                        disabled: false, // 자동 VAD 활성화
                        silenceDurationMs: 800, // 침묵 감지 시간 (기본값 1500ms → 800ms로 단축)
                        prefixPaddingMs: 100, // 음성 시작 전 패딩 (자연스러운 시작)
                    }
                },
            },
            callbacks: {
                onopen: () => {
                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;

                    // 🚀 개선 #3: VAD 개선 - AnalyserNode로 실시간 음성 레벨 감지
                    const analyser = inputAudioContextRef.current!.createAnalyser();
                    analyser.fftSize = 512;
                    analyser.smoothingTimeConstant = 0.8;
                    analyserRef.current = analyser;

                    // 🚀 개선 #2: 응답 지연 최적화 - 버퍼 크기 감소 (4096 → 2048)
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(2048, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    // VAD 임계값 설정
                    const VOICE_THRESHOLD = -45; // dB 단위 (조정 가능)
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    let wasSpeaking = false;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);

                        // 🚀 개선 #3: VAD - 실시간 음성 레벨 계산
                        analyser.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                        const volumeDb = 20 * Math.log10(average / 255);
                        const isSpeaking = volumeDb > VOICE_THRESHOLD;

                        // 🚀 개선 #1: Interrupt - 사용자 말하기 시작하면 AI 오디오 중단
                        if (isSpeaking && !wasSpeaking && isAlexSpeaking) {
                            console.log('User interrupt detected - stopping AI audio');
                            stopAudioPlayback();
                        }

                        wasSpeaking = isSpeaking;
                        setUserSpeaking(isSpeaking);

                        if(sessionPromiseRef.current) {
                          sessionPromiseRef.current.then((session) => {
                              session.sendRealtimeInput({ media: pcmBlob });
                          });
                        }
                    };

                    source.connect(analyser);
                    analyser.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    setLiveStatus('listening');
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentInputTranscriptionRef.current += text;
                        setLiveUserTranscript(currentInputTranscriptionRef.current);
                        // 사용자 음성 감지 시 비활성 타이머 리셋
                        resetInactivityTimer();
                    }
                    if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        currentOutputTranscriptionRef.current += text;
                        setLiveAlexTranscript(currentOutputTranscriptionRef.current);
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        setIsAlexSpeaking(true);
                        const ctx = outputAudioContextRef.current!;
                        nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.addEventListener('ended', () => {
                            audioSourcesRef.current.delete(source);
                            if (audioSourcesRef.current.size === 0) {
                                setIsAlexSpeaking(false);
                            }
                        });
                        source.start(nextAudioStartTimeRef.current);
                        nextAudioStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                    
                    if (message.serverContent?.turnComplete) {
                        setTranscript(prev => {
                            const newTranscript = [...prev];
                            if (currentInputTranscriptionRef.current.trim()) {
                                newTranscript.push({ speaker: 'user', text: currentInputTranscriptionRef.current.trim() });
                            }
                            if (currentOutputTranscriptionRef.current.trim()) {
                                newTranscript.push({ speaker: 'alex', text: currentOutputTranscriptionRef.current.trim() });
                            }
                            return newTranscript;
                        });
                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                        setLiveUserTranscript('');
                        setLiveAlexTranscript('');
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    const friendlyMessage = getUserFriendlyErrorMessage(e);
                    setError(friendlyMessage);
                    cleanupLiveSession();
                    releaseWakeLock();
                    setWakeLockActive(false);
                },
                onclose: () => {
                    setLiveStatus('idle');
                    releaseWakeLock();
                    setWakeLockActive(false);
                }
            }
        });
    } catch (err) {
        console.error('Failed to start live session:', err);
        const friendlyMessage = err instanceof Error && err.message.includes('Permission')
          ? '마이크 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.'
          : getUserFriendlyErrorMessage(err);
        setError(friendlyMessage);
        setLiveStatus('idle');
        cleanupLiveSession();
        releaseWakeLock();
        setWakeLockActive(false);
    }
  }, [liveStatus, cleanupLiveSession, apiKey, unlockAudioContext, resetInactivityTimer]);

  const handleStep2Complete = useCallback(async () => {
    if (!apiKey) return;
    cleanupLiveSession();
    setIsLoading(true);
    setLoadingMessage('Analyzing your conversation...');
    try {
        const feedbackData = await getFeedback(transcript, model, apiKey);
        setFeedback(feedbackData);
        setStep(3);
    } catch(e) {
        console.error(e);
        const friendlyMessage = getUserFriendlyErrorMessage(e);
        setError(friendlyMessage);
    } finally {
        setIsLoading(false);
    }
  }, [transcript, cleanupLiveSession, model, apiKey]);

  const handleStep3Complete = useCallback(async () => {
    if (!apiKey) return;
    setIsLoading(true);
    setLoadingMessage('Preparing shadowing session...');
    try {
        if(feedback) {
            const sentences = await getShadowingSentences(feedback, model, apiKey);
            setShadowingSentences(sentences);
            setStep(4);
        }
    } catch(e) {
        console.error(e);
        const friendlyMessage = getUserFriendlyErrorMessage(e);
        setError(friendlyMessage);
    } finally {
        setIsLoading(false);
    }
  }, [feedback, model, apiKey]);
  
  const playShadowingSentence = useCallback(async () => {
      if (!apiKey) return;
      const sentence = shadowingSentences[currentShadowingIndex];
      if (!sentence) return;
      
      const { GoogleGenAI, Modality } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sentence }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio && outputAudioContextRef.current) {
          setIsAlexSpeaking(true);
          const ctx = outputAudioContextRef.current;
          const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.addEventListener('ended', () => setIsAlexSpeaking(false));
          source.start();
      }
  }, [shadowingSentences, currentShadowingIndex, apiKey]);

  useEffect(() => {
    if (step === 4 && shadowingSentences.length > 0 && !outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return () => {
        if(step !== 4 && outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
    }
  }, [step, shadowingSentences]);


  const renderContent = () => {
    if (appStage === 'apiKey') return <ApiKeyScreen onKeySubmit={handleKeySubmit} error={error} />;
    if (appStage === 'checking') return <Loader message={appStatusMessage} />;
    if (appStage === 'error') return <div className="text-center text-brand-red p-4">{appStatusMessage} <button onClick={() => setAppStage('apiKey')} className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg">Try Again</button></div>;
    if (appStage === 'ready') return <StartScreen onStart={() => { setStep(1); setAppStage('running'); }} />;
    
    if (isLoading) return <Loader message={loadingMessage} />;
    if (error && appStage === 'running') return <div className="text-center text-brand-red p-4">{error} <button onClick={handleStartNewTopic} className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg">Try Again</button></div>;

    if (appStage === 'running') {
        switch (step) {
          case 1:
            return briefing && <Step1Briefing data={briefing} onStart={() => setStep(2)} onPlayTTS={handlePlayTTS} ttsState={ttsState} />;
          case 2:
            return briefing && <Step2Discussion
                questions={briefing.discussion_questions}
                onComplete={handleStep2Complete}
                startLiveSession={startLiveSession}
                cleanupLiveSession={cleanupLiveSession}
                liveStatus={liveStatus}
                transcript={transcript}
                liveUserTranscript={liveUserTranscript}
                liveAlexTranscript={liveAlexTranscript}
                showInactivityWarning={showInactivityWarning}
                onDismissInactivityWarning={() => {
                  setShowInactivityWarning(false);
                  resetInactivityTimer();
                }}
                wakeLockActive={wakeLockActive}
                userSpeaking={userSpeaking}
            />;
          case 3:
            return feedback && <Step3Feedback data={feedback} onStartShadowing={handleStep3Complete} onSkip={() => setStep(5)}/>;
          case 4:
            return shadowingSentences.length > 0 && <Step4Shadowing 
                sentences={shadowingSentences}
                currentIndex={currentShadowingIndex}
                isAlexSpeaking={isAlexSpeaking}
                playSentence={playShadowingSentence}
                onNext={() => {
                    if (currentShadowingIndex < shadowingSentences.length - 1) {
                        setCurrentShadowingIndex(prev => prev + 1);
                    } else {
                        setStep(5);
                    }
                }}
            />
          case 5:
            return <Step5Completion onRestart={handleStartNewTopic} />;
          default:
            return <StartScreen onStart={() => { setStep(1); setAppStage('running'); }} />;
        }
    }
    return null;
  };
  
  const showHeaderAndControls = appStage === 'running' || appStage === 'ready';

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center p-4 sm:p-6 relative">
      {showHeaderAndControls && (
        <>
            <ModelSelector selectedModel={model} onModelChange={setModel} onChangeKey={handleChangeApiKey} />
             {appStage === 'running' && (
                <button
                    onClick={handleStartNewTopic}
                    className="absolute top-4 left-4 z-10 px-3 py-1 bg-brand-red text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                    aria-label="Stop and Restart Session"
                >
                    Stop &amp; Restart
                </button>
            )}
        </>
      )}
      <header className="w-full max-w-4xl mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-text-primary text-center">
          Gemini <span className="text-brand-blue">Learn</span>
        </h1>
        {showHeaderAndControls && <p className="text-center text-dark-text-secondary mt-1">with Alex, your AI discussion partner</p>}
      </header>
      <main className="w-full max-w-4xl bg-dark-surface rounded-xl shadow-lg p-4 sm:p-8 flex-grow">
        {renderContent()}
      </main>

      {/* 재시작 확인 모달 */}
      <RestartConfirmModal
        isOpen={showRestartConfirmModal}
        onConfirm={executeRestart}
        onCancel={() => setShowRestartConfirmModal(false)}
      />
    </div>
  );
}

const ApiKeyScreen: React.FC<{ onKeySubmit: (key: string) => void; error: string | null; }> = ({ onKeySubmit, error }) => {
    const [key, setKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onKeySubmit(key);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-dark-text-primary">Enter your Gemini API Key</h2>
            <p className="text-md text-dark-text-secondary mt-4 max-w-xl">
                To use this application, you need a Google Gemini API key. You can get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Google AI Studio</a>.
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-sm mt-6">
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your API key here"
                    className="w-full px-4 py-2 border border-gray-600 rounded-md bg-dark-bg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    aria-label="Gemini API Key"
                />
                {error && <p className="text-brand-red mt-2 text-sm">{error}</p>}
                <button type="submit" className="mt-4 w-full px-8 py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors text-lg">
                    Save & Continue
                </button>
            </form>
        </div>
    );
};

const StartScreen: React.FC<{ onStart: () => void; }> = ({ onStart }) => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
        <h2 className="text-3xl font-bold text-dark-text-primary">Ready for your English discussion?</h2>
        <p className="text-lg text-dark-text-secondary mt-4 max-w-xl">
          Welcome to Gemini Learn. Alex, your AI partner, is ready to discuss a new topic with you, provide detailed feedback, and help you improve.
        </p>

        {/* 모바일 사용 안내 */}
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg max-w-xl text-sm">
          <p className="text-dark-text-secondary">
            <strong className="text-brand-blue">📱 모바일 사용 안내:</strong><br />
            토론 중에는 화면을 켠 상태로 유지해주세요. 안정적인 Wi-Fi 환경을 권장합니다.
          </p>
        </div>

        <div className="mt-8">
            <button onClick={onStart} className="px-8 py-4 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors text-lg">
                Start Today's Session
            </button>
        </div>
    </div>
);

const Step1Briefing: React.FC<{ 
    data: BriefingData; 
    onStart: () => void; 
    onPlayTTS: (text: string, sectionId: string) => void;
    ttsState: { playing: boolean; sectionId: string | null };
}> = ({ data, onStart, onPlayTTS, ttsState }) => {
    
    const ReadAloudButton: React.FC<{text: string; sectionId: string}> = ({ text, sectionId }) => {
        const isPlaying = ttsState.playing && ttsState.sectionId === sectionId;
        return (
            <button 
                onClick={() => onPlayTTS(text, sectionId)} 
                className="ml-2 text-dark-text-secondary hover:text-brand-blue transition-colors disabled:opacity-50"
                aria-label={isPlaying ? 'Stop reading' : 'Read aloud'}
                disabled={ttsState.playing && !isPlaying}
            >
                {isPlaying ? <StopCircleIcon /> : <SpeakerIcon />}
            </button>
        );
    };
    
    return (
      <div className="animate-fade-in space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-brand-blue mb-2">STEP 1: Briefing</h2>
            <h3 className="text-xl font-semibold text-dark-text-primary whitespace-pre-wrap">{data.topic}</h3>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <p><strong>Title:</strong> {data.article.title}</p>
          <p>
            <strong>Source:</strong>{' '}
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
              {data.article.source}
            </a>{' '}
            ({data.article.publication_date})
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg inline-flex items-center">
                Summary
                <ReadAloudButton text={data.summary.en} sectionId="summary" />
            </h4>
            <p className="text-dark-text-secondary mt-1">{data.summary.en}</p>
            <p className="text-gray-400 text-sm mt-1">{data.summary.ko}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg inline-flex items-center">
                Key Insights
                 <ReadAloudButton text={data.key_insights.map(i => i.en).join('. ')} sectionId="insights" />
            </h4>
            <ul className="list-disc list-inside space-y-2 mt-1">
              {data.key_insights.map((item, i) => <li key={i}><p className="inline text-dark-text-secondary">{item.en} <span className="text-gray-400 text-sm">({item.ko})</span></p></li>)}
            </ul>
          </div>
           <div>
            <h4 className="font-semibold text-lg inline-flex items-center">
                Implications
                <ReadAloudButton text={data.implications.en} sectionId="implications" />
            </h4>
            <p className="text-dark-text-secondary mt-1">{data.implications.en}</p>
            <p className="text-gray-400 text-sm mt-1">{data.implications.ko}</p>
          </div>
           <div>
            <h4 className="font-semibold text-lg">Vocabulary & Expressions</h4>
            <ul className="space-y-2 mt-1">
              {data.vocabulary.map((item, i) => <li key={i}><strong className="text-brand-yellow">{item.word}:</strong> <span className="text-dark-text-secondary">{item.meaning}</span><br/><em className="text-gray-400">e.g., {item.example}</em></li>)}
            </ul>
          </div>
           <div>
            <h4 className="font-semibold text-lg">Discussion Questions</h4>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-dark-text-secondary">
              {data.discussion_questions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </div>
        </div>
        <button onClick={onStart} className="w-full py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">Ready to Discuss!</button>
      </div>
    );
};

const Step2Discussion: React.FC<{
    questions: string[];
    onComplete: () => void;
    startLiveSession: (prompt: string) => void;
    cleanupLiveSession: () => void;
    liveStatus: LiveStatus;
    transcript: TranscriptItem[];
    liveUserTranscript: string;
    liveAlexTranscript: string;
    showInactivityWarning: boolean;
    onDismissInactivityWarning: () => void;
    wakeLockActive: boolean;
    userSpeaking: boolean;
}> = ({ questions, onComplete, startLiveSession, cleanupLiveSession, liveStatus, transcript, liveUserTranscript, liveAlexTranscript, showInactivityWarning, onDismissInactivityWarning, wakeLockActive, userSpeaking }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, liveUserTranscript, liveAlexTranscript]);
    
    const handleStart = () => {
        // Token 최적화: 질문 목록 대신 첫 질문만 전달
        const firstQuestion = questions[0] || "What's your first impression?";
        startLiveSession(
            `You are Alex, a discussion partner. Ask: "${firstQuestion}" Then naturally discuss the topic. After good conversation, ask if user wants feedback.`
        );
    };

    const handleStop = () => {
        cleanupLiveSession();
        onComplete();
    };
    
    const isListening = liveStatus === 'listening';

    return (
        <div className="flex flex-col h-full animate-fade-in" style={{maxHeight: '70vh'}}>
            <h2 className="text-2xl font-bold text-brand-blue mb-4">STEP 2: In-depth Discussion</h2>

            {/* 비활성 경고 메시지 */}
            {showInactivityWarning && (
                <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                        ⚠️ 2분간 음성이 감지되지 않았습니다. 계속 진행하시겠어요?
                    </p>
                    <button
                        onClick={onDismissInactivityWarning}
                        className="mt-2 px-3 py-1 bg-brand-blue text-white text-sm rounded-md hover:bg-blue-600"
                    >
                        네, 계속할게요
                    </button>
                </div>
            )}

            {/* Wake Lock & VAD 상태 표시 */}
            {liveStatus === 'listening' && (
                <div className="mb-2 flex items-center gap-3 text-xs">
                    {wakeLockActive && (
                        <span className="text-green-400">
                            🔒 화면 꺼짐 방지 활성화됨
                        </span>
                    )}
                    {userSpeaking && (
                        <span className="text-brand-blue flex items-center gap-1 animate-pulse">
                            🎤 <span>음성 감지 중...</span>
                        </span>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row flex-grow gap-4 overflow-hidden">
                {/* Questions Panel */}
                <div className="w-full md:w-1/3 bg-gray-800/50 rounded-lg p-4 overflow-y-auto">
                    <h3 className="font-semibold text-lg mb-2 text-dark-text-primary">Discussion Questions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-dark-text-secondary">
                        {questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ol>
                </div>
                {/* Chat Panel */}
                <div className="w-full md:w-2/3 flex flex-col bg-gray-800/50 rounded-lg">
                    <div className="flex-grow space-y-4 overflow-y-auto p-4">
                        {transcript.map((item, index) => (
                            <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${item.speaker === 'user' ? 'bg-brand-blue text-white' : 'bg-gray-700 text-dark-text-primary'}`}>
                                    <p className="font-semibold capitalize text-sm mb-1">{item.speaker === 'user' ? 'You' : 'Alex'}</p>
                                    <p className="whitespace-pre-wrap">{item.text}</p>
                                </div>
                            </div>
                        ))}
                        {liveAlexTranscript && (
                             <div className="flex justify-start">
                                <div className="p-3 rounded-lg max-w-xs md:max-w-md bg-gray-700 text-dark-text-primary opacity-80">
                                    <p className="font-semibold capitalize text-sm mb-1">Alex</p>
                                    <p className="whitespace-pre-wrap">{liveAlexTranscript}</p>
                                </div>
                            </div>
                        )}
                         {liveUserTranscript && (
                             <div className="flex justify-end">
                                <div className="p-3 rounded-lg max-w-xs md:max-w-md bg-brand-blue text-white opacity-80">
                                    <p className="font-semibold capitalize text-sm mb-1">You</p>
                                    <p className="whitespace-pre-wrap">{liveUserTranscript}</p>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="mt-auto pt-4 pb-2 flex flex-col justify-center items-center gap-2 border-t border-gray-700">
                         <div className="flex justify-center items-center gap-4">
                            {liveStatus === 'idle' && (
                                <button onClick={handleStart} aria-label="Start discussion" className="p-4 bg-brand-blue rounded-full text-white shadow-lg transform hover:scale-105 transition-transform"><MicrophoneIcon /></button>
                            )}
                            {liveStatus !== 'idle' && (
                                <button onClick={handleStop} aria-label="Stop discussion" className={`p-4 bg-brand-red rounded-full text-white shadow-lg transform hover:scale-105 transition-transform relative`}>
                                    <StopIcon />
                                    {isListening && <span className="absolute h-full w-full rounded-full bg-red-500 opacity-75 animate-ping -z-10 top-0 left-0"></span>}
                                </button>
                            )}
                        </div>
                        <p className="text-center text-sm text-dark-text-secondary h-5">
                            {liveStatus === 'connecting' ? 'Connecting...' : liveStatus === 'listening' ? 'Listening... Speak now.' : 'Press the microphone to begin.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step3Feedback: React.FC<{ data: FeedbackData; onStartShadowing: () => void; onSkip: () => void; }> = ({ data, onStartShadowing, onSkip }) => (
    <div className="animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold text-brand-blue mb-2">STEP 3: Comprehensive Feedback</h2>
        <div className="space-y-4">
            <div><h4 className="font-semibold text-lg">A. Overall Assessment</h4><p className="text-dark-text-secondary">{data.overall_assessment}</p></div>
            <div><h4 className="font-semibold text-lg">B. Points to Praise</h4><ul className="list-disc list-inside text-dark-text-secondary">{data.praise_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
            <div><h4 className="font-semibold text-lg">C. Good Expressions You Used</h4>{data.good_expressions.map((e,i) => <div key={i} className="mt-2 p-2 bg-gray-800/50 rounded-md"><p><strong className="text-brand-yellow">{e.expression}</strong>: {e.reason}</p><em className="text-gray-400">Example: {e.example}</em></div>)}</div>
            <div>
                <h4 className="font-semibold text-lg">D. Suggestions for Improvement</h4>
                <div className="mt-2 space-y-3">
                    <h5 className="font-semibold text-dark-text-primary">Grammar Accuracy</h5>
                    {data.improvement_suggestions.grammar.map((item, i) => <div key={i}><p className="text-red-400 line-through">{item.original}</p><p className="text-green-400">{item.corrected}</p><p className="text-sm text-gray-400">{item.reason}</p></div>)}
                    <h5 className="font-semibold text-dark-text-primary mt-3">Vocabulary & Expressions</h5>
                    {data.improvement_suggestions.vocabulary.map((item, i) => <div key={i}><p className="text-red-400 line-through">{item.original}</p><p className="text-green-400">{item.corrected}</p><p className="text-sm text-gray-400">{item.reason}</p></div>)}
                     <h5 className="font-semibold text-dark-text-primary mt-3">Fluency & Flow</h5>
                    {data.improvement_suggestions.fluency.map((item, i) => <div key={i}><p className="text-green-400">{item.suggestion}</p><p className="text-sm text-gray-400">{item.reason}</p></div>)}
                </div>
            </div>
        </div>
        <p className="text-center mt-6">To help you internalize these corrections, we can have a short shadowing session. Would you be interested?</p>
        <div className="flex gap-4">
             <button onClick={onStartShadowing} className="flex-1 py-3 bg-brand-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors">Yes, let's practice!</button>
             <button onClick={onSkip} className="flex-1 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors">No, thanks.</button>
        </div>
    </div>
);

const Step4Shadowing: React.FC<{ sentences: string[]; currentIndex: number; isAlexSpeaking: boolean; playSentence: () => void; onNext: () => void; }> = ({ sentences, currentIndex, isAlexSpeaking, playSentence, onNext }) => {
    useEffect(() => { playSentence(); }, [currentIndex, playSentence]);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-brand-blue mb-4">STEP 4: Shadowing Practice</h2>
            <p className="text-dark-text-secondary mb-6">Listen to Alex, then repeat the sentence aloud.</p>
            <div className="w-full p-6 bg-gray-800/50 rounded-lg min-h-[100px] flex items-center justify-center">
                <p className="text-xl text-dark-text-primary">{sentences[currentIndex]}</p>
            </div>
            <div className="mt-8 flex gap-4">
                <button onClick={playSentence} disabled={isAlexSpeaking} className="p-4 bg-brand-blue rounded-full text-white shadow-lg disabled:opacity-50 transform hover:scale-105 transition-transform"><PlayIcon /></button>
                <button onClick={onNext} className="p-4 bg-brand-green rounded-full text-white shadow-lg transform hover:scale-105 transition-transform"><CheckIcon /></button>
            </div>
            <p className="text-sm text-dark-text-secondary mt-2">Listen again or confirm you've repeated it.</p>
            <p className="mt-4 font-semibold">{currentIndex + 1} / {sentences.length}</p>
        </div>
    );
};

const Step5Completion: React.FC<{ onRestart: () => void; }> = ({ onRestart }) => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
        <h2 className="text-2xl font-bold text-brand-blue mb-4">Session Complete!</h2>
        <p className="text-lg text-dark-text-secondary">오늘 수준 높은 토론이었어요. 수고 많으셨습니다.</p>
        <p className="mt-6">새로운 주제로 토론을 계속하시겠어요, 아니면 여기까지 할까요?</p>
        <div className="mt-8 flex gap-4">
            <button onClick={onRestart} className="px-6 py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">Start New Topic</button>
        </div>
    </div>
);

const RestartConfirmModal: React.FC<{
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-surface border border-gray-600 rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
                <h3 className="text-2xl font-bold text-brand-yellow mb-4 flex items-center">
                    <span className="mr-2">⚠️</span> 세션 중단 확인
                </h3>
                <p className="text-dark-text-primary mb-2">
                    현재 진행 중인 세션을 중단하고 처음으로 돌아가시겠습니까?
                </p>
                <p className="text-brand-red font-semibold mb-6">
                    진행 상황은 저장되지 않습니다.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-brand-red text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                    >
                        네, 중단할게요
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        아니요, 계속할게요
                    </button>
                </div>
            </div>
        </div>
    );
};
