"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** useLayoutEffect is skipped on the server; avoids SSR warnings while warming before paint on the client. */
const useWarmOnClient =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SFX_VOLUME = 0.8;

/**
 * @typedef {{ src: string; audio: HTMLAudioElement }} SfxCacheEntry
 */

function createWarmedAudio(src) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = SFX_VOLUME;
  audio.src = src;
  audio.load();
  return audio;
}

function disposeEntry(entry) {
  entry.audio.pause();
  entry.audio.src = "";
  entry.audio.load();
}

/**
 * Preloads one element per SFX clip so clicks reuse decoded media instead of
 * constructing a new Audio() every time (which re-triggers fetch/decode).
 * @param {{ id: string; src: string; label: string }[]} sfxClips
 */
export function useSfxPlayer(sfxClips) {
  /** @type {React.MutableRefObject<Map<string, SfxCacheEntry>>} */
  const cacheRef = useRef(new Map());

  useWarmOnClient(() => {
    const cache = cacheRef.current;
    const nextIds = new Set(sfxClips.map((c) => c.id));

    for (const clip of sfxClips) {
      const existing = cache.get(clip.id);
      if (!existing || existing.src !== clip.src) {
        if (existing) {
          disposeEntry(existing);
        }
        cache.set(clip.id, {
          src: clip.src,
          audio: createWarmedAudio(clip.src),
        });
      }
    }

    for (const id of [...cache.keys()]) {
      if (!nextIds.has(id)) {
        disposeEntry(cache.get(id));
        cache.delete(id);
      }
    }
  }, [sfxClips]);

  const play = useCallback((clip) => {
    const cache = cacheRef.current;
    let entry = cache.get(clip.id);
    if (!entry || entry.src !== clip.src) {
      if (entry) {
        disposeEntry(entry);
      }
      entry = { src: clip.src, audio: createWarmedAudio(clip.src) };
      cache.set(clip.id, entry);
    }
    const { audio } = entry;
    audio.volume = SFX_VOLUME;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, []);

  return { play };
}
