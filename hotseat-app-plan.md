# Hotseat Interrogation Soundboard — Build Plan

A simple, mobile-first single-page Next.js web app for playing background music and sound effects during a "hotseat interrogation" session. Two independent audio tracks: one music track (only one song at a time, tap-to-play, tap-again-to-stop) and one SFX track (quick clips that don't interrupt music).

---

## 1. Tech Stack

- **Framework:** Next.js 15 (App Router) with **JavaScript (no TypeScript)**
- **Styling:** Tailwind CSS v4
- **UI primitives:** Just plain React + Tailwind. No component library needed — keep it lean.
- **Icons:** `lucide-react` (only what's used)
- **Audio:** Native HTML5 `Audio` API via React refs. No external audio library — overkill for this use case.
- **State:** Local React state only. No global state lib, no persistence.
- **Deployment:** Vercel (zero config — just push to GitHub and import)

> **Setup note:** When running `create-next-app`, answer **No** to the TypeScript prompt. All files will use `.js` / `.jsx` extensions, no `tsconfig.json`, and JSDoc comments where type info is genuinely useful.

---

## 2. Project Structure

```
hotseat/
├── public/
│   ├── music/              # Hardcoded music files (mp3 preferred, m4a/ogg fine)
│   │   ├── tension.mp3
│   │   ├── interrogation.mp3
│   │   └── ...
│   └── sfx/                # Hardcoded sound effect files
│       ├── buzzer.mp3
│       ├── ding.mp3
│       └── ...
├── src/
│   ├── app/
│   │   ├── layout.js       # Root layout, dark theme, viewport meta
│   │   ├── page.js         # The single page — composes everything
│   │   └── globals.css     # Tailwind + a few custom CSS vars
│   ├── components/
│   │   ├── MusicButton.jsx
│   │   ├── SfxButton.jsx
│   │   ├── VolumeSlider.jsx
│   │   └── LoopToggle.jsx
│   ├── hooks/
│   │   ├── useMusicPlayer.js   # Manages the single music Audio element
│   │   └── useSfxPlayer.js     # Manages SFX playback (multiple concurrent OK)
│   └── lib/
│       └── tracks.js       # Hardcoded config: music tracks + sfx clips
├── package.json
├── jsconfig.json           # For path aliases like "@/..."
├── tailwind.config.js
├── next.config.mjs
└── README.md
```

**`jsconfig.json`** (enables `@/` import alias):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## 3. Audio Configuration File

Single source of truth for what shows up in the UI. Editing this file + dropping a file into `/public` is the entire workflow for adding tracks.

**`src/lib/tracks.js`**

```js
/**
 * @typedef {Object} MusicTrack
 * @property {string} id
 * @property {string} label   - Short label that fits on a button (1-3 words)
 * @property {string} src     - Path under /public, e.g. "/music/tension.mp3"
 */

/**
 * @typedef {Object} SfxClip
 * @property {string} id
 * @property {string} label
 * @property {string} src
 */

/** @type {MusicTrack[]} */
export const MUSIC_TRACKS = [
  { id: "tension",       label: "Tension",       src: "/music/tension.mp3" },
  { id: "interrogation", label: "Interrogation", src: "/music/interrogation.mp3" },
  // Add more here. Long files (10-20 min) work fine — they stream.
];

/** @type {SfxClip[]} */
export const SFX_CLIPS = [
  { id: "buzzer", label: "Buzzer", src: "/sfx/buzzer.mp3" },
  { id: "ding",   label: "Ding",   src: "/sfx/ding.mp3" },
  // 2-6 clips total
];
```

---

## 4. Audio Behavior — The Two Tracks

### Music track (one at a time, tap-to-toggle)

- Exactly **one** `HTMLAudioElement` is reused for music. When the user taps a music button:
  - If it's the currently-playing track → stop it (pause + reset `currentTime` to 0).
  - If a different track is playing → swap the `src`, then play the new one.
  - If nothing is playing → play it.
- Loop state is read from the audio element's `loop` property and toggled via the loop button.
- Volume is 0–1, applied to the music audio element only.
- `preload="metadata"` so we don't pre-download 20-minute files.

### SFX track (fire-and-forget, non-blocking)

- Each SFX tap creates (or clones) an `Audio` instance and plays it. This means rapid taps can overlap — that's fine and arguably desirable for sound effects.
- SFX never touches the music element.
- SFX volume is independent (kept at a fixed sensible level like `0.8` — no second slider per the simple-is-key spec).

### iOS / mobile gotchas (important — handle these or it'll feel broken)

1. **Autoplay is blocked.** Audio can only start in response to a user gesture. Since every play is initiated by a tap, this is fine — but **don't** try to preload-and-play on mount.
2. **Silent switch on iOS** silences HTML audio by default. The simplest workaround: don't worry about it for v1, since the user will be using this deliberately with the ringer on. Document this in the README.
3. **Audio unlock:** Some iOS Safari versions require the audio element to have been `.play()`'d once before further programmatic plays work reliably. Initial tap solves this naturally.
4. **Lock screen / background:** When the screen locks, audio may pause. For a 10–20 min music track this matters. Add this to the layout:
   ```jsx
   <meta name="apple-mobile-web-app-capable" content="yes" />
   ```
   And consider a "keep awake" using the Wake Lock API as a stretch goal (see §8).

---

## 5. Visual Design

### Aesthetic: dark, moody, "interrogation room"

- **Background:** Near-black (`#0a0a0a`) with a very subtle vignette or radial gradient toward a dim red/amber center to evoke a desk lamp. Keep it understated — not Halloween-themed.
- **Typography:** System font stack, slightly tracked uppercase for labels. Buttons can use a heavier weight.
- **Palette:**
  - Background: `#0a0a0a`
  - Surface (button idle): `#1a1a1a` with a 1px border `#2a2a2a`
  - Text: `#e5e5e5`
  - Muted text: `#737373`
  - Accent (active/playing): a warm amber `#f59e0b` — feels like a hot interrogation lamp, not a generic red
  - SFX accent (on tap flash): subtle white flash, no color
- **Motion:** Spring/ease transitions ~150ms. Active music button has a slow breathing pulse (2s ease-in-out, opacity/glow oscillating gently) so it's obvious what's playing across the room.

### Layout (mobile-first, single column, no scrolling needed for typical case)

```
┌─────────────────────────────┐
│      HOTSEAT  [vol icon]    │  ← Tiny header, app title + volume icon
│                             │
│  ┌───────────────────────┐  │
│  │      MUSIC            │  │  ← Section label (small, uppercase, muted)
│  │  ┌────────┬────────┐  │  │
│  │  │Tension │Interro-│  │  │  ← Big tap targets (min 64px tall)
│  │  │  ●     │gation  │  │  │     Active one glows amber + pulses
│  │  └────────┴────────┘  │  │
│  │  ┌────────┬────────┐  │  │
│  │  │  ...   │  ...   │  │  │
│  │  └────────┴────────┘  │  │
│  │                       │  │
│  │  [🔁 Loop]  ▬▬●▬▬▬   │  │  ← Loop toggle + volume slider
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      SFX              │  │
│  │  ┌────┬────┬────┐     │  │
│  │  │Buzz│Ding│ ...│     │  │  ← Smaller buttons, 3-col grid
│  │  └────┴────┴────┘     │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Button states
- **Idle:** dark surface, light text, thin border
- **Pressed (active tap):** scale to 0.97 for 100ms — tactile feel
- **Playing (music only):** amber border + amber text + soft amber glow (`box-shadow: 0 0 24px rgba(245,158,11,0.35)`) + slow pulse animation
- **Loop toggle on:** amber accent, otherwise muted
- **Touch targets:** absolute minimum 56px tall on mobile, ideally 64px+. Wide enough that thumbs don't miss.

### Anti-patterns to avoid
- No emoji in button labels (looks dated, distracting)
- No glassmorphism / gradients on buttons (cheapens it)
- No animated backgrounds (distracting, eats battery)
- No tooltips on mobile (useless on touch)

---

## 6. Component Specs

### `useMusicPlayer.js`

Returns an object:
```js
{
  currentTrackId,   // string | null
  isLooping,        // boolean
  volume,           // number 0..1
  toggle(track),    // (MusicTrack) => void
  setLooping(loop), // (boolean) => void
  setVolume(v),     // (number) => void
}
```

**Implementation notes:**
- One `useRef(null)` holding the `HTMLAudioElement` — instantiate lazily on first interaction (dodges SSR + autoplay issues). Use a small helper like `getAudio()` inside the hook that returns the existing ref or creates one.
- On `toggle(track)`:
  - If the requested track is the one currently playing → call `.pause()`, set `currentTime = 0`, set `currentTrackId = null`.
  - Else → set `audio.src = track.src`, apply current `loop` and `volume`, call `.play()`, set `currentTrackId = track.id`.
- Listen for the `ended` event → if not looping, set `currentTrackId = null` so the UI updates.
- `setLooping` updates both state and `audio.loop` live.
- `setVolume` updates both state and `audio.volume` live.

### `useSfxPlayer.js`

Returns:
```js
{ play(clip) }   // (SfxClip) => void
```

**Implementation notes:**
- For each play: instantiate a fresh `new Audio(clip.src)` (or clone a cached one for perf). Set `.volume = 0.8`, call `.play().catch(() => {})` to swallow any unhandled rejection. Don't track state — fire and forget.
- Browser will GC the Audio objects after they finish.
- Optionally cache one preloaded `Audio` per clip in a `useRef(new Map())` and `.cloneNode()` on each play to avoid re-fetching for short clips.

### `MusicButton.jsx`

Props: `{ track, isPlaying, onToggle }`.

Renders a button with the label. Applies "playing" styles when `isPlaying`. The whole grid of music buttons is built in `page.js` by mapping `MUSIC_TRACKS`.

### `SfxButton.jsx`

Props: `{ clip, onPlay }`.

Brief flash animation on tap (use a CSS class toggle with a `setTimeout` to remove it, or a key-based remount on the flash element). No persistent active state — these are momentary.

### `VolumeSlider.jsx`

A native `<input type="range" min="0" max="1" step="0.01">` styled with Tailwind. Native range inputs handle touch correctly and are accessible. Show a small speaker icon next to it.

Props: `{ value, onChange }`.

### `LoopToggle.jsx`

A button that flips an `isLooping` boolean. Shows the loop icon (`Repeat` from `lucide-react`), tinted amber when on, muted when off.

Props: `{ isOn, onToggle }`.

---

## 7. Page Composition (`src/app/page.js`)

```jsx
"use client";

import { MUSIC_TRACKS, SFX_CLIPS } from "@/lib/tracks";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useSfxPlayer } from "@/hooks/useSfxPlayer";
import MusicButton from "@/components/MusicButton";
import SfxButton from "@/components/SfxButton";
import VolumeSlider from "@/components/VolumeSlider";
import LoopToggle from "@/components/LoopToggle";

export default function Home() {
  const music = useMusicPlayer();
  const sfx = useSfxPlayer();

  return (
    <main className="min-h-dvh bg-[#0a0a0a] text-neutral-200 p-4 sm:p-6 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Hotseat
        </h1>
      </header>

      <section className="mb-8">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
          Music
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {MUSIC_TRACKS.map((t) => (
            <MusicButton
              key={t.id}
              track={t}
              isPlaying={music.currentTrackId === t.id}
              onToggle={() => music.toggle(t)}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <LoopToggle isOn={music.isLooping} onToggle={() => music.setLooping(!music.isLooping)} />
          <VolumeSlider value={music.volume} onChange={music.setVolume} />
        </div>
      </section>

      <section>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
          Sound Effects
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {SFX_CLIPS.map((c) => (
            <SfxButton key={c.id} clip={c} onPlay={() => sfx.play(c)} />
          ))}
        </div>
      </section>
    </main>
  );
}
```

---

## 8. Stretch goals (only if quick — skip if any friction)

- **Wake Lock API** to keep the screen awake during a session. Roughly:
  ```js
  navigator.wakeLock?.request("screen")
  ```
  Wrap in a try/catch. Acquire on first music play, release on stop/unmount.
- **PWA-ish meta tags** so it can be added to home screen and feels app-like:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="theme-color" content="#0a0a0a" />
  ```
- **Manifest.json** for full PWA install (icons, name, etc.) — nice to have, not required.

---

## 9. README content (write this for future-you)

Cover:
- What the app is (1 sentence)
- How to add a new music track: drop file in `/public/music`, add entry to `src/lib/tracks.js`, redeploy
- Same for SFX
- Keep music files compressed (128 kbps mp3 is plenty for ambience). 20 min @ 128 kbps ≈ 19 MB — Vercel can serve it but every cold load has to download metadata, so don't bloat unnecessarily.
- Note about iOS silent switch + ringer
- Vercel deploy: connect GitHub repo, framework auto-detected, no env vars needed

---

## 10. Build order (suggested for the LLM doing the work)

1. `npx create-next-app@latest hotseat` — answer **No** to TypeScript, **Yes** to Tailwind, **Yes** to App Router, **Yes** to `src/` dir, **Yes** to import alias (`@/*`)
2. Install `lucide-react`: `npm i lucide-react`
3. Create `src/lib/tracks.js` with placeholder entries pointing at non-existent files (you will drop real files in later)
4. Build `useMusicPlayer` hook + verify with one button in `page.js`
5. Build `useSfxPlayer` hook
6. Build `MusicButton`, `SfxButton`, `LoopToggle`, `VolumeSlider`
7. Compose `page.js`
8. Apply dark aesthetic, pulse animation on active music button, tap-flash on SFX
9. Add iOS meta tags in `layout.js`
10. Test on mobile (Vercel preview deploy + open on phone) — this is THE test, desktop testing won't catch the issues
11. Write README

---

## 11. Acceptance checklist

- [ ] All files are `.js` / `.jsx` — no `.ts` / `.tsx`, no `tsconfig.json`
- [ ] Tapping a music button starts that track; tapping it again stops it
- [ ] Tapping a different music button while one is playing swaps cleanly to the new track
- [ ] The currently-playing music button has a clear, persistent visual indicator (amber glow + pulse)
- [ ] Loop toggle correctly loops the current track when on; track ends naturally when off
- [ ] Volume slider adjusts music volume in real time, no clicks/pops
- [ ] SFX taps play immediately, can overlap, and never interrupt music
- [ ] Works on iOS Safari and Android Chrome — buttons are easy to hit, audio plays reliably
- [ ] No layout shift, no scroll on a typical phone for 4 music + 6 SFX buttons
- [ ] Looks clean and intentional, not generic-AI-app
