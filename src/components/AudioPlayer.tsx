import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { proceduralAudio } from '../utils/audioSynth';

interface AudioPlayerProps {
  title: string;
  artistName?: string;
  audioUrl?: string;
  synthPreset?: 'bansuri' | 'sitar' | 'harmonium' | 'guitar' | 'tanpura' | 'ambient';
  duration?: string;
  compact?: boolean;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title,
  artistName,
  audioUrl,
  synthPreset = 'bansuri',
  duration = '2:45',
  compact = false,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(165); // default ~2:45
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopSynthRef = useRef<(() => void) | null>(null);

  // Parse duration string like "2:45"
  useEffect(() => {
    if (duration) {
      const parts = duration.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setTotalSeconds(parts[0] * 60 + parts[1]);
      }
    }
  }, [duration]);

  // Handle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      // Stop
      if (audioUrl && audioRef.current) {
        audioRef.current.pause();
      } else if (stopSynthRef.current) {
        stopSynthRef.current();
        stopSynthRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start
      if (audioUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setCurrentTime(0);
          };
          audioRef.current.ontimeupdate = () => {
            if (audioRef.current) {
              setCurrentTime(Math.floor(audioRef.current.currentTime));
            }
          };
        }
        audioRef.current.play().catch(() => {});
      } else {
        // Use procedural audio synth
        stopSynthRef.current = proceduralAudio.playPreset(synthPreset, () => {
          setIsPlaying(false);
        });
      }
      setIsPlaying(true);
    }
  };

  // Timer simulation for synth preset if no real audio element
  useEffect(() => {
    let interval: number;
    if (isPlaying && !audioUrl) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            if (stopSynthRef.current) stopSynthRef.current();
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, audioUrl, totalSeconds]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stopSynthRef.current) stopSynthRef.current();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 bg-[#F2EAE0] px-3 py-1.5 rounded border border-[#E2D5C3] ${className}`}>
        <button
          onClick={togglePlay}
          className="w-7 h-7 rounded-full bg-[#7A131B] text-white flex items-center justify-center hover:bg-[#8C1620] transition-colors cursor-pointer shrink-0"
          aria-label={isPlaying ? 'Pause snippet' : 'Play snippet'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-stone-900 truncate">{title}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-700">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{duration}</span>
            {isPlaying && (
              <span className="flex items-center gap-0.5 ml-2">
                <span className="w-1 h-2 bg-[#7A131B] animate-pulse" />
                <span className="w-1 h-3.5 bg-[#7A131B] animate-bounce" />
                <span className="w-1 h-1.5 bg-[#7A131B] animate-pulse" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg bg-[#F5EFE6] border border-[#E5D9C8] paper-card ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#7A131B] text-white flex items-center justify-center hover:bg-[#8C1620] shadow-sm transition-all duration-150 cursor-pointer shrink-0 active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 leading-tight">{title}</h4>
            {artistName && <p className="text-xs text-stone-700 mt-0.5">{artistName}</p>}
          </div>
        </div>

        {/* Dynamic Waveform Graphic */}
        <div className="flex items-end gap-1 h-6 px-2">
          {[4, 12, 18, 8, 22, 14, 24, 16, 20, 10, 14, 6].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPlaying ? 'bg-[#7A131B]' : 'bg-[#D6C7B2]'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (height * ((currentTime % 5) + 1)) / 3)}px` : `${height / 2}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrubber slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={totalSeconds}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#E2D5C3] rounded-lg appearance-none cursor-pointer accent-[#7A131B]"
        />
        <div className="flex justify-between text-[11px] text-stone-700 font-mono tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};
