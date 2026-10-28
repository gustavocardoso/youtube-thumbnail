# YouTube Thumbnail Downloader

React Router v7 (framework mode, successor of Remix) + TypeScript + Tailwind v4. Port of the Laravel `youtube-thumbnail` project, without login.

- `npm run dev` – dev server
- `npm test` – Vitest
- `npm run build && npm start` – production

Deploy: import the repo in Vercel (React Router preset is auto-detected, no env vars needed).
AVIF/WebP conversion runs in `app/routes/api.convert.ts` using `sharp`.
