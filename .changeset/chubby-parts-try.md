---
'@clerk/clerk-js': minor
---

Add modern CSS color manipulation utilities with progressive enhancement support. This update introduces:

- CSS variable support in `appearance.variables` object (e.g., `colorPrimary: 'var(--brand-color)'`)
- Modern CSS features like `color-mix()` and relative color syntax when supported by browser
- Automatic fallback to legacy HSLA-based color manipulation for older browsers
