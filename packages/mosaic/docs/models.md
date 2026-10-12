# Models

The model is the adapter from Clerk into plain data. It is the **only layer in a
Mosaic flow that may import Clerk hooks or call Clerk resource methods** — the
controller (`controllers.md`) and the view (`views.md`) stay Clerk-free, which is
what makes both testable without a Clerk fixture.

Worked example: `packages/mosaic/src/features/user-button/user-button.model.tsx`. See
`packages/mosaic/ARCHITECTURE.md` → "Models" for the layer contract.

## Shape

A discriminated union on `status`, so consumers branch on one value instead of a
scatter of `isLoaded` flags:

```tsx
export type UserButtonModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (UserButtonData & UserButtonCallbacks & { status: 'ready'; organizationsEnabled: boolean });
```

`hidden` is an **answer**, not an absence: signed out is settled, so the wrapper
drops the fallback instead of holding the space open. Keep the two apart.

## Responsibilities

- **Read Clerk state.** `useUser()`, `useSession()`, `useOrganization()`,
  `useClerk()`, plus `useMosaicEnvironment()` / `useMosaicRouter()`.
- **Wait for everything that affects layout before answering `ready`.** Answering
  early and filling in later is a reshuffle the user sees:

  ```tsx
  if (!isUserLoaded || !isSessionLoaded || !isOrgLoaded || !environment) {
    return { status: 'loading' };
  }
  ```

  A list that only fills part of a surface is the exception — expose it as a
  `…Loading` flag in the data so the surface renders and that region stands in.

- **Map resources to plain rows.** `toMembership(organization)`,
  `toSession(id, user)` — the shapes in `*.types.ts`, never the resource itself.
- **Gate permissions and capability.** `session.checkAuthorization(...)`,
  `user.createOrganizationEnabled`, `authConfig.singleSessionMode`. Express the
  result by **omitting the callback**, not by a disabled flag:

  ```tsx
  onInviteMembers: canInviteMembers ? () => clerk.openInviteMembers({ getContainer }) : undefined,
  onSignOutAll: singleSessionMode ? undefined : () => clerk.signOut(),
  ```

  The view hides the affordance an absent callback drives, so the model never has
  to describe UI.

- **Own revalidate timing.** Call `.revalidate()` / `.reload()` after a mutation,
  from inside the callback that made it. Deciding _when_ is model logic:

  ```tsx
  onAcceptInvitation: async invitationId => {
    try {
      await invitationData.find(i => i.id === invitationId)?.accept();
    } finally {
      // Always revalidate — a failed accept might be stale state. allSettled never throws,
      // so a failed revalidate doesn't look like a failed accept.
      await Promise.allSettled([userInvitations.revalidate?.(), userMemberships.revalidate?.()]);
    }
  },
  ```

- **Resolve navigation vs modal.** A consumer's URL is the whole opt-in; type the
  pair so it cannot contradict itself:

  ```ts
  type UserProfileMode =
    | { userProfileUrl: string; userProfileMode?: 'navigation' }
    | { userProfileUrl?: never; userProfileMode?: 'modal' };
  ```

## Rules

- Return **plain data and plain functions**. A callback takes ids (`sessionId`,
  `organizationId`), never a resource.
- Derive plain data types from `@clerk/shared/types` before writing a shape by
  hand. Search it first; when a field mirrors a resource, `Pick` it so the type
  cannot drift from Clerk's:

  ```ts
  export type APIKeyRecord = Pick<APIKeyResource, 'id' | 'name' | 'createdAt' | 'expiration' | 'lastUsedAt'>;
  ```

  Write a type by hand only for what Clerk has no type for, such as a
  formatted label or a UI-only flag.

- A model hook is called by a wrapper, never by a view. A wrapper in another
  feature may call it too: the profile API keys panels call `useAPIKeysAccess`
  from `api-keys-table.model.ts` to decide whether to render the table.
- An async callback returns its promise — the controller drives pending state off
  it. Navigation callbacks stay fire-and-forget.
- Never format an error. Let Clerk errors propagate untouched. For a failure
  the model detects itself, throw
  `new ClerkRuntimeError(message, { code })` and add the copy for `code` to
  `src/localization/errors.messages.ts`. No `try`/`catch` that turns errors into
  strings, no feature-level `toError` helpers.
- A callback that backs a form wraps its Clerk call in `save(run, fields, params)`
  from `utils/errors.ts`. It rethrows a Clerk error as a `SaveError` routed to
  the form fields it names, which the form renders
  (`user-profile-profile-section.model.ts`).
- No local UI state. What is open and what is in flight belong to the controller.
- No React state machinery beyond the Clerk hooks themselves; the model is a
  derivation of what Clerk currently says. The exception is what to fetch: a
  search query, page, or sort the Clerk hook takes as input lives in the model
  beside the page the hook already holds, and the model exposes a callback to
  change it (`search(query)` sets the query and returns to page 1). The
  controller keeps the interaction around it, such as the input's value and
  the debounce, and calls that callback.

## Time-dependent display data

Use the shared `useNow` hook and `MosaicProvider` clock support introduced in
[#10098](https://github.com/clerk/javascript/pull/10098). These APIs must be
available in the consuming branch before following this guidance.

`MosaicProvider` supplies a shared initial `Date`. Read it with `useNow` from
`src/hooks/use-now.ts` in the consuming component or controller, then pass the
value to pure formatting helpers. For relative labels that refresh each minute,
use `useNow({ updateInterval: 60_000 })`. Without an interval, the hook retains
its initial value. Reuse this API instead of adding a feature-specific clock
provider or timer.

In tests, supply a fixed `Date` through `MosaicNowProvider`, assert the displayed
label, then advance fake timers across a label boundary and assert the update.
If a feature supports SSR, also verify matching initial times during server
rendering and hydration. Sharing time within one provider tree does not by
itself guarantee agreement between server and client.

## Testing

The feature test covers the model by default, running it against a real Clerk
with FAPI faked. It is the
**highest-risk layer**: when a migration loses behavior, it is usually a model
responsibility (revalidate timing, a permission gate, an empty-state rule) that
quietly went missing, so give those cases a feature test each. A rule with many
combinations can move into a pure function with a unit test. See `testing.md`.
