import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';

type PlaybackStatus = 'idle' | 'playing' | 'error';
type ActivePlayback = { audio: HTMLAudioElement; stop: () => void };

let activePlayback: ActivePlayback | null = null;

export function AudioButton({ src, label }: { src: string; label: string }) {
  const { t } = useLanguage();
  const { settings } = useProgress();
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    if (activePlayback?.audio === audio) activePlayback = null;
    audioRef.current = null;
    setStatus('idle');
  };

  useEffect(() => () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (activePlayback?.audio === audio) activePlayback = null;
  }, []);

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (status === 'playing') {
      stop();
      return;
    }
    activePlayback?.stop();
    const audio = new Audio(src);
    audio.playbackRate = settings.slowAudio ? 0.8 : 1;
    audioRef.current = audio;
    const finish = () => {
      if (activePlayback?.audio === audio) activePlayback = null;
      if (audioRef.current === audio) audioRef.current = null;
      setStatus('idle');
    };
    audio.addEventListener('ended', finish, { once: true });
    activePlayback = { audio, stop };
    setStatus('playing');
    void audio.play().catch(() => {
      finish();
      setStatus('error');
    });
  };

  const action = status === 'playing' ? t('Parar áudio', 'Остановить аудио') : t('Ouvir', 'Прослушать');
  return (
    <button
      type="button"
      className={`audio-button ${status}`}
      onClick={toggle}
      aria-label={`${action}: ${label}`}
      title={`${action}: ${label}`}
      aria-pressed={status === 'playing'}
    >
      <Volume2 size={16} aria-hidden="true" />
    </button>
  );
}
