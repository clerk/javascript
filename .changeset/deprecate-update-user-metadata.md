---
'@clerk/backend': minor
---

Add `clerkClient.users.replaceUserMetadata(userId, params)` for replacing a user's metadata fields in full.

Use `replaceUserMetadata` when the provided metadata should become the complete value for that metadata field:

```ts
await clerkClient.users.replaceUserMetadata(userId, {
  publicMetadata: { plan: 'pro' },
});
```

Use `clerkClient.users.updateUserMetadata(userId, params)` when you want to partially update metadata with deep-merge semantics:

```ts
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: { onboardingComplete: true },
});
```

The `publicMetadata`, `privateMetadata`, and `unsafeMetadata` parameters on `clerkClient.users.updateUser()` are now deprecated. They continue to work, but new code should use `updateUserMetadata()` for partial updates or `replaceUserMetadata()` for full replacement.
