---
'@clerk/chrome-extension': major
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Expand the ability for `@clerk/chrome-extension` WebSSO to sync with host applications which use URL-based session syncing.

### How to Update

**WebSSO Local Host Permissions:**

Add the following to the top-level `content_scripts` array key in your `manifest.json` file:
```json
{
  "matches": ["*://localhost/*"], // URL of your host application
  "js": ["src/content.tsx"] // Path to your content script
}
```

**Content Script:**

In order to sync with your host application, you must add the following to your content script to the path specified in the `manifest.json` file above:

```ts
import { ContentScript } from '@clerk/chrome-extension';

ContentScript.init(process.env.CLERK_PUBLISHABLE_KEY || "");
```
