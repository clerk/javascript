# Models

The model is the adapter from Clerk into plain data. It is the **only layer in a
Mosaic flow that may import Clerk hooks or call Clerk resource methods** — the
controller (`controllers.md`) and the view (`views.md`) stay Clerk-free, which is
what makes both testable without a Clerk fixture.

Worked example: `packages/ui/src/mosaic/user-button/user-button.model.tsx`. See
`references/mosaic-architecture.md` → "Models" for the layer contract.

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
- An async callback returns its promise — the controller drives pending state off
  it. Navigation callbacks stay fire-and-forget.
- No local UI state. What is open and what is in flight belong to the controller.
- No React state machinery beyond the Clerk hooks themselves; the model is a
  derivation of what Clerk currently says.

## Testing

Mock `@clerk/shared/react` with mutable module-level vars reset in `beforeEach`,
then `renderHook` the model and assert its output. This is the **highest-risk,
least-covered layer**: it holds the Clerk resource semantics no other test can
reach. When a migration loses behavior, it is usually a model responsibility
(revalidate timing, a permission gate, an empty-state rule) that quietly went
missing — concentrate scrutiny here. See `testing.md`.
