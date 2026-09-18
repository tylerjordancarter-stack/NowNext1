# NowNext PWA v0.1

A browser-installable, low-maintenance checklist built around **Morning → Today → Next**.

## Included
- Installable PWA shell + offline cache.
- Tasks and informational events.
- Notes hidden from the main checklist; tap a titled task in the app to view them.
- Recurring weekdays.
- Morning Mode with default weekly routine and optional individual-day override.
- Today and read-only Next day.
- Cumulative weekly `X / Y`: future tasks do not enter the denominator; intentional skips are excluded.
- Four-week history.
- Skip remaining tasks today.
- Notification permission + custom daily reminder settings UI.
- Service worker push handling: tapping a push notification opens/focuses NowNext.
- Reference Node web-push backend.

## Important notification limitation
The PWA can store your chosen reminder time/message locally, but Safari cannot reliably wake a closed PWA at 08:30 by itself. Reliable scheduled alerts require the included server-side Web Push path (or another push provider). iPhone Web Push requires the PWA to be added to the Home Screen and notification permission granted.

## Quick local test
Serve this folder over HTTP rather than opening `index.html` directly:
`python3 -m http.server 8080`
Then visit `http://localhost:8080`.

For an iPhone, host the folder on an HTTPS static host (GitHub Pages, Cloudflare Pages, Netlify, etc.), open the HTTPS address in Safari, Share → Add to Home Screen, launch it from the new icon, then allow notifications.

## Data
v0.1 stores tasks/settings/history in localStorage on that device. Clearing website data removes it. Cloud sync/export is a sensible later addition.
