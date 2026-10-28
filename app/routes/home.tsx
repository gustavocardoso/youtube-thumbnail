import { useState } from "react";
import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/home";
import { extractVideoId, getThumbnails, type Thumbnail } from "../lib/youtube";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "YouTube Thumbnail Downloader" },
    { name: "description", content: "Download YouTube video thumbnails in JPG, AVIF or WebP, in every available size." },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url).searchParams.get("url")?.trim();
  if (url === undefined) return { url: "", videoId: null, thumbnails: null, error: null };
  if (!url) return { url, videoId: null, thumbnails: null, error: "Please enter a YouTube URL." };

  const videoId = extractVideoId(url);
  if (!videoId) return { url, videoId: null, thumbnails: null, error: "Invalid URL. Please enter a valid YouTube URL." };

  return { url, videoId, thumbnails: getThumbnails(videoId), error: null };
}

const Icon = ({ d, className = "size-4" }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4m0 0l4-4m-4 4V4",
  external: "M14 3h7v7M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6",
  search: "M21 21l-4.3-4.3M17 10a7 7 0 11-14 0 7 7 0 0114 0z",
  alert: "M12 8v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
};

function ConvertButton({ href, format }: { href: string; format: "avif" | "webp" }) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onClick() {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? `thumbnail.${format}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        failed
          ? "bg-red-500/20 text-red-300"
          : "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95"
      }`}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <Icon d={ICONS.download} />
      )}
      {failed ? "Failed" : format.toUpperCase()}
    </button>
  );
}

function ThumbnailCard({ id, videoId, thumb, index }: { id: string; videoId: string; thumb: Thumbnail; index: number }) {
  const [missing, setMissing] = useState(false);

  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      className="group animate-fade-up overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {missing ? (
          <div className="flex h-full items-center justify-center text-sm text-white/40">Not available</div>
        ) : (
          <img
            src={thumb.url}
            alt={thumb.label}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => setMissing(true)}
            onLoad={(e) => {
              // YouTube serves a 120x90 placeholder instead of 404 for missing sizes
              if (id === "maxres" && e.currentTarget.naturalWidth <= 120) setMissing(true);
            }}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/15">
          {thumb.resolution}
        </span>
        {id === "maxres" && !missing && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-400/90 px-2.5 py-1 text-xs font-bold text-emerald-950">
            BEST
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-white">{thumb.label}</h3>
          <p className="text-xs text-white/50">{thumb.description}</p>
        </div>
        {missing ? (
          <p className="rounded-xl bg-white/5 py-2 text-center text-sm text-white/40">No download for this size</p>
        ) : (
          <div className="flex gap-2">
            <a
              href={thumb.url}
              target="_blank"
              rel="noreferrer"
              title="Open original JPG"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/20"
            >
              <Icon d={ICONS.external} /> JPG
            </a>
            <ConvertButton href={`/api/convert?v=${videoId}&q=${id}&format=webp`} format="webp" />
            <ConvertButton href={`/api/convert?v=${videoId}&q=${id}&format=avif`} format="avif" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { url, videoId, thumbnails, error } = loaderData;
  const navigation = useNavigation();
  const searching = navigation.state === "loading" && navigation.location?.pathname === "/";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-16 pt-14 sm:pt-20">
      <header className="mb-10 text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
          <span className="size-1.5 rounded-full bg-emerald-400" /> Free · No sign-up · JPG, WebP &amp; AVIF
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          YouTube{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
            Thumbnail
          </span>{" "}
          Downloader
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-white/60 sm:whitespace-nowrap sm:text-lg">
          Paste a video link and grab its thumbnail in every available resolution.
        </p>
      </header>

      <Form method="get" className="mx-auto mb-12 w-full max-w-2xl">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-2 shadow-2xl shadow-indigo-500/10 backdrop-blur transition focus-within:border-indigo-400/60 focus-within:ring-4 focus-within:ring-indigo-500/20">
          <Icon d={ICONS.search} className="ml-3 hidden size-5 shrink-0 text-white/40 sm:block" />
          <input
            id="url"
            name="url"
            type="text"
            key={url}
            defaultValue={url}
            aria-label="YouTube video URL"
            placeholder="https://www.youtube.com/watch?v=..."
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-white placeholder:text-white/30 focus:outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-red-300">
            <Icon d={ICONS.alert} /> {error}
          </p>
        )}
      </Form>

      {thumbnails && videoId && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Available thumbnails</h2>
            <a href="/" className="text-sm font-medium text-white/60 transition hover:text-white">
              New search →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(thumbnails).map(([id, thumb], i) => (
              <ThumbnailCard key={`${videoId}-${id}`} id={id} videoId={videoId} thumb={thumb} index={i} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-auto pt-16">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row">
          <p>
            Developed by <span className="font-semibold text-white/80">Gustavo Cardoso</span>
          </p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:gustavocardoso@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Icon d="M3 5h18v14H3zM3 7l9 6 9-6" />
              gustavocardoso@gmail.com
            </a>
            <a
              href="https://github.com/gustavocardoso"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M12 .5a11.5 11.5 0 00-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.2-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.76 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.83 1.2 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0012 .5z" />
              </svg>
              /gustavocardoso
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-white/30">
          Thumbnails are served by YouTube. Not affiliated with YouTube.
        </p>
      </footer>
    </main>
  );
}
