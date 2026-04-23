# Mindful Browsing

A Chrome extension that blocks or slows access to distracting sites and offers a meditation timer as an alternative.

- **Blocked sites** redirect to a full-screen "Meditate Instead" page with no escape hatch (other than meditating or closing the tab).
- **Slow sites** show the same page with a "Proceed Anyway" button that triggers a 10-second countdown before allowing the visit.
- Either page lets you start a meditation timer (default 5 minutes, adjustable 1–60). When the timer ends, a synthesized temple-bell sound plays.

## Load the extension in Chrome (dev mode)

1. Open Chrome and go to `chrome://extensions`.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked**.
4. Select this project's folder (the one containing `manifest.json`).
5. The extension's icon should appear in the toolbar. Pin it if you want quick access.

## Configure blocked / slow sites

1. Click the extension's toolbar icon to open the popup.
2. Under **Blocked Sites**, add domains you want hard-blocked (e.g. `reddit.com`).
3. Under **Slow Sites**, add domains you want to gate behind a countdown (e.g. `twitter.com`).
4. Entries match the domain and any subdomain (so `reddit.com` also matches `old.reddit.com`).

No reload is needed — changes take effect immediately.

## Reloading after code changes

After editing any file in this project, go to `chrome://extensions` and click the circular **reload** icon on the Mindful Browsing card. For changes to `blocked.html` / `blocked.js` / `blocked.css`, you can just refresh the blocked page itself.

## Project files

- `manifest.json` — extension manifest (MV3).
- `background.js` — service worker that intercepts navigation and redirects blocked/slow sites.
- `popup.html` / `popup.js` / `popup.css` — the toolbar popup UI for managing domain lists.
- `blocked.html` / `blocked.js` / `blocked.css` — the redirect page with the meditation timer.
- `images/buddha.png` — unused currently, kept for future use.

## Notes

- The bell sound is generated in-browser via the Web Audio API (additive synthesis with inharmonic partials). No audio file is required.
- Bypasses from the slow-countdown are one-shot and kept in memory only — closing the tab or restarting Chrome clears them.
