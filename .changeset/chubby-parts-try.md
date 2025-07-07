---
'@clerk/clerk-js': minor
---

Add CSS variable support to the `appearance.variables` object, enabling use of CSS custom properties. For example, you can now use `colorPrimary: 'var(--brand-color)'` to reference CSS variables defined in your stylesheets.

This feature includes automatic fallback support for browsers that don't support modern CSS color manipulation features.
