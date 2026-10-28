import sharp from "sharp";
import type { Route } from "./+types/api.convert";
import { THUMBNAIL_KEYS, VIDEO_ID_REGEX, getThumbnailUrl, type ThumbnailKey } from "../lib/youtube";

const FORMATS = ["avif", "webp"] as const;

function json(error: string, status: number) {
  return Response.json({ error }, { status });
}

// Only builds URLs on img.youtube.com from a validated video ID, so it can't be used as an open proxy.
export async function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const videoId = params.get("v") ?? "";
  const key = (params.get("q") ?? "maxres") as ThumbnailKey;
  const format = (params.get("format") ?? "avif") as (typeof FORMATS)[number];

  if (!VIDEO_ID_REGEX.test(videoId)) return json("Invalid video id", 400);
  if (!THUMBNAIL_KEYS.includes(key)) return json("Invalid quality", 400);
  if (!FORMATS.includes(format)) return json("Invalid format", 400);

  try {
    const upstream = await fetch(getThumbnailUrl(videoId, key), { signal: AbortSignal.timeout(30_000) });
    if (!upstream.ok) return json("Failed to download image", 400);

    const input = Buffer.from(await upstream.arrayBuffer());
    const output =
      format === "avif"
        ? await sharp(input).avif({ quality: 85 }).toBuffer()
        : await sharp(input).webp({ quality: 85 }).toBuffer();

    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="youtube-thumbnail-${videoId}-${key}.${format}"`,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (e) {
    return json(`Conversion failed: ${e instanceof Error ? e.message : "unknown error"}`, 500);
  }
}
