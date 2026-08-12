'use client';
import { MediaPlayer, MediaProvider, isHLSProvider, MediaProviderAdapter, MediaPlayerInstance, type MediaTimeUpdateEventDetail } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useEffect, useState, useRef } from 'react';
import { getTokenResponse } from '@/stores/token-store';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  onTimeUpdate?: (time: number) => void;
  onEnd?: () => void;
  initialTime?: number;
}

export function VideoPlayer({ src, title, poster, onTimeUpdate, onEnd, initialTime }: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [hasSetInitialTime, setHasSetInitialTime] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function loadToken() {
      const response = await getTokenResponse();
      setToken(response?.accessToken || '');
    }
    loadToken();
  }, []);

  function onProviderChange(provider: MediaProviderAdapter | null) {
    if (isHLSProvider(provider)) {
      if (!provider.config) {
        provider.config = {};
      }
      provider.config.xhrSetup = (xhr: XMLHttpRequest) => {
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      };
    }
  }

  if (token === undefined) {
    return (
      <div className="aspect-video w-full bg-slate-900 animate-pulse rounded-2xl flex items-center justify-center">
        <span className="text-slate-500 font-medium">Đang tải luồng...</span>
      </div>
    );
  }

  function handleCanPlay() {
    if (initialTime && initialTime > 0 && playerRef.current && !hasSetInitialTime) {
      playerRef.current.currentTime = initialTime;
      setHasSetInitialTime(true);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl shadow-xl shadow-indigo-900/10 border border-slate-700/50 bg-black aspect-video w-full ring-1 ring-white/10 relative">
      <MediaPlayer
        ref={playerRef}
        src={src}
        title={title}
        poster={poster}
        viewType="video"
        crossOrigin
        onProviderChange={onProviderChange}
        onCanPlay={handleCanPlay}
        onTimeUpdate={(detail: MediaTimeUpdateEventDetail) => {
          if (onTimeUpdate) {
            onTimeUpdate(detail.currentTime);
          }
        }}
        onEnd={onEnd}
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
