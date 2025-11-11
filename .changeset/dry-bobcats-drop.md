---
---

Remove `initialAuthState` option from `useAuth` hook.

This option was mainly used internally but is no longer necessary, so we are removing it to keep the API simple.

If you want `useAuth` to return a populated auth state before Clerk has fully loaded, for example during server rendering, see your framework-specific documentation for guidance.
