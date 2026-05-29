---
'@clerk/expo': minor
---

Add `<OrganizationSwitcher />` native component to `@clerk/expo/native`.

Renders a fully native organization switcher inline in your React Native view hierarchy — SwiftUI on iOS and Jetpack Compose on Android — backed by the prebuilt `OrganizationSwitcher` views in `clerk-ios` and `clerk-android`. Tapping the switcher opens the platform's native overview / account-list / manage sheets, including the full `OrganizationProfileView` flow (members, domains, invitations, action confirmations) on platforms where it has shipped.

```tsx
import { OrganizationSwitcher } from '@clerk/expo/native'

<OrganizationSwitcher
  onOrganizationChanged={({ organizationId }) => {
    // re-query useOrganization() or refetch as needed
  }}
/>
```

Active-organization changes are surfaced via the `onOrganizationChanged` callback so consumers can react in JS.

Requires the underlying native SDKs to include their `OrganizationSwitcher` prebuilt views — `clerk-ios` ≥ the release containing [clerk/clerk-ios#411](https://github.com/clerk/clerk-ios/pull/411) and `clerk-android` ≥ 1.0.17.
