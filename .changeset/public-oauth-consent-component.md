---
'@clerk/nextjs': minor
'@clerk/react': minor
'@clerk/shared': minor
'@clerk/ui': minor
'@clerk/tanstack-react-start': minor
'@clerk/react-router': minor
'@clerk/localizations': minor
---

Introduce internal `<OAuthConsent />` component for rendering a zero-config OAuth consent screen on an OAuth authorize redirect page.

Usage example:

```tsx
import { OAuthConsent } from '@clerk/nextjs';

export default function OAuthConsentPage() {
  return <OAuthConsent />;
}
```
