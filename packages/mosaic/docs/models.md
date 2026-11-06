# Models

The model is the adapter from Clerk into plain data. It is the **only layer in a
Mosaic flow that may import Clerk hooks or call Clerk resource methods** — the
controller (`controllers.md`) and the view (`views.md`) stay Clerk-free, which is
what makes both testable without a Clerk fixture.

Worked example: `packages/mosaic/src/features/switcher/switcher.model.tsx`. See
`packages/mosaic/ARCHITECTURE.md` → "Models" for the layer contract.

## Shape

A discriminated union on `status`, so consumers branch on one value instead of a
scatter of `isLoaded` flags:

```tsx
export type SwitcherModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (SwitcherData & SwitcherCallbacks & { status: 'ready'; organizationsEnabled: boolean });
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

- **Own cache updates.** Update the cache after a mutation, from inside the
  callback that made it. Deciding _how_ is model logic: patch the returned
  resource in with `replaceInPages` on success, and revalidate on failure, since
  a failed mutation might mean stale state:

  ```tsx
  onAcceptSuggestion: async suggestionId => {
    try {
      const accepted = await suggestionData.find(s => s.id === suggestionId)?.accept();
      if (accepted) {
        await userSuggestions.setData?.(pages => replaceInPages(pages ?? [], accepted));
      }
    } catch (error) {
      // A failed accept might be stale state. allSettled never throws,
      // so a failed revalidate doesn't look like a failed accept.
      await Promise.allSettled([userSuggestions.revalidate?.()]);
      throw error;
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
- An action Clerk may interrupt for step-up verification wraps its Clerk call in
  `useReverificationFlow` (`features/reverification/`) before any error mapping,
  because the flow has to see the raw Clerk error. The hook is called at the top
  of the model hook, above its early returns; the fetcher is the raw Clerk call
  and takes the resource it acts on as an argument; the exposed callback runs the
  wrapped action inside `save`; and the model returns the `reverification`
  controller beside its callbacks (`user-profile-email-section.model.ts`). A
  cancelled challenge rejects the callback with a `reverification_cancelled`
  error, which `save` lets through for the controller to recognise.
  A direct action can use the same flow with `ReverificationDialog`
  (`blocks/reverification/`) in the view;
  a confirmation action passes the controller to `useConfirmController`.
- No local UI state. What is open and what is in flight belong to the controller.
- No React state machinery beyond the Clerk hooks themselves. Certain Mosaic hooks
  can also count when they deal with "outside" state, like `useReverificationFlow`
  described above, and the query hooks in `src/queries/` that cache a Clerk
  resource read; the model is a derivation of what Clerk currently says.
  The other exception is what to fetch: a search query, page, or sort the
  Clerk hook takes as input lives in the model beside the page the hook already
  holds, and the model exposes a callback to change it (`search(query)` sets the
  query and returns to page 1). The controller keeps the interaction around it,
  such as the input's value and the debounce, and calls that callback.

## Time-dependent display data

Use the shared `useNow` hook and `MosaicProvider` clock support introduced in
[#10098](https://github.com/clerk/javascript/pull/10098). These APIs must be
available in the consuming branch before following this guidance.

`MosaicProvider` supplies a shared initial `Date`. Read it with `useNow` from
`src/hooks/use-now.ts` in the consuming component or controller, then pass the
value to pure formatting helpers. For relative labels that refresh each minute,
use `useNow({ updateInterval: 60_000 })`. Without an interval, the hook retains
its initial value. Pass `until` to stop ticking once that time is reached, as
`useResendSeconds` does for a resend cooldown whose unlock time lives in the
machine. Reuse this API instead of adding a feature-specific clock provider or
timer.

In tests, supply a fixed `Date` through `MosaicNowProvider`, assert the displayed
label, then advance fake timers across a label boundary and assert the update.
If a feature supports SSR, also verify matching initial times during server
rendering and hydration. Sharing time within one provider tree does not by
itself guarantee agreement between server and client.

## Private API requests

Use `useMosaicFetch` from `src/hooks/use-mosaic-fetch.ts` when a new Mosaic
flow needs an API request before its resource API is stable. The hook loads the
request capability through the existing Clerk module manager. The core request
layer still owns authentication, serialization, API errors, and client updates.
An older runtime without this capability rejects the request with a localized
error. No legacy UI provider is required.

The hook rejects a request if the session or organization changes while the
runtime module loads. This check covers the loading step only. It does not
cancel a request already sent or protect later waits inside the request layer,
such as a CAPTCHA challenge.

Keep endpoint types and query hooks private to Mosaic. Use `useMosaicQuery` and
`useMosaicMutation` from `src/hooks/`. They call the official React Query hooks
and supply the client through `useMosaicQueryClient`. Use that client hook
directly when a callback needs to update or invalidate cached data. It returns
the existing shared client in the browser and a client local to the hook
during server rendering. Queries do not run
during server rendering. Do not replace the client while a hook is mounted.

Do not add a `QueryClientProvider` or mount the shared client here. This keeps
the application query context and existing focus/reconnect behavior unchanged.
Keep query keys compatible with the cached data type. Use separate keys for raw
API data and Clerk resources, and invalidate related queries after a write.
The controller still uses
`useForm` or `usePendingAction` for the interaction. Return a promise that covers
the write and required cache work.

Keep request construction in plain functions beside the query hook. These
functions receive the request capability and own the endpoint, parameters,
response types, and required response checks. The hook owns query keys,
identity checks, request state, and invalidation.
Use `mFetch` for the value returned by `useMosaicFetch`. Its type is
`MosaicFetch`, and it calls `runtime.fetch`. Unlike global `fetch`, it accepts
Clerk request options, returns parsed data, and throws Clerk errors.
This keeps the endpoint code usable without React or a resource class.

Use a separate hook for each query or mutation operation. Return the TanStack
result directly so callers retain its state and methods. Compose these hooks
in the model when a screen needs both reads and writes. Each mutation hook
owns invalidation and can run without mounting the query hook. Its
`mutateAsync` promise resolves after the write and required cache work finish.
Query state and mutation state remain separate. The controller still owns the
form's pending state through the promise returned by the model.

Include identity in cache keys. Late writes must not populate a new session or
organization's cache.

## Testing

The feature test covers the model by default, running it against a real Clerk
with FAPI faked. It is the
**highest-risk layer**: when a migration loses behavior, it is usually a model
responsibility (revalidate timing, a permission gate, an empty-state rule) that
quietly went missing, so give those cases a feature test each. A rule with many
combinations can move into a pure function with a unit test. See `testing.md`.
