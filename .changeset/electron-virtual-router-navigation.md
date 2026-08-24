---
'@clerk/electron': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Keep Clerk's navigation inside the renderer. `ClerkProvider` now always supplies `routerPush`/`routerReplace`, so Clerk routes through your application's router when you provide one, and never navigates the window to an internal `/CLERK-ROUTER/VIRTUAL/...` path — which no custom protocol handler can serve, and which reloaded the renderer and dropped the user out of sign-in.

Applications that worked around this by passing no-op router functions, or by filtering `CLERK-ROUTER/VIRTUAL` out themselves, can remove those workarounds.
