"use client";

import { Volume2 } from "lucide-react";

export default function VolumeSlider({ value, onChange }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Volume2 className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
      <label className="sr-only" htmlFor="music-volume">
        Music volume
      </label>
      <input
        id="music-volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full min-w-0 flex-1 cursor-pointer accent-amber-500"
      />
    </div>
  );
}
