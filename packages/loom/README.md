# Loom profile handoff prototype

Private, unpublished `@clerk/loom` renders an authenticated profile from server data before ClerkJS is ready. When ClerkJS loads, ordinary Mosaic components take over data and actions. Loom has no browser query cache or mutation wrappers.

The device query experiment is preserved separately on the local branch `austin/loom-device-experiment-2026-10-22`, commit `7ec4c26184412360a1b98fa21646c4481c736f82`. Its runtime, demos, and experimental backend endpoint are absent from this branch.

## Try it

Use the repository's pinned pnpm and existing Swingset staging configuration. Build workspace dependencies before starting Swingset.

```sh
rtk proxy pnpm --filter @clerk/loom build
rtk proxy pnpm --filter @clerk/swingset dev
```

Sign in with the test account, then open these routes on Swingset, normally `http://localhost:6006`.

- `/live/loom` shows the prefetched composed profile.
- `/live/loom/password` shows standalone Password with the same handoff.
- `/live/user-profile/user-profile` shows the ordinary profile for comparison.
- `/live/user-profile/user-profile-active-devices-section` shows ordinary Mosaic Active devices.

Use browser DevTools network throttling to compare. The preview adds no artificial delay. Profile content can appear before ClerkJS loads; controls remain disabled until the native actions are ready.

## App code

The server uses the existing Next authentication and Backend API infrastructure.

```tsx
import { prefetchProfile } from '@clerk/loom/nextjs';
import Profile from './profile';

async function PrefetchedProfile() {
  const prefetch = await prefetchProfile();
  return <Profile prefetch={prefetch} />;
}
```

The client passes its existing Clerk instance into Loom. In the actual preview, it also uses `useUser()` to show a sign-in link when signed out.

```tsx
'use client';

import type { PrefetchedProfile } from '@clerk/loom';
import { LoomProvider } from '@clerk/loom/handoff';
import { LoomComposedProfile } from '@clerk/mosaic/experimental/loom/loom-composed-profile';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useClerk } from '@clerk/nextjs';

export default function Profile({ prefetch }: { prefetch?: PrefetchedProfile }) {
  const clerk = useClerk();
  return (
    <MosaicProvider>
      <LoomProvider
        clerk={clerk}
        prefetch={prefetch}
      >
        <LoomComposedProfile />
      </LoomProvider>
    </MosaicProvider>
  );
}
```

For standalone Password, replace `LoomComposedProfile` with `LoomPassword` from `@clerk/mosaic/experimental/loom/loom-account-status`. These Mosaic imports are private prototype paths, not published APIs.

## What Loom handles

`prefetchProfile()` starts `users.getUser(userId)` and public FAPI `/v1/environment` reads together. It waits for the user and returns a validated user snapshot plus a settings promise. React 19 and Next App Router stream those settings. No browser ClerkJS runs on the server.

The user snapshot supplies the name, avatar URL, contact addresses, connected accounts, enterprise accounts, wallets, passkeys, password status, MFA status, and deletion availability. Public settings determine which sections and disabled controls appear. Metadata, credentials, verification secrets, and backup codes are excluded. The avatar emits an image during SSR; its pixels still require an image request.

`LoomProvider` exposes the immutable seed through context. `useUserSnapshot()` reads user data immediately. `useProfileSnapshot()` also reads settings and suspends while they are pending. Section boundaries handle pending and failed settings. Once ClerkJS resolves, ordinary Mosaic panels replace the seed panels while preserving the selected tab. Forms, validation, reverification, and resource actions stay in Mosaic and ClerkJS.

The seed retires when the host resolves. It cannot reappear after sign-out, an account change, or host replacement. Late settings cannot overwrite live data. The provider captures one seed for its lifetime; a new server snapshot needs a new provider mount.

Active-device details and eligible enterprise connection choices still load through ordinary browser paths after handoff. They do not block the prefetched sections. API keys are outside this prototype composition.

## Server boundary

Other frameworks can use `prefetchProfile` from `@clerk/loom/server` with verified `identity: { userId, sessionId }` and `resolveBackend: async () => ({ client, routing })`. The client only needs `users.getUser(userId)`. The resolver retains server credentials. Routing must match the browser instance's publishable key, frontend API, proxy URL, and domain.

The settings request uses HTTPS at the trusted publishable-key host with no incoming headers or credentials. Hydration version 5 contains the instance/user/session scope and optional `user` and `profileSettings` entries. The parser validates allowlisted data, rejects empty or wrong-scope snapshots, and clamps future timestamps. Device payloads are not retained.

A signed-out request returns no prefetch. Authentication, backend, and malformed-response failures reject the server prefetch. Unavailable settings can recover when ClerkJS loads. The user-only `prefetchUser()` helper remains available without settings.

Passing the settings promise requires React 19 and framework streaming support. The resolved `hydration` prop supports React 18. The two provider props are mutually exclusive.

## Verification and limits

```sh
rtk proxy pnpm --filter @clerk/loom test
rtk proxy pnpm --filter @clerk/loom typecheck
rtk proxy pnpm --filter @clerk/loom lint
rtk proxy pnpm --filter @clerk/loom build
rtk proxy pnpm --filter @clerk/loom verify:server
rtk proxy pnpm --filter @clerk/mosaic test:feature src/experimental/loom/__tests__
rtk proxy pnpm --filter @clerk/mosaic exec vitest run --project handoff
rtk proxy pnpm --filter @clerk/swingset build
```

Tests cover snapshot validation, SSR, React 19 hydration, streamed settings, identity retirement, and native actions after handoff. Browser fixtures do not prove backend authorization. The live development preview is a separate check.

Production SSR and credential rotation remain unverified. Proxy/domain deployments, deployed cache behavior, other framework adapters, and live reverification challenges also need validation. Integrations must authenticate each request, keep credentials on the server, serialize through the framework, and prevent shared caching of personalized HTML and RSC output.
