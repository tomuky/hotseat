"use client";

import { useCallback, useRef, useState } from "react";

export function useMusicPlayer() {
  const audioRef = useRef(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isLooping, setIsLoopingState] = useState(false);
  const [volume, setVolumeState] = useState(0.9);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.addEventListener("ended", () => {
        if (!audio.loop) {
          setCurrentTrackId(null);
        }
      });
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const toggle = useCallback(
    (track) => {
      const audio = getAudio();

      if (currentTrackId === track.id) {
        audio.pause();
        audio.currentTime = 0;
        setCurrentTrackId(null);
        return;
      }

      audio.pause();
      audio.src = track.src;
      audio.loop = isLooping;
      audio.volume = volume;
      setCurrentTrackId(track.id);
      audio.play().catch(() => {
        setCurrentTrackId(null);
      });
    },
    [currentTrackId, getAudio, isLooping, volume]
  );

  const setLooping = useCallback(
    (loop) => {
      setIsLoopingState(loop);
      if (audioRef.current) {
        audioRef.current.loop = loop;
      }
    },
    []
  );

  const setVolume = useCallback((v) => {
    const next = Math.min(1, Math.max(0, v));
    setVolumeState(next);
    if (audioRef.current) {
      audioRef.current.volume = next;
    }
  }, []);

  return {
    currentTrackId,
    isLooping,
    volume,
    toggle,
    setLooping,
    setVolume,
  };
}
