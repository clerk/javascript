---
'@clerk/nextjs': minor
'@clerk/react': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Introduce `<OAuthConsent />` component for rendering a zero-config OAuth consent screen on an OAuth authorize redirect page.

Usage example:

```tsx
import { OAuthConsent } from '@clerk/nextjs';

export default function OAuthConsentPage() {
  return <OAuthConsent />;
}
```

The component reads `client_id`, `scope`, and `redirect_uri` from the current URL by default and submits the consent decision internally, so no boilerplate is required for the common OAuth redirect flow. Customization options include `oauthClientId`, `scope`, `appearance`, and `fallback`.
