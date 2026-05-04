"use client";

import LoopToggle from "@/components/LoopToggle";
import MusicButton from "@/components/MusicButton";
import SfxButton from "@/components/SfxButton";
import VolumeSlider from "@/components/VolumeSlider";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useSfxPlayer } from "@/hooks/useSfxPlayer";

export default function HotseatClient({ musicTracks, sfxClips }) {
  const music = useMusicPlayer();
  const sfx = useSfxPlayer();

  return (
    <main className="hotseat-root min-h-dvh p-4 text-neutral-200 sm:p-6">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Hotseat
          </h1>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Music
          </h2>
          {musicTracks.length === 0 ? (
            <p className="mb-4 rounded-lg border border-dashed border-[#2a2a2a] bg-[#141414] px-3 py-4 text-sm text-neutral-500">
              No playable files in{" "}
              <code className="text-neutral-400">public/music/</code>. Add
              audio files (any extension or none), then refresh.
            </p>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-3">
              {musicTracks.map((t) => (
                <MusicButton
                  key={t.id}
                  track={t}
                  isPlaying={music.currentTrackId === t.id}
                  onToggle={() => music.toggle(t)}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <LoopToggle
              isOn={music.isLooping}
              onToggle={() => music.setLooping(!music.isLooping)}
            />
            <VolumeSlider value={music.volume} onChange={music.setVolume} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Sound Effects
          </h2>
          {sfxClips.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#2a2a2a] bg-[#141414] px-3 py-4 text-sm text-neutral-500">
              No playable files in{" "}
              <code className="text-neutral-400">public/sfx/</code>. Add clips,
              then refresh.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sfxClips.map((c) => (
                <SfxButton key={c.id} clip={c} onPlay={() => sfx.play(c)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
