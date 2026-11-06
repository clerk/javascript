# Models

Read this when you write or change a `*.model.ts(x)`, add a Clerk read, mutation or permission check to a feature, or build a feature from a design before Clerk's API can back it. It covers the model's shape, what it owns and how it reports errors; the layer split is in [Features](features.md).

Worked example: `src/features/switcher/switcher.model.tsx`.

## Rules

- The model is the only layer that imports Clerk hooks or calls Clerk resource methods, which is what lets the controller and view be tested without a Clerk fixture.
- Return plain data and plain functions. A callback takes ids (`sessionId`, `organizationId`), never a resource.
- A model hook is called by a wrapper, never by a view. A wrapper in another feature may call it too: the profile API keys panels call `useAPIKeysAccess` from `api-keys-table.model.ts` to decide whether to render the table.
- An async callback returns its promise, because the controller drives pending state off it. Navigation callbacks stay fire-and-forget.
- No local UI state. What is open and what is in flight belong to the controller.
- No React state beyond the Clerk hooks, because the model is a derivation of what Clerk currently says. The exceptions are hooks that hold outside state (`useReverificationFlow`, the query hooks in `src/queries/` that cache a Clerk read) and what to fetch: a search query, page or sort the Clerk hook takes as input lives in the model beside the page the hook holds, behind a callback (`search(query)` sets the query and returns to page 1). The controller keeps the input's value and the debounce, and calls that callback.

## Shape

A discriminated union on `status`, so consumers branch on one value instead of a scatter of `isLoaded` flags:

```tsx
export type SwitcherModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (SwitcherData & SwitcherCallbacks & { status: 'ready'; organizationsEnabled: boolean });
```

`hidden` is an answer, not an absence: signed out is settled, so the wrapper drops the fallback instead of holding the space open. Keep `hidden` and `loading` apart.

## What the model owns

- **Clerk state.** `useUser()`, `useSession()`, `useOrganization()`, `useClerk()`, plus `useMosaicEnvironment()` and `useMosaicRouter()`.
- **Waiting before `ready`.** Wait for everything that affects layout, because answering early and filling in later is a reshuffle the user sees. A list that fills only part of a surface is the exception: expose it as a `…Loading` flag in the data, so the surface renders and that region shows its skeleton.
- **Plain rows.** Map resources to the shapes in `*.types.ts` (`toMembership(organization)`, `toSession(id, user)`), never pass the resource. Derive those types from `@clerk/shared/types` first: when a field mirrors a resource, `Pick` it so it cannot drift (`Pick<APIKeyResource, 'id' | 'name' | 'createdAt'>`). Write a type by hand only for what Clerk has no type for, such as a formatted label or a UI-only flag.
- **Permissions and capability.** `session.checkAuthorization(...)`, `user.createOrganizationEnabled`, `authConfig.singleSessionMode`. Express the result by omitting the callback, not by a disabled flag, so the model never describes UI:

  ```tsx
  onSignOutAll: singleSessionMode ? undefined : () => clerk.signOut(),
  ```

- **Cache updates.** Update the cache from inside the callback that mutated. On success patch the returned resource in with `replaceInPages`; on failure revalidate with `Promise.allSettled`, since a failed mutation may mean stale state and a failed revalidate must not look like a failed mutation (`onAcceptSuggestion` in `switcher.model.tsx`).
- **Navigation vs modal.** A consumer's URL is the whole opt-in. Type the pair so it cannot contradict itself: `{ userProfileUrl: string; userProfileMode?: 'navigation' } | { userProfileUrl?: never; userProfileMode?: 'modal' }`.

## Errors

- Never format an error. Let Clerk errors propagate untouched; no `try`/`catch` that turns errors into strings, and no feature-level `toError` helpers. The controller's owners map them ([Controllers → Errors](controllers.md#errors)).
- For a failure the model detects itself, throw `new ClerkRuntimeError(message, { code })` and add the copy for `code` to `src/localization/errors.messages.ts`.
- A callback that backs a form wraps its Clerk call in `save(run, fields, params)` from `src/utils/errors.ts`, which rethrows a Clerk error as a `SaveError` routed to the fields it names (`user-profile-profile-section.model.ts`).

## Step-up verification

An action Clerk may interrupt for reverification wraps its Clerk call in `useReverificationFlow` (`src/features/reverification/`) before any error mapping, because the flow has to see the raw Clerk error. Worked example: `user-profile-email-section.model.ts`.

- Call the hook at the top of the model hook, above its early returns.
- The fetcher is the raw Clerk call and takes the resource it acts on as an argument.
- The exposed callback runs the wrapped action inside `save`.
- Return the `reverification` controller beside the callbacks. A confirmation action passes it to `useConfirmController`; a direct action passes it to `ReverificationDialog` (`src/blocks/reverification/`) in the view.

A cancelled challenge rejects the callback with a `reverification_cancelled` error, which `save` lets through for the controller to recognise.

## Before the API exists

A feature built from a design before Clerk can back it still starts with its model. Write the model's return type first, the same shape a real model returns: a `status`, plain data and callbacks. The model hook comes when the API does.

- **`Pick` what Clerk already has.** Search `@clerk/shared/types` before writing a field. A new design often needs types Clerk already has, such as `OrganizationEnrollmentMode` or `EnterpriseConnectionResource`.
- **Name the rest for the resource it will become.** A type Clerk does not have yet is named for that future resource (`EnterpriseConnectionTest`), not for the screen (`AccessData`). When the resource lands, the type becomes a `Pick`.
- **The swingset fixture implements that type.** It builds a ready model and passes it to the feature's real controller and view (`CreateOrganizationReadyModel` in `packages/swingset/src/stories/create-organization.stories.tsx`).
- **Composition stays in Mosaic.** The wrapper, and whatever it renders around the view (a title, a back action, a footer), lives in the feature. Swingset supplies data and nothing else, because code there has no feature test and is thrown away when the model lands.

```ts
export type SsoConnection = Pick<EnterpriseConnectionResource, 'id' | 'name' | 'provider' | 'active' | 'domains'>;

export interface EnterpriseConnectionTest {
  success: boolean;
  email?: string;
}

export type SsoModel =
  | { status: 'loading' }
  | {
      status: 'ready';
      connections: SsoConnection[];
      enrollmentMode: OrganizationEnrollmentMode;
      onTestConnection: (connectionId: string) => Promise<EnterpriseConnectionTest>;
      onSave: (values: SsoValues) => Promise<void>;
    };
```

## Time-dependent display data

`MosaicProvider` supplies a shared initial `Date`. Read it with `useNow` (`src/hooks/use-now.ts`) in the component or controller that displays it, then pass it to pure formatting helpers. Do not add a feature-specific clock or timer.

- `useNow({ updateInterval: 60_000 })` refreshes a relative label each minute. Without an interval the hook keeps its initial value.
- Pass `until` to stop ticking at a deadline, as `useResendSeconds` does for a resend cooldown whose unlock time lives in the machine.

## Testing

The feature test covers the model, against a real Clerk with FAPI faked ([Testing](testing.md)). It is the highest-risk layer: when a migration loses behavior, it is usually a model rule (revalidate timing, a permission gate, an empty state) that went missing, so give each of those a feature test. A rule with many combinations can move into a pure function with a unit test.

For time-dependent labels, supply a fixed `Date` through `MosaicNowProvider`, assert the label, then advance fake timers across a label boundary and assert the update. If the feature supports SSR, also check that the server and the client render the same initial time; sharing one provider tree does not guarantee that by itself.
