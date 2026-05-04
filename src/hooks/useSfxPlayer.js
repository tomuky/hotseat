"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/** useLayoutEffect is skipped on the server; avoids SSR warnings while warming before paint on the client. */
const useWarmOnClient =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * @typedef {{ src: string; audio: HTMLAudioElement }} SfxCacheEntry
 */

function createWarmedAudio(src, volume) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = volume;
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
  const [volume, setVolumeState] = useState(0.8);

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
          audio: createWarmedAudio(clip.src, volume),
        });
      } else {
        existing.audio.volume = volume;
      }
    }

    for (const id of [...cache.keys()]) {
      if (!nextIds.has(id)) {
        disposeEntry(cache.get(id));
        cache.delete(id);
      }
    }
  }, [sfxClips, volume]);

  const setVolume = useCallback((v) => {
    const next = Math.min(1, Math.max(0, v));
    setVolumeState(next);
    for (const entry of cacheRef.current.values()) {
      entry.audio.volume = next;
    }
  }, []);

  const play = useCallback(
    (clip) => {
      const cache = cacheRef.current;
      let entry = cache.get(clip.id);
      if (!entry || entry.src !== clip.src) {
        if (entry) {
          disposeEntry(entry);
        }
        entry = { src: clip.src, audio: createWarmedAudio(clip.src, volume) };
        cache.set(clip.id, entry);
      }
      const { audio } = entry;
      audio.volume = volume;
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    },
    [volume]
  );

  return { play, volume, setVolume };
}
