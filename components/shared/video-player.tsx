'use client';
import { MediaPlayer, MediaProvider, isHLSProvider, MediaProviderChangeEvent, MediaProviderAdapter } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useEffect, useState } from 'react';
import { getTokenResponse } from '@/stores/token-store';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function loadToken() {
      const response = await getTokenResponse();
      setToken(response?.accessToken || '');
    }
    loadToken();
  }, []);

  function onProviderChange(provider: MediaProviderAdapter | null, nativeEvent: MediaProviderChangeEvent) {
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

  return (
    <div className="overflow-hidden rounded-2xl shadow-xl shadow-indigo-900/10 border border-slate-700/50 bg-black aspect-video w-full ring-1 ring-white/10 relative">
      <MediaPlayer
        src={src}
        title={title}
        poster={poster}
        viewType="video"
        crossOrigin
        onProviderChange={onProviderChange}
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
