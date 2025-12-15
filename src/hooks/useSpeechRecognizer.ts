import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emit, listen, UnlistenFn } from '@tauri-apps/api/event';
import { evaluatePhonicsMatch, MatchStatus } from '../lib/phonicsMatching';

export type SpeechRecognizerStatus =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'processing'
  | 'error'
  | 'unavailable';

interface UseSpeechRecognizerOptions {
  expectedUtterances: string[];
  language?: string;
  autoStart?: boolean;
  enabled?: boolean;
}

interface UseSpeechRecognizerResult {
  supportsSpeech: boolean;
  status: SpeechRecognizerStatus;
  partialTranscript: string;
  finalTranscript: string;
  matchStatus: MatchStatus;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

type NativeSpeechEvent =
  | { type: 'status'; status: string }
  | { type: 'partial'; transcript: string }
  | { type: 'final'; transcript: string }
  | { type: 'error'; message: string };

const TAURI_EVENT = 'phonics://speech';

const isTauriAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const candidate = window as Window &
    { __TAURI_IPC__?: unknown; __TAURI_INTERNALS__?: unknown };
  return (
    typeof candidate.__TAURI_IPC__ === 'function' ||
    typeof candidate.__TAURI_INTERNALS__ === 'object'
  );
};

const useIsTauriRuntime = (): boolean => {
  const [isAvailable, setIsAvailable] = useState(isTauriAvailable());

  useEffect(() => {
    if (isAvailable) {
      return;
    }
    let raf: number | null = null;
    const check = () => {
      if (isTauriAvailable()) {
        setIsAvailable(true);
        if (raf !== null) {
          window.cancelAnimationFrame(raf);
        }
        return;
      }
      raf = window.requestAnimationFrame(check);
    };
    raf = window.requestAnimationFrame(check);
    return () => {
      if (raf !== null) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [isAvailable]);

  return isAvailable;
};

const getRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

const useBrowserSpeechRecognizer = ({
  expectedUtterances,
  language = 'en-US',
  autoStart = false,
  enabled = true,
}: UseSpeechRecognizerOptions): UseSpeechRecognizerResult => {
  const recognitionCtor = useMemo(getRecognitionConstructor, []);
  const supportsSpeech = Boolean(recognitionCtor) && enabled;
  const recognitionRef = useRef<BasicSpeechRecognition | null>(null);
  const expectedKey = useMemo(
    () => expectedUtterances.map((value) => value?.toLowerCase().trim()).join('|'),
    [expectedUtterances],
  );
  const expectedRef = useRef<string[]>(expectedUtterances);

  useEffect(() => {
    expectedRef.current = expectedUtterances;
  }, [expectedKey, expectedUtterances]);

  const [status, setStatus] = useState<SpeechRecognizerStatus>(() =>
    supportsSpeech ? 'idle' : 'unavailable',
  );
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.onstart = null;
    try {
      recognition.stop();
    } catch {
      recognition.abort();
    }
    recognitionRef.current = null;
    setStatus((prev) => {
      if (prev === 'unavailable') return prev;
      return 'idle';
    });
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const startListening = useCallback(() => {
    if (!supportsSpeech || !recognitionCtor || !enabled || expectedRef.current.length === 0) {
      if (!supportsSpeech) {
        setStatus('unavailable');
      }
      return;
    }
    stopListening();
    try {
      const recognition = new recognitionCtor();
      recognitionRef.current = recognition;
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.onstart = () => {
        setStatus('listening');
        setErrorMessage(null);
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let latestPartial = '';
        let latestFinal = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results.item(i);
          if (!result) continue;
          const alternative = result.item(0);
          const transcript = alternative?.transcript?.trim();
          if (!transcript) continue;
          if (result.isFinal) {
            latestFinal = transcript;
          } else {
            latestPartial = transcript;
          }
        }
        if (latestPartial) {
          setPartialTranscript(latestPartial);
        }
        if (latestFinal) {
          setFinalTranscript(latestFinal);
          setPartialTranscript('');
          setStatus('processing');
        }
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setStatus('error');
        setErrorMessage(event.message ?? event.error ?? 'Speech recognition error');
      };
      recognition.onend = () => {
        setStatus((prev) => {
          if (prev === 'error' || prev === 'unavailable') {
            return prev;
          }
          return 'idle';
        });
      };
      recognition.start();
      setStatus('starting');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to start speech recognition',
      );
    }
  }, [enabled, language, recognitionCtor, stopListening, supportsSpeech]);

  const reset = useCallback(() => {
    stopListening();
    setPartialTranscript('');
    setFinalTranscript('');
    setMatchStatus('none');
    setErrorMessage(null);
    setStatus((prev) => {
      if (!supportsSpeech) return 'unavailable';
      if (!enabled) return 'idle';
      return prev === 'error' ? 'idle' : prev;
    });
  }, [enabled, stopListening, supportsSpeech]);

  useEffect(() => {
    if (!enabled) {
      stopListening();
      setStatus((prev) => (prev === 'unavailable' ? prev : 'idle'));
      return;
    }
    if (!autoStart || expectedRef.current.length === 0) {
      return;
    }
    startListening();
    return () => {
      stopListening();
    };
  }, [autoStart, enabled, expectedKey, startListening, stopListening]);

  useEffect(() => {
    const transcriptSource = finalTranscript || partialTranscript;
    const match = evaluatePhonicsMatch(transcriptSource, expectedRef.current);
    setMatchStatus(match);
  }, [finalTranscript, partialTranscript, expectedKey]);

  return {
    supportsSpeech,
    status,
    partialTranscript,
    finalTranscript,
    matchStatus,
    errorMessage,
    startListening,
    stopListening,
    reset,
  };
};

const mapNativeStatus = (value: string): SpeechRecognizerStatus => {
  switch (value) {
    case 'starting':
      return 'starting';
    case 'listening':
      return 'listening';
    case 'processing':
      return 'processing';
    case 'unavailable':
      return 'unavailable';
    case 'error':
      return 'error';
    default:
      return 'idle';
  }
};

const useNativeSpeechRecognizer = (
  { expectedUtterances, autoStart = false }: UseSpeechRecognizerOptions,
  enabled: boolean,
): UseSpeechRecognizerResult | null => {
  const expectedKey = useMemo(
    () => expectedUtterances.map((value) => value?.toLowerCase().trim()).join('|'),
    [expectedUtterances],
  );
  const expectedRef = useRef<string[]>(expectedUtterances);
  useEffect(() => {
    expectedRef.current = expectedUtterances;
  }, [expectedKey, expectedUtterances]);

  const [status, setStatus] = useState<SpeechRecognizerStatus>(() =>
    enabled ? 'idle' : 'unavailable',
  );
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supportsSpeech = enabled;

  useEffect(() => {
    if (!enabled) {
      setStatus('unavailable');
      return;
    }
    let unlisten: UnlistenFn | null = null;
    let disposed = false;

    const setup = async () => {
      try {
        unlisten = await listen<NativeSpeechEvent>(TAURI_EVENT, (event) => {
          const payload = event.payload;
          switch (payload.type) {
            case 'status': {
              if (payload.status === 'permission_denied') {
                setStatus('error');
                setErrorMessage('Microphone or speech permissions denied.');
              } else {
                setStatus(mapNativeStatus(payload.status));
                if (payload.status === 'idle') {
                  setPartialTranscript('');
                }
              }
              break;
            }
            case 'partial': {
              setPartialTranscript(payload.transcript);
              break;
            }
            case 'final': {
              setFinalTranscript(payload.transcript);
              setPartialTranscript('');
              setStatus('processing');
              break;
            }
            case 'error': {
              setStatus('error');
              setErrorMessage(payload.message);
              break;
            }
            default:
              break;
          }
        });
      } catch (error) {
        if (!disposed) {
          setStatus('error');
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to listen for speech events.',
          );
        }
      }
    };

    setup();

    return () => {
      disposed = true;
      if (unlisten) {
        unlisten();
      }
      void emit('phonics://speech:stop').catch(() => {});
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const transcriptSource = finalTranscript || partialTranscript;
    const match = evaluatePhonicsMatch(transcriptSource, expectedRef.current);
    setMatchStatus(match);
  }, [enabled, finalTranscript, partialTranscript, expectedKey]);

  const startListening = useCallback(() => {
    if (!enabled) return;
    if (expectedRef.current.length === 0) {
      setErrorMessage('No phonics targets available.');
      setStatus('error');
      return;
    }
    setErrorMessage(null);
    setFinalTranscript('');
    setPartialTranscript('');
    setStatus('starting');
    void emit('phonics://speech:start', {
      expectedUtterances: expectedRef.current,
    }).catch((error) => {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : String(error));
    });
  }, [enabled]);

  const stopListening = useCallback(() => {
    if (!enabled) return;
    void emit('phonics://speech:stop').catch(() => {});
  }, [enabled]);

  const reset = useCallback(() => {
    if (!enabled) return;
    setPartialTranscript('');
    setFinalTranscript('');
    setMatchStatus('none');
    setErrorMessage(null);
    setStatus('idle');
    void emit('phonics://speech:stop').catch(() => {});
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !autoStart) return;
    startListening();
    return () => {
      stopListening();
    };
  }, [autoStart, enabled, expectedKey, startListening, stopListening]);

  if (!enabled) {
    return null;
  }

  return {
    supportsSpeech,
    status,
    partialTranscript,
    finalTranscript,
    matchStatus,
    errorMessage,
    startListening,
    stopListening,
    reset,
  };
};

export const useSpeechRecognizer = (
  options: UseSpeechRecognizerOptions,
): UseSpeechRecognizerResult => {
  const isTauriRuntime = useIsTauriRuntime();
  const browserRecognizer = useBrowserSpeechRecognizer(options);
  const nativeRecognizer = useNativeSpeechRecognizer(options, isTauriRuntime);
  return nativeRecognizer ?? browserRecognizer;
};
