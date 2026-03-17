---
'@clerk/shared': minor
'@clerk/ui': minor
---

Add `onMoment` prop to `<GoogleOneTap>` for prompt lifecycle callbacks.

The new prop exposes Google's `PromptMomentNotification`, letting you track when the One Tap prompt is displayed, dismissed, or skipped.

```tsx
<GoogleOneTap
  onMoment={(notification) => {
    if (notification.isDisplayMoment()) {
      // ...
    }
  }}
/>
```
