"use client";

import { Repeat } from "lucide-react";

export default function LoopToggle({ isOn, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isOn}
      aria-label={isOn ? "Loop on" : "Loop off"}
      className={[
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 ease-out active:scale-[0.97] active:duration-100",
        isOn
          ? "border-amber-500 bg-[#1a1a1a] text-amber-500"
          : "border-[#2a2a2a] bg-[#1a1a1a] text-neutral-500 hover:border-neutral-600 hover:text-neutral-400",
      ].join(" ")}
    >
      <Repeat className="h-5 w-5" />
    </button>
  );
}
