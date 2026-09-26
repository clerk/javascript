---
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Fix Clerk failing to load in a development instance when the page URL has a fragment that is not valid percent-encoding, such as a truncated `#%E0%A4%A` from a clipped or wrapped link. Initialization threw `URIError: URI malformed` during the handshake, so the session was never loaded and every page showed the sign-in screen until the fragment was removed. Clerk now leaves such a fragment as it is and loads normally.
