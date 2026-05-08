---
"@clerk/ui": minor
---

Add `elevation` appearance option with `'raised'` (default) and `'flush'` values. When set to `flush`, card-based components render without border, box-shadow, border-radius, outer padding, and footer background, allowing them to sit flat against their container. Applies to `<SignIn />`, `<SignUp />`, `<Waitlist />`, `<CreateOrganization />`, `<OrganizationList />`, `<OAuthConsent />`, `<UserVerification />`, and session task components. Profile and popover components always render as raised. Modal components always render as raised regardless of this setting.
