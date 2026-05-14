---
"@clerk/ui": minor
---

Add `elevation` appearance option with `'raised'` (default) and `'flush'` values. When set to `flush`, card-based components render without border, box-shadow, border-radius, outer padding, and footer background, allowing them to sit flat against their container. Applies to `<SignIn />`, `<SignUp />`, `<Waitlist />`, `<CreateOrganization />`, `<OrganizationList />`, `<OAuthConsent />`, `<UserVerification />`, and session task components. Profile and popover components always render as raised. Modal components always render as raised regardless of this setting.

The `cardBox` element exposes a `data-elevation="flush"` attribute when flush is active, giving className-based themes a hook to neutralize their card chrome via attribute selectors. The `shadcn` theme uses this hook to drop its `shadow-sm border` utilities under flush.
