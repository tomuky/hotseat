# Hotseat

A small, mobile-first web app for playing background music and sound effects during a “hotseat interrogation” session. One music track at a time (tap to play or stop) and independent sound effects that can overlap without interrupting music.

Tracks are **discovered automatically** from `public/music/` and `public/sfx/`: every file in those folders becomes a button (except obvious non-media types like `.txt`, images, `.pdf`, etc.). The button shows the **file name without extension**; files with no extension use the full name. Add or remove files and refresh the page (each deploy on Vercel picks up whatever is in those folders).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Add or remove audio

- **Music:** put files in `public/music/`.
- **SFX:** put files in `public/sfx/`.

Refresh the app to rescan the folders. Hidden files (names starting with `.`) are ignored. `README.txt` and other skipped extensions are ignored; extensionless files (e.g. `Quick Questions`) are included.

## iOS

Playback only starts after you tap a control (browser autoplay rules). If the device silent switch is on, you may hear nothing until it is off—this app does not override the silent switch.

## Deploy (Vercel)

Connect this GitHub repository to Vercel. Next.js is auto-detected; no environment variables are required. The file list is determined at **request time** in development and on each deployment in production.
