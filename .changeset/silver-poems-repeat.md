---
'@clerk/shared': patch
---

Clarify the `isSatellite` JSDoc to note it must be set in `load()`, unlike `domain`, which is set in the `Clerk` constructor. This corrects the generated API reference for direct `@clerk/clerk-js` and `<script>` consumers, where `load()` is the only way to configure a satellite app.
