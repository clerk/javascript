---
"@clerk/ui": minor
"@clerk/react": minor
"@clerk/shared": patch
---

Add shared React variant to reduce bundle size when using `@clerk/react`.

Introduces a new `ui.shared.browser.js` build variant that externalizes React dependencies, allowing the host application's React to be reused instead of bundling a separate copy. This can significantly reduce bundle size for applications using `@clerk/react`.

**New features:**
- `@clerk/ui/register` module: Import this to register React on `globalThis.__clerkSharedModules` for sharing with `@clerk/ui`
- `clerkUiVariant` option: Set to `'shared'` to use the shared variant (automatically detected and enabled for compatible React versions in `@clerk/react`)

**For `@clerk/react` users:** No action required. The shared variant is automatically used when your React version is compatible.

**For custom integrations:** Import `@clerk/ui/register` before loading the UI bundle, then set `clerkUiVariant: 'shared'` in your configuration.
