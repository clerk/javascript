---
'@clerk/expo': major
'@clerk/shared': major
'@clerk/react': major
'@clerk/localizations': major
---

Removed legacy subpath export mappings in favor of modern package.json `exports` field configuration. Previously, these packages used a workaround to support subpath imports (e.g., `@clerk/shared/react`, `@clerk/expo/web`). All public APIs remain available through the main package entry points.
