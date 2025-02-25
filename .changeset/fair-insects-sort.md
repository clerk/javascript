---
"@clerk/astro": minor
---

Introduce `protect-fallback` slot to avoid naming conflicts with Astro's server islands [`fallback` slot](https://docs.astro.build/en/guides/server-islands/#server-island-fallback-content). 

When using Clerk's `<Protect>` component with `server:defer`, you can now use both slots:
- `fallback`: Default loading content
- `protect-fallback`: Shows when a user doesn't have the `role` or `permission` to access the protected content

Regular usage without server islands:

```astro
<Protect role="admin">
  <p slot="fallback">Not an admin</p>
  <p>You're an admin</p>
</Protect>
```

Example with server islands:

```astro
<Protect server:defer role="admin">
  <p slot="fallback">Loading...</p>
  <p slot="protect-fallback">Not an admin</p>
  <p>You're an admin</p>
</Protect>
```
