export type ThumbnailKey = "maxres" | "standard" | "high" | "medium" | "default";

export interface Thumbnail {
  url: string;
  file: string;
  resolution: string;
  label: string;
  description: string;
}

const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

export const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function extractVideoId(url: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function validateYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

const DEFINITIONS: Record<ThumbnailKey, Omit<Thumbnail, "url">> = {
  maxres: { file: "maxresdefault.jpg", resolution: "1920x1080", label: "Maximum Resolution", description: "Best quality available" },
  standard: { file: "sddefault.jpg", resolution: "640x480", label: "High Quality", description: "Standard quality" },
  high: { file: "hqdefault.jpg", resolution: "480x360", label: "Medium Quality", description: "Good for web" },
  medium: { file: "mqdefault.jpg", resolution: "320x180", label: "Low Quality", description: "Small preview" },
  default: { file: "default.jpg", resolution: "120x90", label: "Thumbnail", description: "Smallest size" },
};

export const THUMBNAIL_KEYS = Object.keys(DEFINITIONS) as ThumbnailKey[];

export function getThumbnailUrl(videoId: string, key: ThumbnailKey): string {
  return `https://img.youtube.com/vi/${videoId}/${DEFINITIONS[key].file}`;
}

export function getThumbnails(videoId: string): Record<ThumbnailKey, Thumbnail> {
  return Object.fromEntries(
    THUMBNAIL_KEYS.map((key) => [key, { ...DEFINITIONS[key], url: getThumbnailUrl(videoId, key) }]),
  ) as Record<ThumbnailKey, Thumbnail>;
}
