---
title: 'Native UI components available via `@clerk/expo/native`'
packages: ['expo']
matcher: '@clerk/expo'
category: 'feature'
---

New native UI components are available for Clerk authentication in Expo apps. These components provide pre-built, native authentication experiences powered by [clerk-ios](https://github.com/clerk/clerk-ios) and [clerk-android](https://github.com/clerk/clerk-android).

Import from the new `/native` entry point:

```tsx
import { AuthView, UserButton, UserProfileView } from '@clerk/expo/native';
```

**Available components:**

- `AuthView` - Authentication flow (sign-in/sign-up)
- `UserButton` - Avatar button that opens profile
- `UserProfileView` - User profile and account management

**Requirements:**

1. Add the plugin to your `app.json`:
   ```json
   {
     "expo": {
       "plugins": ["@clerk/expo"]
     }
   }
   ```
2. Run `npx expo prebuild` to generate native code
