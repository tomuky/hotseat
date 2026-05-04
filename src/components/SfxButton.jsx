"use client";

import { useCallback, useState } from "react";

export default function SfxButton({ clip, onPlay }) {
  const [flash, setFlash] = useState(false);

  const handleClick = useCallback(() => {
    onPlay();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 140);
  }, [onPlay]);

  return (
    <button
      type="button"
      title={clip.id}
      onClick={handleClick}
      className={[
        "min-h-14 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-1.5 py-2 text-center text-[10px] font-semibold uppercase leading-snug tracking-wide text-[#e5e5e5] transition-all duration-150 ease-out active:scale-[0.97] active:duration-100 break-words hyphens-auto",
        flash ? "sfx-flash" : "hover:border-neutral-600",
      ].join(" ")}
    >
      {clip.label}
    </button>
  );
}
