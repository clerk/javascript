---
'@clerk/expo': minor
---

Add custom user profile pages to the native `UserProfileView` and `UserButton` components. Use `content` to render a React Native screen or `href` to open an external URL.

```tsx
import { UserButton, UserProfileView } from '@clerk/expo/native';
import type { UserProfileCustomPage } from '@clerk/expo/native';

const customPages: UserProfileCustomPage[] = [
  {
    path: 'api-keys',
    label: 'API keys',
    icon: 'key',
    content: <APIKeysView />,
  },
  {
    path: 'docs',
    label: 'Docs',
    icon: 'book',
    href: 'https://clerk.com/docs',
  },
];

<UserProfileView customPages={customPages} />;

<UserButton userProfileProps={{ customPages }} />;
```
