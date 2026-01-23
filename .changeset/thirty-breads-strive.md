---
'@clerk/localizations': patch
'@clerk/shared': patch
---

A utility function that converts flattened localization objects (with dot-notation keys) to nested `LocalizationResource` objects for use with Clerk's `localization` prop.

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { flatLocalization } from '@clerk/localizations/utils';

const localization = flatLocalization({
  'formFieldLabel__emailAddress': 'Email address',
  'unstable__errors.passwordComplexity.maximumLength': 'Password is too long',
});

export default function App() {
  return (
    <ClerkProvider localization={localization}>
      {/* Your app */}
    </ClerkProvider>
  );
}
```
