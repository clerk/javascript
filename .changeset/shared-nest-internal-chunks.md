---
'@clerk/shared': patch
---

Nest rolldown's shared build chunks under `dist/runtime/_chunks/` instead of emitting them flat next to the entry points. The package exposes `"./*"`, which resolves to `dist/runtime/*`, so the content-hashed internal chunks were being picked up by API-diff tooling whenever a chunk hash shifted. Entry and type resolution are unchanged; the chunks are still referenced by relative path, and external `./_chunks/*` package subpaths are blocked.
