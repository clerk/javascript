---
'@clerk/tanstack-react-start': patch
'@clerk/shared': patch
'@clerk/astro': patch
---

Escape `<`, `>`, and `/` when serializing the Clerk auth state into SSR `<script>` tags, preventing a `</script>` sequence inside user-controllable session claims from breaking out of the script element (stored XSS). The embedded JSON still parses to identical values on the client.
