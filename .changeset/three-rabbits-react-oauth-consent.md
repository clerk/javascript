---
"@clerk/clerk-js": minor
"@clerk/nextjs": minor
"@clerk/react": minor
"@clerk/react-router": minor
"@clerk/shared": minor
"@clerk/tanstack-react-start": minor
"@clerk/ui": minor
---

Expose `OAuthConsent` as a public component export across React-based SDKs.

Example:

```tsx
import { OAuthConsent } from '@clerk/react';

export default function Page() {
  return <OAuthConsent />;
}
```
