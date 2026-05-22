# Composed Profile API — Design Plan

## Context

The `@clerk/ui/experimental` export provides composable profile subcomponents that render outside Clerk's portal infrastructure. The current API uses named components (`UserProfile.Account`, `UserProfile.Security`) that render full page components. We're replacing this with a `Page`/`Section` API that gives consumers full compositional control: omit sections, reorder them, and inject custom content between them.

## API

### Import

```tsx
import { UserProfile, OrganizationProfile } from '@clerk/ui/experimental';
```

### Basic usage — full defaults

```tsx
<UserProfile.Provider>
  <UserProfile.Page id='account' />
  <UserProfile.Page id='security' />
  <UserProfile.Page id='billing' />
  <UserProfile.Page id='api-keys' />
</UserProfile.Provider>
```

Each `Page` with no children renders the **full default page**: header, error alert, all built-in sections (respecting environment flags).

**Rendered output for `<UserProfile.Page id="account" />`:**

```
┌──────────────────────────────────┐
│ Account                    (h2)  │
│                                  │
│ [Card.Alert - errors show here]  │
│                                  │
│ ┌─ Profile Section ────────────┐ │
│ │ Avatar, name, update button  │ │
│ └──────────────────────────────┘ │
│ ┌─ Username Section ───────────┐ │
│ │ (if username enabled)        │ │
│ └──────────────────────────────┘ │
│ ┌─ Email Section ──────────────┐ │
│ │ (if email enabled)           │ │
│ └──────────────────────────────┘ │
│ ┌─ Phone Section ──────────────┐ │
│ │ (if phone enabled)           │ │
│ └──────────────────────────────┘ │
│ ┌─ Connected Accounts ─────────┐ │
│ │ (if social providers)        │ │
│ └──────────────────────────────┘ │
│ ┌─ Enterprise Accounts ────────┐ │
│ │ (if enterprise SSO enabled)  │ │
│ └──────────────────────────────┘ │
│ ┌─ Web3 Wallets ──────────────┐  │
│ │ (if web3 enabled)            │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Section-level composition

```tsx
<UserProfile.Provider>
  <UserProfile.Page id='account'>
    <UserProfile.Section id='profile' />
    <UserProfile.Section id='emails' />
  </UserProfile.Page>
</UserProfile.Provider>
```

When children are passed, the `Page` still renders the **header** and **Card.Alert** (error display), but children control the section layout below. No ProfileCard.Page padding wrapper.

**Rendered output:**

```
┌──────────────────────────────────┐
│ Account                    (h2)  │
│                                  │
│ [Card.Alert - errors show here]  │
│                                  │
│ ┌─ Profile Section ────────────┐ │
│ │ Avatar, name, update button  │ │
│ └──────────────────────────────┘ │
│ ┌─ Email Section ──────────────┐ │
│ │ Email list, add button       │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Header and error alert are always present. No phone, username, connected accounts, web3 sections — only what's declared.

### Custom content injection

```tsx
<UserProfile.Provider>
  <UserProfile.Page id='account'>
    <UserProfile.Section id='profile' />
    <div className='my-banner'>Verify your email to unlock features</div>
    <UserProfile.Section id='emails' />
    <UserProfile.Section id='phone' />
  </UserProfile.Page>
</UserProfile.Provider>
```

**Rendered output:**

```
┌──────────────────────────────────┐
│ Account                    (h2)  │
│                                  │
│ [Card.Alert - errors show here]  │
│                                  │
│ ┌─ Profile Section ────────────┐ │
│ │ Avatar, name, update button  │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ my-banner ──────────────────┐ │
│ │ Verify your email to unlock  │ │
│ │ features                     │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Email Section ──────────────┐ │
│ │ Email list, add button       │ │
│ └──────────────────────────────┘ │
│ ┌─ Phone Section ──────────────┐ │
│ │ Phone list, add button       │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Header and Card.Alert always present. Children render in declaration order below. `Section` resolves to built-in UI. Everything else passes through as-is.

### Custom pages

```tsx
<UserProfile.Provider>
  <UserProfile.Page id='account' />
  <UserProfile.Page title='Preferences'>
    <MyPreferencesPanel />
  </UserProfile.Page>
</UserProfile.Provider>
```

`Page` with `title` (no `id`) renders a custom page. Children are the page content. `title` and `id` are mutually exclusive.

**Rendered output:**

```
Page 1:
┌──────────────────────────────────┐
│ Account                          │
│ [full default account page]      │
└──────────────────────────────────┘

Page 2:
┌──────────────────────────────────┐
│ [MyPreferencesPanel renders]     │
└──────────────────────────────────┘
```

### OrganizationProfile

```tsx
<OrganizationProfile.Provider>
  <OrganizationProfile.Page id='general' />
  <OrganizationProfile.Page id='members' />
  <OrganizationProfile.Page id='billing' />
  <OrganizationProfile.Page id='api-keys' />
</OrganizationProfile.Provider>
```

Section composition on the general page:

```tsx
<OrganizationProfile.Provider>
  <OrganizationProfile.Page id='general'>
    <OrganizationProfile.Section id='profile' />
    <OrganizationProfile.Section id='domains' />
  </OrganizationProfile.Page>
</OrganizationProfile.Provider>
```

---

## Behavior Rules

### 1. No children = passthrough to existing component

`<Page id="account" />` renders the existing `AccountPage` component directly. The Page adds nothing — `AccountPage` already provides its own header, `Card.Alert`, `CardStateProvider`, and all sections with environment guards. This is a zero-change passthrough.

### 2. Any children = Page provides chrome + children control sections

If you pass ANY children, the Page renders:

- `CardStateProvider` (shared error state)
- `PageContext.Provider` (tells Section which page it's inside)
- Header (localized page title, styled as h2)
- `Card.Alert` (error display)
- Flex column with standard gap (`space.$8`)
- Children (Sections + custom content)

The existing page component is NOT rendered. The Page component builds the chrome from scratch.

### 3. Environment guards always respected

`<Section id="emails" />` renders nothing (`null`) if `email_address` is not enabled in the Clerk dashboard. Guards are enforced in the `Section` wrapper, matching the logic currently in the parent page component.

### 4. Loose section typing

`Section` accepts any valid section ID from a flat union. If the ID doesn't match the parent page's type, it renders nothing (`null`). No runtime error, no DOM output.

```tsx
// Renders nothing — 'password' isn't an account section
<UserProfile.Page id='account'>
  <UserProfile.Section id='password' />
</UserProfile.Page>
```

### 5. Section resolution via PageContext

`Page` provides a `PageContext` with the page ID. `Section` reads this context to look up the correct component from the section registry. This resolves ambiguity where the same section ID (e.g., `profile`) maps to different components depending on the page type.

```tsx
// Inside <Page id="account">:  Section id="profile" → UserProfileSection
// Inside <Page id="general">:  Section id="profile" → OrganizationProfileSection
```

### 6. Atomic pages

These pages don't support section composition — children are ignored:

| Page ID    | Reason                                                       |
| ---------- | ------------------------------------------------------------ |
| `members`  | Single component with tabs, shared pagination, role fetching |
| `api-keys` | Single component, no discrete sections                       |

### 7. Billing page — composable with managed navigation

`<Page id="billing" />` supports section composition AND manages sub-page navigation internally. The Page always provides the billing router (`useBillingRouter`). When the user is on the main view, sections render. When a section triggers navigation (e.g., "Switch plans"), the Page swaps the entire view to the sub-page (plans, statement detail, payment detail). Back navigation returns to the section view.

**Default (no children) — passthrough to existing BillingPage with tabs:**

```
<Page id="billing" />

Renders the existing BillingPage (with tabs + sub-page navigation):
┌──────────────────────────────────────┐
│ Billing                        (h2)  │
│                                      │
│ [Subscriptions] [Statements] [Payments]
│                                      │
│ ┌─ Current Plan ──────────────────┐  │
│ │ Pro Plan - $20/mo               │  │
│ │ [Switch plans]                  │  │
│ └─────────────────────────────────┘  │
│ ┌─ Payment Methods ───────────────┐  │
│ │ Visa •••• 4242                  │  │
│ └─────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Custom sections — no tabs, sections stack vertically. Consumer can add their own tab UI if desired:**

```tsx
<Page id='billing'>
  <Section id='subscriptions' />
  <Section id='paymentMethods' />
</Page>
```

```
Renders:
┌──────────────────────────────────────┐
│ Billing                        (h2)  │
│                                      │
│ ┌─ Subscriptions ─────────────────┐  │
│ │ Pro Plan - $20/mo               │  │
│ │ [Switch plans]                  │  │
│ └─────────────────────────────────┘  │
│ ┌─ Payment Methods ───────────────┐  │
│ │ Visa •••• 4242                  │  │
│ └─────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Sub-page navigation — managed by the Page:**

```
User clicks "Switch plans" in subscriptions →
Section calls navigate('plans') →
useBillingRouter updates route to { page: 'plans' } →
Page swaps entire view to PlansPage:

┌──────────────────────────────────────┐
│ ← Plans                       (h2)  │
│                                      │
│ ┌─ Pricing Table ─────────────────┐  │
│ │ Free      Pro       Enterprise  │  │
│ │ $0/mo     $20/mo    $50/mo      │  │
│ └─────────────────────────────────┘  │
└──────────────────────────────────────┘

User clicks back →
useBillingRouter resets to { page: 'billing' } →
Page swaps back to sections view
```

Same pattern for statement detail and payment detail — sections trigger navigation, Page manages the view swap.

**Billing section IDs:**

| Section ID       | Component             | Router dependency                                            |
| ---------------- | --------------------- | ------------------------------------------------------------ |
| `subscriptions`  | `SubscriptionsList`   | `navigate('plans')` — triggers sub-page swap                 |
| `paymentMethods` | `PaymentMethods`      | None — fully standalone                                      |
| `statements`     | `StatementsList`      | `navigate('statement/${id}')` — triggers sub-page swap       |
| `payments`       | `PaymentAttemptsList` | `navigate('payment-attempt/${id}')` — triggers sub-page swap |

### 8. Page-level CardState

When Page has children, it provides a shared `CardStateProvider`. Sections that call `useCardState()` write errors to this shared state, displayed in the `Card.Alert` the Page renders. When Page has no children (passthrough), the existing page component manages its own `CardStateProvider`.

### 9. Custom page headers

Custom pages (`<Page title="...">`) render a header with the title string, styled identically to built-in page headers (h2 variant). Built-in page headers use localization keys.

### 10. Appearance prop

`Provider` accepts an `appearance` prop for visual customization, passed through to `AppearanceProvider`. Same as current implementation.

---

## Section Registry

### UserProfile — Account page sections

| Section ID           | Component                   | Environment guard                           | Props injected by wrapper                    |
| -------------------- | --------------------------- | ------------------------------------------- | -------------------------------------------- |
| `profile`            | `UserProfileSection`        | none                                        | none                                         |
| `username`           | `UsernameSection`           | `attributes.username?.enabled`              | `isImmutable`                                |
| `emails`             | `EmailsSection`             | `attributes.email_address?.enabled`         | `shouldAllowCreation`, `shouldAllowDeletion` |
| `phone`              | `PhoneSection`              | `attributes.phone_number?.enabled`          | `shouldAllowCreation`, `shouldAllowDeletion` |
| `connectedAccounts`  | `ConnectedAccountsSection`  | social providers exist with `enabled: true` | `shouldAllowCreation`                        |
| `enterpriseAccounts` | `EnterpriseAccountsSection` | `enterpriseSSO.enabled`                     | none                                         |
| `web3`               | `Web3Section`               | `attributes.web3_wallet?.enabled`           | `shouldAllowCreation`                        |

Props are computed from `useEnvironment()` and `useUserProfileContext()` inside the Section wrapper.

### UserProfile — Security page sections

| Section ID      | Component              | Environment guard                                        | Props injected by wrapper |
| --------------- | ---------------------- | -------------------------------------------------------- | ------------------------- |
| `password`      | `PasswordSection`      | `instanceIsPasswordBased`                                | none                      |
| `passkeys`      | `PasskeySection`       | passkeys enabled AND `shouldAllowIdentificationCreation` | none                      |
| `mfa`           | `MfaSection`           | `getSecondFactors(attributes).length > 0`                | none                      |
| `activeDevices` | `ActiveDevicesSection` | none (always rendered)                                   | none                      |
| `delete`        | `DeleteSection`        | `user.deleteSelfEnabled`                                 | none                      |

### OrganizationProfile — General page sections

| Section ID | Component                    | Environment guard                                          | Wrapper extras                                           |
| ---------- | ---------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| `profile`  | `OrganizationProfileSection` | none                                                       | none                                                     |
| `domains`  | `OrganizationDomainsSection` | `organizationSettings.domains.enabled`                     | Wrapped in `<Protect permission='org:sys_domains:read'>` |
| `leave`    | `OrganizationLeaveSection`   | none                                                       | none                                                     |
| `delete`   | `OrganizationDeleteSection`  | `org:sys_profile:delete` permission + `adminDeleteEnabled` | none (guards are internal)                               |

---

## Type Definitions

```ts
// --- Page IDs ---

type UserProfilePageId = 'account' | 'security' | 'billing' | 'api-keys';
type OrganizationProfilePageId = 'general' | 'members' | 'billing' | 'api-keys';

// --- Section IDs ---

type UserProfileSectionId =
  // Account
  | 'profile'
  | 'username'
  | 'emails'
  | 'phone'
  | 'connectedAccounts'
  | 'enterpriseAccounts'
  | 'web3'
  // Security
  | 'password'
  | 'passkeys'
  | 'mfa'
  | 'activeDevices'
  | 'delete'
  // Billing
  | 'subscriptions'
  | 'paymentMethods'
  | 'statements'
  | 'payments';

type OrganizationProfileSectionId =
  // General
  | 'profile'
  | 'domains'
  | 'leave'
  | 'delete'
  // Billing (same IDs as UserProfile)
  | 'subscriptions'
  | 'paymentMethods'
  | 'statements'
  | 'payments';

// --- Component Props ---

type PageProps =
  | { id: UserProfilePageId; title?: never; children?: React.ReactNode }
  | { id?: never; title: string; children: React.ReactNode };

type SectionProps = {
  id: UserProfileSectionId; // or OrganizationProfileSectionId for org
};
```

---

## Implementation

### `Section` wrapper (conceptual)

Each Section wrapper handles: environment guard, prop computation, and delegation to the existing component.

```tsx
// Simplified example for the 'emails' section
function EmailsSectionWrapper() {
  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation, immutableAttributes } = useUserProfileContext();

  // Environment guard — matches AccountPage line 25
  if (!attributes.email_address?.enabled) {
    return null;
  }

  const isImmutable = immutableAttributes.has('email_address');

  return (
    <EmailsSection
      shouldAllowCreation={shouldAllowIdentificationCreation && !isImmutable}
      shouldAllowDeletion={!isImmutable}
    />
  );
}
```

The actual `Section` component uses a registry to look up the right wrapper:

```tsx
const userAccountSections: Record<string, React.ComponentType> = {
  profile: ProfileSectionWrapper,
  username: UsernameSectionWrapper,
  emails: EmailsSectionWrapper,
  phone: PhoneSectionWrapper,
  connectedAccounts: ConnectedAccountsSectionWrapper,
  enterpriseAccounts: EnterpriseAccountsSectionWrapper,
  web3: Web3SectionWrapper,
};

const userSecuritySections: Record<string, React.ComponentType> = {
  password: PasswordSectionWrapper,
  passkeys: PasskeySectionWrapper,
  mfa: MfaSectionWrapper,
  activeDevices: ActiveDevicesSectionWrapper,
  delete: DeleteSectionWrapper,
};
```

### `Page` component (conceptual)

```tsx
function UserProfilePage({ id, title, children }: PageProps) {
  // Custom page — just render children
  if (title) {
    return <>{children}</>;
  }

  // Atomic pages — ignore children, render full component
  if (id === 'api-keys') {
    return <APIKeysComposed />;
  }
  if (id === 'members') {
    return <MembersComposed />; // (org only)
  }

  // Billing — composable with managed sub-page navigation
  if (id === 'billing') {
    const { router, route } = useBillingRouter();

    // Sub-page active — Page takes over the whole view
    if (route.page !== 'billing') {
      return (
        <RouteContext.Provider value={router}>
          <SubPageRenderer route={route} />
        </RouteContext.Provider>
      );
    }

    // Main billing view — section composition
    return (
      <RouteContext.Provider value={router}>
        <CardStateProvider>
          <PageHeader id={id} />
          <CardAlert />
          {children ?? <DefaultBillingSections />}
        </CardStateProvider>
      </RouteContext.Provider>
    );
  }

  // Composable pages (account, security, general)
  if (children) {
    // Page provides chrome; children control section layout
    return (
      <CardStateProvider>
        <PageContext.Provider value={id}>
          <Col sx={t => ({ gap: t.space.$8 })}>
            <PageHeader id={id} />
            <CardAlert />
            {children}
          </Col>
        </PageContext.Provider>
      </CardStateProvider>
    );
  }

  // No children — passthrough to existing page component
  // AccountPage/SecurityPage/etc. already have their own header, alert, CardState
  return <DefaultPageRenderer id={id} />;
}
```

### `DefaultPageRenderer` — renders the full default page

When no children are passed, this renders the existing page component as-is (AccountPage, SecurityPage, OrganizationGeneralPage). This is what we have today — zero behavioral change for the simple case.

```tsx
function DefaultPageRenderer({ id }: { id: string }) {
  switch (id) {
    case 'account':
      return <AccountPage />;
    case 'security':
      return <SecurityPage />;
    case 'general':
      return <OrganizationGeneralPage />;
    default:
      return null;
  }
}
```

---

## File Changes

### New files

| File                                                   | Purpose                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `src/composed/UserProfile/Page.tsx`                    | `UserProfile.Page` component with section registry, default rendering, children detection  |
| `src/composed/UserProfile/Section.tsx`                 | `UserProfile.Section` component — looks up wrapper from registry, renders built-in section |
| `src/composed/UserProfile/sectionWrappers.tsx`         | Section wrapper components that compute props + guards for each section                    |
| `src/composed/OrganizationProfile/Page.tsx`            | `OrganizationProfile.Page` — same pattern                                                  |
| `src/composed/OrganizationProfile/Section.tsx`         | `OrganizationProfile.Section`                                                              |
| `src/composed/OrganizationProfile/sectionWrappers.tsx` | Org section wrappers                                                                       |

### Modified files

| File                                                             | Change                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/composed/UserProfile/index.tsx`                             | Replace `.Account`/`.Security`/`.Billing`/`.APIKeys` with `.Page` + `.Section` |
| `src/composed/OrganizationProfile/index.tsx`                     | Replace `.General`/`.Members`/`.Billing`/`.APIKeys` with `.Page` + `.Section`  |
| `src/components/OrganizationProfile/OrganizationGeneralPage.tsx` | Export the four private section components                                     |
| `playground/composed/src/App.tsx`                                | Update to use new Page/Section API                                             |

### Deleted files

| File                                           | Reason                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `src/composed/UserProfile/Account.tsx`         | Replaced by `Page` + section wrappers                              |
| `src/composed/UserProfile/Security.tsx`        | Replaced by `Page` + section wrappers                              |
| `src/composed/UserProfile/Billing.tsx`         | Replaced by billing logic inside `Page` + billing section wrappers |
| `src/composed/OrganizationProfile/General.tsx` | Replaced by `Page` + section wrappers                              |
| `src/composed/OrganizationProfile/Members.tsx` | Replaced by `Page` (atomic, rendered directly)                     |
| `src/composed/OrganizationProfile/Billing.tsx` | Replaced by billing logic inside `Page` + billing section wrappers |

### Kept as-is

| File                                                               | Reason                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| `src/composed/UserProfile/APIKeys.tsx`                             | API Keys is atomic — `Page` delegates to this         |
| `src/composed/OrganizationProfile/APIKeys.tsx`                     | Same                                                  |
| `src/composed/useBillingRouter.ts`                                 | Still needed for billing sub-navigation inside `Page` |
| `src/composed/stubRouter.ts`                                       | Still needed for non-billing pages                    |
| `src/composed/UserProfile/UserProfileProvider.tsx`                 | Provider unchanged                                    |
| `src/composed/OrganizationProfile/OrganizationProfileProvider.tsx` | Provider unchanged                                    |

---

## Compound Export Shape

```tsx
// src/composed/UserProfile/index.tsx
export const UserProfile = {
  Provider: UserProfileProvider,
  Page: UserProfilePage,
  Section: UserProfileSection,
};

// src/composed/OrganizationProfile/index.tsx
export const OrganizationProfile = {
  Provider: OrganizationProfileProvider,
  Page: OrganizationProfilePage,
  Section: OrganizationProfileSection,
};
```

---

## Full Example — Everything Together

```tsx
import { UserProfile, OrganizationProfile } from '@clerk/ui/experimental';

function MyApp() {
  return (
    <div className='dashboard'>
      {/* Tab: Profile */}
      <UserProfile.Provider>
        <UserProfile.Page id='account'>
          <UserProfile.Section id='profile' />
          <UpgradeBanner />
          <UserProfile.Section id='emails' />
          <UserProfile.Section id='phone' />
        </UserProfile.Page>
      </UserProfile.Provider>

      {/* Tab: Security — full defaults */}
      <UserProfile.Provider>
        <UserProfile.Page id='security' />
      </UserProfile.Provider>

      {/* Tab: Organization */}
      <OrganizationProfile.Provider>
        <OrganizationProfile.Page id='general'>
          <OrganizationProfile.Section id='profile' />
          <OrganizationProfile.Section id='domains' />
        </OrganizationProfile.Page>
        <OrganizationProfile.Page id='members' />
        <OrganizationProfile.Page id='billing' />
      </OrganizationProfile.Provider>
    </div>
  );
}
```

---

## Known Issues & Risks

### 1. Guard logic duplication

Section wrappers must replicate guard logic that currently lives in parent page components. Two sources of truth.

**Examples:**

- `DeleteSection` renders unconditionally — the guard `user.deleteSelfEnabled` lives only in `SecurityPage.tsx:25`. The section wrapper must add this guard.
- `PasskeySection` visibility depends on `shouldAllowIdentificationCreation` from `useUserProfileContext()` — computed in `SecurityPage.tsx:23`, not in the section itself.
- AccountPage computes `isEmailImmutable`, `isPhoneImmutable`, `isUsernameImmutable` from `useUserProfileContext().immutableAttributes` and passes derived props (`shouldAllowCreation`, `shouldAllowDeletion`) to child sections.

**Risk:** If a guard changes in the page component (portal path), the section wrapper (composed path) drifts silently. No shared code, no compile-time check.

**Mitigation options:**

- Extract shared `useSectionConfig()` hooks that both the page component and the section wrapper call.
- Move guards into the section components themselves (bigger refactor, changes portal path behavior).

### 2. CardState scoping is inconsistent across sections

Sections fall into three categories, each with different error display behavior:

| Category                                                            | Sections                                                                                                              | Error behavior                                                              |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Self-contained** (own `withCardStateProvider` + own `Card.Alert`) | `ConnectedAccountsSection`, `Web3Section`, `EnterpriseAccountsSection`                                                | Errors display inside the section. Page-level `Card.Alert` never sees them. |
| **Parent-dependent** (no provider, calls `useCardState()`)          | `EmailsSection`, `PhoneSection`, `MfaSection`                                                                         | Errors bubble to the nearest `CardStateProvider` — currently the page's.    |
| **No card state**                                                   | `UserProfileSection`, `UsernameSection`, `PasswordSection`, `PasskeySection`, `ActiveDevicesSection`, `DeleteSection` | No error interaction at the section level.                                  |

**The problem:** When `Page` provides chrome (children mode), it wraps everything in a `CardStateProvider` + renders `Card.Alert`. This works for parent-dependent sections (emails, phone, mfa) — their errors show in the page alert. But self-contained sections (connected accounts, web3) have their own provider, so errors display in duplicate locations OR only inside the section.

**Worse:** If a parent-dependent section like `EmailsSection` is rendered WITHOUT a parent `CardStateProvider` (e.g., directly under `Provider` without a `Page`), `useCardState()` will throw.

**Decision needed:** Should we require all sections to be self-contained? Or enforce that sections only render inside a `Page`?

### 3. Org section components are private

All four section components in `OrganizationGeneralPage.tsx` are unexported module-private `const`s:

- `OrganizationProfileSection` (line 88)
- `OrganizationDomainsSection` (line 137)
- `OrganizationLeaveSection` (line 186)
- `OrganizationDeleteSection` (line 232)

We need to export them for the section registry. This changes the module's public API surface.

### 4. Org leave/delete forms depend on navigation callback

`ActionConfirmationPage.tsx:22` reads `useOrganizationProfileContext().navigateAfterLeaveOrganization` — a callback that navigates away after the user leaves or deletes an org. In the portal path, this navigates to a different route. In the composed path, there's no route to navigate to.

**Decision needed:** What should happen after leaving/deleting an org in the composed path? Callback prop on `Provider`? No-op? The current `OrganizationProfileProvider` doesn't provide `navigateAfterLeaveOrganization`.

### 5. `useUserProfileContext()` is expensive

The hook (`contexts/components/UserProfile.ts`) calls `useSubscription()`, `useStatements()`, and computes `pages` (navbar routes) on every render. Every section wrapper that needs a simple boolean like `shouldAllowIdentificationCreation` triggers all of this.

In the portal path this is fine — the page component calls it once. In the composed path with N independent section wrappers, it's called N times per render.

**Mitigation:** Extract the guard-related values into a lighter hook (e.g., `useUserProfileGuards()`) that doesn't pull billing data or page routes.

### 6. Billing sections only work inside billing Page

Billing sections call `navigate('plans')`, `navigate('statement/${id}')`, etc. These are handled by `useBillingRouter` which only exists when `<Page id="billing">` is the parent.

If someone puts `<Section id="subscriptions" />` under `<Page id="account">`:

- `PageContext` says "account", so the section registry lookup would fail (subscriptions isn't an account section) → renders null. This is the designed behavior (Rule 4).

But if someone puts billing sections under `<Page id="billing">` without children (passthrough mode), the existing BillingPage with tabs renders — section composition is ignored. Need to document this clearly.

### 7. StrictMode compatibility

We already found that `useSafeState` (used by `useLoadingStatus`) breaks in React 18 StrictMode (the `isMountedRef` is never reset after remount). We fixed it, but other hooks may have similar patterns. Each section that uses form submission, loading states, or action menus could be affected. The portal path doesn't use StrictMode, so these bugs only surface in the composed path.

**The composed playground uses `<StrictMode>`.** Any host app might too. We should audit `useSafeState` consumers for similar issues.

---

## Verification

1. **Default rendering**: `<Page id="account" />` renders identically to current `<UserProfile.Account />`
2. **Section omission**: `<Page id="account"><Section id="profile" /></Page>` renders only the profile section
3. **Custom content**: Non-Section children render inline between sections
4. **Environment guards**: Sections hidden by dashboard config render nothing even when explicitly declared
5. **Atomic pages**: Billing tabs, sub-navigation (plans, statements, payments) all work
6. **Error handling**: Section errors surface via `useCardState()` (available when page provides CardStateProvider)
7. **Existing tests**: `pnpm turbo test --filter=@clerk/ui` — all portal-path tests pass unchanged
8. **Playground**: Update `playground/composed/` to exercise all patterns above
