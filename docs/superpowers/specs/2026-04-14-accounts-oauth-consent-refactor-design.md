# Accounts Portal OAuth Consent Refactor Design

> **For agentic workers:** This spec targets the accounts repo at `/Users/wobsoriano/Documents/projects/clerk/accounts`, not the javascript repo.

**Goal:** Replace the accounts portal's manual OAuth consent implementation with the new `<OAuthConsent />` component from `@clerk/nextjs/internal`, deleting all custom fetch utilities, hidden forms, and types in the process.

**Context:** The `OAuthConsent` component (in `packages/ui`) now handles the full public path: it reads `client_id`, `redirect_uri`, and `scope` from the URL, fetches consent info via `clerk.oauthApplication.getConsentInfo`, renders scopes, and submits the consent form to `clerk.oauthApplication.buildConsentActionUrl`. The accounts portal's manual implementation duplicates all of this and can be deleted entirely.

---

## Files Deleted

- `components/oauth-consent/index.tsx` — manual fetch + `__internal_mountOAuthConsent` + hidden forms
- `utils/oauth-consent.ts` — `getConsentInfoForOAuth` FAPI fetch utility
- `types/OAuthConsent.ts` — `OAuthConsentInfo` type (only used by the above two files)

## Files Modified

### `types/index.ts`

Remove the re-export of the deleted type file:

```diff
- export * from './OAuthConsent';
  export * from './AccountPortalJSON';
  export * from './constants';
```

`constants.ts` and `AccountPortalJSON.ts` are untouched — `DEV_BROWSER_JWT_MARKER` and `CLIENT_COOKIE_NAME` are still used elsewhere.

### `pages/oauth-consent/[[...index]].tsx`

Replace the entire file. `getServerSideProps` is removed — clerk-js handles `devBrowserJWT` and session auth automatically, and the new component reads all params from `window.location.search`. The referrer meta tag is kept (FAPI requires the `Origin` header on consent form POSTs).

```tsx
import React from 'react';
import Head from 'next/head';
import { OAuthConsent } from '@clerk/nextjs/internal';

export default function ConsentPage(): JSX.Element {
  return (
    <div className='pageContainer'>
      <div className='componentContainer'>
        <Head>
          <meta
            name='referrer'
            content='origin'
          />
        </Head>
        <OAuthConsent />
      </div>
    </div>
  );
}
```

### `e2e/features/oauth-consent.test.ts`

Error message text changes to match the new component's wording. Happy path assertion changes from hidden inputs (old hidden forms) to the Allow/Deny buttons the new component renders.

| Old assertion                                             | New assertion                             |
| --------------------------------------------------------- | ----------------------------------------- |
| `'Error: Authorization failed: The client ID is missing'` | `'The client ID is missing.'`             |
| `'Error: Redirect URI not found'`                         | `'The redirect URI is missing.'`          |
| `input[name="consented"][value="true"]`                   | `button[name="consented"][value="true"]`  |
| `input[name="consented"][value="false"]`                  | `button[name="consented"][value="false"]` |

### `e2e/unauthenticated/oauth-consent.test.ts`

The old component returned an explicit `"Error: No session found"` div. The new component is wrapped with `withCoreUserGuard` which renders `null` for unauthenticated users. Update both tests to assert that the Allow button is not visible instead.

```ts
// Before
await expect(page.getByText('Error: No session found')).toBeVisible();

// After
await expect(page.getByRole('button', { name: 'Allow' })).not.toBeVisible();
```

---

## What Is Not Changing

- `types/constants.ts` — stays, used by `utils/devBrowser.ts`, `utils/settings/environment.ts`, `utils/settings/accountPortal.ts`
- `utils/devBrowser.ts` — stays, unrelated to OAuth consent
- The page URL (`/oauth-consent`) and its Next.js route — unchanged
- The referrer meta tag — kept
- CSS class names (`pageContainer`, `componentContainer`) — unchanged
