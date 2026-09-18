# Optional push service

The PWA itself works without a server. For **reliable scheduled iPhone notifications while NowNext is closed**, deploy a small web-push backend.

The browser must:
1. be installed to the iPhone Home Screen,
2. receive notification permission from a user gesture,
3. create a Push API subscription and send that subscription + chosen schedule/timezone to your backend.

The backend then stores the subscription and sends Web Push at the configured local time.

`server.js` is a minimal Node/Express reference. Before production, add authentication/opaque device IDs, persistence, rate limiting and HTTPS. Never commit VAPID private keys.
