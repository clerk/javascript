# OAuth Consent: Loopback and IP Literal Redirect Display

## Background

The `OAuthConsent` component parses `redirect_uri` and displays the target "domain" to the user in two localized strings:

- `oauthConsent.redirectNotice`: "If you allow access, this app will redirect you to `{{domainAction}}`."
- `oauthConsent.warning`: "Make sure that you trust `{{applicationName}}` (`{{domainAction}}`). You may be sharing sensitive data with this site or app."

`domainAction` is computed by `getRootDomain(url)` in `packages/ui/src/components/OAuthConsent/utils.ts`:

```ts
export function getRootDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.split('.').slice(-2).join('.');
  } catch {
    return '';
  }
}
```

`slice(-2).join('.')` is correct for `app.example.com` (yields `example.com`), but wrong for any hostname that is an IP literal. The reported case: `http://127.0.0.1:3000/cb` produces `0.1`, rendering "this app will redirect you to 0.1." in the UI. The same class of bug affects `192.168.x.x`, public IPv4, and IPv6 literals.

## Goals

1. Loopback hosts (`localhost`, `127.0.0.0/8`, `::1`) render a friendly, localized phrase instead of a hostname fragment.
2. Non-loopback IP literals (private or public, IPv4 or IPv6) render as the full IP, not a mis-sliced fragment.
3. Hostname behavior (root-domain extraction) is preserved for the non-IP case.
4. Invalid or unparseable `redirect_uri` values continue to fall back to an empty string, matching today's behavior.

## Non-Goals

- Public-suffix-list handling for multi-part TLDs (`co.uk`, `com.au`). Pre-existing behavior, out of scope.
- Distinguishing RFC1918 private ranges from public IPs in the UI. All non-loopback IPs render identically.
- Translating the new localization key into non-English locales. Separate localization workstream. Non-English files receive the English string as a placeholder.

## Design

### Classifier: `getRedirectDisplay`

Replace `getRootDomain` with a discriminated-union classifier in `packages/ui/src/components/OAuthConsent/utils.ts`:

```ts
export type RedirectDisplay =
  | { kind: 'loopback' }
  | { kind: 'ip'; value: string }
  | { kind: 'hostname'; value: string }
  | { kind: 'invalid' };

export function getRedirectDisplay(url: string): RedirectDisplay {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return { kind: 'invalid' };
  }
  if (!hostname) return { kind: 'invalid' };

  if (isLoopbackHost(hostname)) return { kind: 'loopback' };
  if (isIpLiteral(hostname)) return { kind: 'ip', value: formatIpForDisplay(hostname) };
  return { kind: 'hostname', value: rootDomainOf(hostname) };
}
```

Classification rules:

- **Normalization**: Before classification, strip surrounding brackets from `hostname` and lowercase the result into a local `normalized` value. The WHATWG `URL` parser normalizes `[0:0:0:0:0:0:0:1]` to the compressed `::1` form, but browser implementations historically differ on whether `URL.hostname` includes the brackets for IPv6 literals. Stripping them up front makes the downstream checks robust regardless of platform.
- **Loopback**: `normalized === 'localhost'`, or starts with `127.`, or equals `::1`.
- **IP literal**: IPv4 detected by four dot-separated decimal octets; IPv6 detected by the presence of `:` in `normalized`. Both are confirmed via a narrow regex rather than a full address validator, since the WHATWG `URL` parser has already done syntactic validation.
- **Hostname**: falls through to existing `split('.').slice(-2).join('.')` logic, extracted into `rootDomainOf`.
- **Invalid**: non-parseable URLs and URLs with an empty host (e.g. `mailto:`). Component falls back to empty string.

`formatIpForDisplay` re-wraps IPv6 values in `[...]` for rendering consistency (e.g. `2001:db8::1` is returned as `[2001:db8::1]`). IPv4 passes through unchanged.

### Component integration

In `packages/ui/src/components/OAuthConsent/OAuthConsent.tsx`, replace the single `getRootDomain` call with:

```tsx
const display = getRedirectDisplay(redirectUrl);
const localApplication = t(localizationKeys('oauthConsent.localApplication'));
const domainAction = display.kind === 'loopback' ? localApplication : display.kind === 'invalid' ? '' : display.value;
```

Both call sites (`redirectNotice` at line 291, `warning` at line 258) consume `domainAction` identically, no further changes needed. The existing interpolation machinery in `redirectNotice` and `warning` stays untouched.

### Localization

Add a new key:

- `packages/shared/src/types/localization.ts`, under `oauthConsent` (currently at line 1256), add `localApplication: LocalizationValue;`.
- `packages/localizations/src/en-US.ts`: `oauthConsent.localApplication = 'a local application on your device'`.
- Every sibling locale file under `packages/localizations/src/` (e.g. `fr-FR.ts`, `es-ES.ts`, etc.): add the same key. Non-English locales receive the English string as a placeholder, following existing patterns in the repo for un-translated additions. A follow-up localization pass handles real translations.

The phrase is designed to read naturally in both sentences:

- "If you allow access, this app will redirect you to a local application on your device."
- "Make sure that you trust MyApp (a local application on your device)."

### Testing

New file: `packages/ui/src/components/OAuthConsent/__tests__/utils.test.ts`. Cases for `getRedirectDisplay`:

| Input                         | Expected                                     |
| ----------------------------- | -------------------------------------------- |
| `http://localhost:3000/cb`    | `{ kind: 'loopback' }`                       |
| `http://127.0.0.1/cb`         | `{ kind: 'loopback' }`                       |
| `http://127.5.5.5/cb`         | `{ kind: 'loopback' }`                       |
| `http://[::1]/cb`             | `{ kind: 'loopback' }`                       |
| `http://[0:0:0:0:0:0:0:1]/cb` | `{ kind: 'loopback' }`                       |
| `http://192.168.1.50/cb`      | `{ kind: 'ip', value: '192.168.1.50' }`      |
| `http://203.0.113.7/cb`       | `{ kind: 'ip', value: '203.0.113.7' }`       |
| `http://[2001:db8::1]/cb`     | `{ kind: 'ip', value: '[2001:db8::1]' }`     |
| `https://app.example.com/cb`  | `{ kind: 'hostname', value: 'example.com' }` |
| `https://example.com/cb`      | `{ kind: 'hostname', value: 'example.com' }` |
| `not-a-url`                   | `{ kind: 'invalid' }`                        |
| `''`                          | `{ kind: 'invalid' }`                        |
| `mailto:user@example.com`     | `{ kind: 'invalid' }`                        |

Extend `packages/ui/src/components/OAuthConsent/__tests__/OAuthConsent.test.tsx` with a case that mounts the component with `redirect_uri=http://localhost:3000/cb` and asserts the rendered `redirectNotice` contains "a local application on your device" (using the English test locale).

## Files Touched

- `packages/ui/src/components/OAuthConsent/utils.ts`: replace `getRootDomain` with `getRedirectDisplay`, add internal helpers `isLoopbackHost`, `isIpLiteral`, `formatIpForDisplay`, `rootDomainOf`.
- `packages/ui/src/components/OAuthConsent/OAuthConsent.tsx`: update import, replace the `domainAction` computation.
- `packages/shared/src/types/localization.ts`: add `localApplication: LocalizationValue;` under `oauthConsent`.
- `packages/localizations/src/en-US.ts`: add `localApplication` with English copy.
- All other `packages/localizations/src/*.ts` locale files: add `localApplication` with the English string as a placeholder.
- `packages/ui/src/components/OAuthConsent/__tests__/utils.test.ts`: new file.
- `packages/ui/src/components/OAuthConsent/__tests__/OAuthConsent.test.tsx`: new loopback case.

## Rollout

No feature flag. The change is purely display-layer and does not affect which URLs are accepted or how the consent flow behaves. Existing snapshot tests may need updates where they assert on the prior `0.1`-style output, though a quick search suggests no such assertions exist in the current test suite.
