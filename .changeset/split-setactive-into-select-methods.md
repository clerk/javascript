---
'@clerk/clerk-js': major
'@clerk/shared': major
'@clerk/react': major
'@clerk/nextjs': major
'@clerk/vue': major
'@clerk/expo': major
'@clerk/ui': major
'@clerk/testing': major
---

Replace `setActive` with purpose-specific methods: `selectSession` and `selectOrganization`

## Breaking Changes

### `setActive` Removed from Public API

The `setActive` method has been removed from the Clerk object and all hooks. Use the new purpose-specific methods instead:

- `clerk.selectSession(session, options?)` - For session selection
- `clerk.selectOrganization(organization, options?)` - For organization selection

### Hook Return Types

The following hooks no longer return `setActive`:

- `useSignIn()` - now returns `selectSession` instead of `setActive`
- `useSignUp()` - now returns `selectSession` instead of `setActive`
- `useSessionList()` - now returns `selectSession` instead of `setActive`
- `useOrganizationList()` - now returns `selectOrganization` instead of `setActive`

### Migration

**Before:**
```tsx
const { setActive } = useSignIn();
await setActive({ session: createdSessionId });

const { setActive } = useOrganizationList();
await setActive({ organization: org });
```

**After:**
```tsx
const { selectSession } = useSignIn();
await selectSession(createdSessionId);

const { selectOrganization } = useOrganizationList();
await selectOrganization(org);
```

### New Methods on Clerk Object

Two new methods are available on the Clerk object:

- `clerk.selectSession(session, options?)` - For session selection (sign-in, sign-up, multi-session switching)
- `clerk.selectOrganization(organization, options?)` - For organization selection (org switching, personal workspace)

### Options

Both methods accept an options object:

```tsx
// selectSession options
await selectSession(session, {
  redirectUrl?: string;
  navigate?: ({ session }) => void | Promise<void>;
});

// selectOrganization options
await selectOrganization(organization, {
  redirectUrl?: string;
  navigate?: ({ session, organization }) => void | Promise<void>;
});
```

### Expo Hooks

The `StartGoogleAuthenticationFlowReturnType` and `StartAppleAuthenticationFlowReturnType` types now return `selectSession` instead of `setActive`.

### Internal Window Hooks (Next.js)

The internal window hooks have been renamed:
- `__internal_onBeforeSetActive` → `__internal_onBeforeSelectSession`
- `__internal_onAfterSetActive` → `__internal_onAfterSelectSession`

### Types Removed

The following types have been removed from the public API:
- `SetActive`
- `SetActiveParams`
- `SetActiveNavigate` (use `SelectSessionNavigate` instead)
