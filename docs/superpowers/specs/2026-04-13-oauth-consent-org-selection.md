# OAuthConsent Organization Selection

## Goal

Allow Clerk-internal callers to enable an organization picker in the `<OAuthConsent />` component. When enabled, the user selects which of their organizations to grant access to, and the selected org's ID is submitted with the consent form POST.

## Architecture

The feature is gated behind an intentionally untyped internal prop (`__internal_enableOrganizationSelection`) that is read via `(p as any)` in the context translation layer and stored as a typed boolean on the internal `OAuthConsentCtx`. The `OAuthConsent` component reads it from context, fetches the user's org memberships via `useOrganizationList`, and renders the existing `OrgSelect` UI. A hidden `<input name="organization_id">` carries the selected org ID into the native form POST.

## Files

**Modify:**

- `packages/shared/src/types/clerk.ts` — no changes (prop is intentionally untyped)
- `packages/ui/src/types.ts` — add `enableOrganizationSelection?: boolean` to `OAuthConsentCtx`
- `packages/ui/src/contexts/ClerkUIComponentsContext.tsx` — read `(p as any).__internal_enableOrganizationSelection` and forward it into context
- `packages/ui/src/components/OAuthConsent/OAuthConsent.tsx` — replace fake data + `renderOrgSelect = false` gate with real org list and context-driven gate; add hidden input

## Detailed Design

### `OAuthConsentCtx` (packages/ui/src/types.ts)

Add one field:

```ts
/**
 * When true, renders the organization picker and submits organization_id
 * with the consent form. Internal use only — not exposed in the public prop type.
 */
enableOrganizationSelection?: boolean;
```

### Context translation (ClerkUIComponentsContext.tsx)

Inside the `OAuthConsent` case, add `enableOrganizationSelection` to the context value:

```ts
enableOrganizationSelection: (p as any).__internal_enableOrganizationSelection === true,
```

### OAuthConsent component

Remove:

```ts
const FAKE_ORG_OPTIONS: OrgOption[] = [...];
const [selectedOrg, setSelectedOrg] = useState<string | null>('clerk-nation');
const renderOrgSelect = false;
```

Add:

```ts
const { userMemberships } = useOrganizationList({
  userMemberships: {},
});

const orgOptions: OrgOption[] = (userMemberships.data ?? []).map(m => ({
  value: m.organization.id,
  label: m.organization.name,
  logoUrl: m.organization.imageUrl,
}));

const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

// Set initial selection once memberships load.
useEffect(() => {
  if (orgOptions.length > 0 && selectedOrg === null) {
    setSelectedOrg(orgOptions[0].value);
  }
}, [orgOptions.length]);
```

Render the `OrgSelect` (replacing the `renderOrgSelect` block):

```tsx
{
  ctx.enableOrganizationSelection && userMemberships.isLoaded && (
    <OrgSelect
      options={orgOptions}
      value={selectedOrg}
      onChange={setSelectedOrg}
    />
  );
}
```

Add the hidden input inside the `<form>`, rendered only when the feature is on and an org is selected:

```tsx
{
  ctx.enableOrganizationSelection && selectedOrg && (
    <input
      type='hidden'
      name='organization_id'
      value={selectedOrg}
    />
  );
}
```

The hidden input is placed at the bottom of the `<form>`, alongside the existing `forwardedParams` hidden inputs, so it is included in the native POST to the FAPI consent action URL.

## Behavior

- Feature off (default): `OrgSelect` is not rendered, no `organization_id` field in the POST body. Existing behavior is unchanged.
- Feature on, orgs loaded, org selected: `OrgSelect` shows the user's memberships. Selecting an org updates `selectedOrg` state, which updates the hidden input. The Allow POST includes `organization_id=<selected_org_id>`.
- Feature on, no orgs: `OrgSelect` renders with an empty list; no hidden input is added (since `selectedOrg` stays `null`).

## Caller Usage

Internal callers pass the prop by casting:

```ts
Clerk.__internal_mountOAuthConsent(app, {
  __internal_enableOrganizationSelection: true,
} as any);
```

TypeScript will not surface the field in autocomplete or require it in the type — that is intentional.
