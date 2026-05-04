import HotseatClient from "./HotseatClient";
import { loadMediaLibrary } from "@/lib/scanPublicAudio";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { music, sfx } = await loadMediaLibrary();
  const preloadItems = [...sfx, ...music];

  return (
    <>
      {preloadItems.map((item) => (
        <link
          key={`preload-audio-${item.id}`}
          rel="preload"
          href={item.src}
          as="audio"
        />
      ))}
      <HotseatClient musicTracks={music} sfxClips={sfx} />
    </>
  );
}
