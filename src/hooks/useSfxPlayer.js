"use client";

import { useCallback } from "react";

const SFX_VOLUME = 0.8;

export function useSfxPlayer() {
  const play = useCallback((clip) => {
    const audio = new Audio(clip.src);
    audio.volume = SFX_VOLUME;
    audio.play().catch(() => {});
  }, []);

  return { play };
}
