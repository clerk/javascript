---
'@clerk/astro': patch
---

Fix Clerk component styling being lost after Astro View Transitions navigations.

The `#clerk-components` element (which hosts Clerk's React root) was being cloned rather than moved during the `astro:before-swap` phase. The clone carried no React association, so the React root ended up bound to a detached element after the body swap, breaking style injection on subsequent navigations.

Also consolidates the two `import('astro:transitions/client')` calls inside the event listeners into a single eagerly-started Promise shared by both handlers.
