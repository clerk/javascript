---
"@clerk/clerk-js": major
"@clerk/shared": major
"@clerk/react": major
"@clerk/nextjs": major
"@clerk/vue": major
"@clerk/expo": major
"@clerk/ui": major
"@clerk/testing": major
"@clerk/upgrade": patch
---

Rename `setActive` to `setSelected`

**BREAKING CHANGE:** The `setActive` method has been renamed to `setSelected` to better reflect its behavior with pending sessions.

### Method Rename
- `clerk.setActive()` → `clerk.setSelected()`
- Hooks now return `setSelected` instead of `setActive`:
  - `useSignIn()`
  - `useSignUp()`
  - `useSessionList()`
  - `useOrganizationList()`

### Type Renames
- `SetActive` → `SetSelected`
- `SetActiveParams` → `SetSelectedParams`
- `SetActiveNavigate` → `SetSelectedNavigate`
- `SetActiveHook` → `SetSelectedHook`

### Migration
Use the `@clerk/upgrade` codemod for automatic migration:
```bash
npx @clerk/upgrade
```
