# CLIPRUSH Mobile — iPhone PWA starter

A static, browser-based prototype. It does not require a paid backend or subscription. The application files can be hosted as static files, but a secure HTTPS origin is needed for PWA installation and service workers. Hosting on GitHub Pages is free, but it is still external static hosting; it is not an external video-processing server. If you require absolutely no external hosting, serve these files locally from an iPhone-compatible local web server or open the HTML file (PWA installation/offline features may not work).

## What this build does
- Imports a local video from iPhone Files.
- Attempts to fetch a direct video URL if its server permits CORS.
- Lets you select a start time and a 120–180 second duration.
- Renders a 720x1280 vertical canvas recording in the browser.
- Adds a transparent centre CLIPRUSH watermark.
- Overlays user-entered subtitle text.
- Provides a downloadable MP4 or WebM depending on the browser's MediaRecorder support.
- Caches the static application shell as a PWA.

## What it does NOT do yet
- No automatic AI highlight selection.
- No automatic speech recognition or timed word-by-word subtitles.
- No downloading of YouTube/TikTok/Instagram watch pages.
- No reliable live-stream recording.
- No background rendering after Safari is closed or suspended.
- No guaranteed MP4 export on every iOS/Safari version.

These are intentionally not claimed as working features. Fully offline AI transcription/highlight selection would require bundling and running substantial local ML models, which this starter does not include.

## Install on iPhone
1. Put the files in a GitHub repository named `cliprush-mobile`.
2. In repository Settings → Pages, publish from the `main` branch and `/ (root)`.
3. Open the generated HTTPS Pages address in Safari.
4. Tap Share → Add to Home Screen.
5. Open CLIPRUSH, choose a video from Files, select a start time and 120–180 seconds, add subtitle text and render.
6. Keep Safari open and the phone awake until rendering completes.

GitHub Pages hosts only the static app shell. Video processing happens in the browser on the iPhone. If you do not want any external hosting, do not use GitHub Pages; the PWA installation flow will be less convenient.

## Important iOS constraints
- Large source files may exceed available browser memory.
- iOS can suspend browser tabs, interrupting recording.
- Direct URL loading requires CORS permission from the source host.
- MediaRecorder formats vary by iOS version. The app checks support and uses the first available MP4/WebM format.
- Browser canvas recording is not a substitute for a native video editor and may not preserve every source metadata/audio feature.

Only process footage you have permission to download, edit and republish.
