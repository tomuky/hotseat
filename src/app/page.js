import HotseatClient from "./HotseatClient";
import { loadMediaLibrary } from "@/lib/scanPublicAudio";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { music, sfx } = await loadMediaLibrary();
  return <HotseatClient musicTracks={music} sfxClips={sfx} />;
}
