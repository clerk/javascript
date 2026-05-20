---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Deprecate passing `unsafeMetadata` to `user.update()`.
Use `user.updateMetadata()` when you want to partially update unsafe metadata with deep-merge semantics:
~~~ts
await user.updateMetadata({
  unsafeMetadata: { onboardingComplete: true },
});
~~~
user.update({ unsafeMetadata })` continues to work for now and preserves its existing full-replacement behavior:
~~~ts
await user.update({
  unsafeMetadata: { theme: 'dark' },
});
~~~
New code should prefer `user.updateMetadata({ unsafeMetadata })` for metadata-only updates.