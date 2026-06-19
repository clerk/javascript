---
'@clerk/clerk-js': minor
---

Spotlight interactive bot-protection (Cloudflare Turnstile) challenges during sign-in and sign-up. When a challenge escalates to an interactive "Verify you are human" check, the start card now brings it to the foreground — collapsing and `inert`-ing the rest of the form until the challenge is solved — while keeping the header, footer, and passkey action reachable. Invisible challenges are unaffected.
