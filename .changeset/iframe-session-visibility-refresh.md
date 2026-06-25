---
'@clerk/clerk-js': patch
---

Refresh the session cookie when a tab becomes visible again, not only on window `focus`. Apps embedded in a cross-origin iframe (for example a preview pane) never receive a `focus` event when their parent tab is re-activated, which could leave the session token stale and cause requests to fail with a 401 until the page was manually refreshed. clerk-js now also refreshes on `visibilitychange` (which does reach iframes) and allows a visible embedded frame to write the refreshed cookie.
