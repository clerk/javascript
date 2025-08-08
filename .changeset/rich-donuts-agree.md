---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Add `navigate` parameter to `clerk.setActive()` for custom navigation before the session and/or organization is set.

It's useful for handling pending session tasks for after-auth flows:

```typescript
await clerk.setActive({
  session,
  navigate: async ({ session }) => {
    if (session.currentTask.key === 'choose-organization') {
      await router.push('/onboarding/choose-organization')
    }
  }
});
```
