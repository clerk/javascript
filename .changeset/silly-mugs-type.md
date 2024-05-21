---
'@clerk/types': minor
---

Added the following types
```tsx
interface Clerk {
  ...
  openGoogleOneTap: (props?: GoogleOneTapProps) => void;
  closeGoogleOneTap: () => void;
  authenticateWithGoogleOneTap: (params: AuthenticateWithGoogleOneTapParams) => Promise<SignInResource | SignUpResource>;
  handleGoogleOneTapCallback: (
    signInOrUp: SignInResource | SignUpResource,
    params: HandleOAuthCallbackParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;
  ...
}

type GoogleOneTapStrategy = 'google_one_tap'
```
