"use client";

export default function MusicButton({ track, isPlaying, onToggle }) {
  return (
    <button
      type="button"
      title={track.id}
      onClick={onToggle}
      className={[
        "min-h-16 rounded-lg border px-2 py-3 text-center text-xs font-semibold uppercase leading-snug tracking-wide transition-all duration-150 ease-out active:scale-[0.97] active:duration-100 break-words hyphens-auto",
        "border-[#2a2a2a] bg-[#1a1a1a] text-[#e5e5e5]",
        isPlaying
          ? "music-playing border-amber-500 text-amber-500"
          : "hover:border-neutral-600",
      ].join(" ")}
    >
      {track.label}
    </button>
  );
}
