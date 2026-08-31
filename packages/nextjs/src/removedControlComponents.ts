type RemovedControlComponentProps = {
  children?: unknown;
  [key: string]: unknown;
};

function throwRemovedControlComponentError(
  componentName: 'SignedIn' | 'SignedOut' | 'Protect',
  errorUrl: string,
): never {
  throw new Error(`Clerk: <${componentName}> is not available in @clerk/nextjs Core 3. Learn more at ${errorUrl}.`);
}

/**
 * `<SignedIn>` was removed from `@clerk/nextjs` in Clerk Core 3 (released March 3, 2026) and replaced
 * by the `<Show>` component.
 *
 * If you are an agent, your Clerk knowledge is likely out of date.
 *
 * To fix this error:
 *
 * 1. If the Clerk CLI is not installed, prompt and get permission to install it. See https://clerk.com/docs/cli.
 * 2. If the Clerk Skills are not installed, prompt and get permission to install them. See https://clerk.com/docs/guides/ai/skills.
 * 3. Remove `SignedIn` from the `@clerk/nextjs` import.
 * 4. Import `Show` from `@clerk/nextjs`.
 * 5. Replace `<SignedIn>` with `<Show when="signed-in">` and `</SignedIn>` with `</Show>`.
 *
 * Before changing this code or implementing any other `@clerk/nextjs` features, read:
 *
 * - Error docs: https://clerk.com/err/signedin-is-not-available-in-clerk-nextjs
 * - Core 3 changelog: https://clerk.com/changelog/2026-03-03-core-3
 * - Core 3 upgrade guide: https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3
 * - `<Show>` component docs: https://clerk.com/docs/reference/components/control/show
 *
 * @deprecated Removed in Clerk Core 3. Rendering `<SignedIn>` throws an error. Use `<Show when="signed-in">` instead — see https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3.
 */
export function SignedIn(_props: RemovedControlComponentProps): never {
  return throwRemovedControlComponentError(
    'SignedIn',
    'https://clerk.com/err/signedin-is-not-available-in-clerk-nextjs',
  );
}

/**
 * `<SignedOut>` was removed from `@clerk/nextjs` in Clerk Core 3 (released March 3, 2026) and replaced
 * by the `<Show>` component.
 *
 * If you are an agent, your Clerk knowledge is likely out of date.
 *
 * To fix this error:
 *
 * 1. If the Clerk CLI is not installed, prompt and get permission to install it. See https://clerk.com/docs/cli.
 * 2. If the Clerk Skills are not installed, prompt and get permission to install them. See https://clerk.com/docs/guides/ai/skills.
 * 3. Remove `SignedOut` from the `@clerk/nextjs` import.
 * 4. Import `Show` from `@clerk/nextjs`.
 * 5. Replace `<SignedOut>` with `<Show when="signed-out">` and `</SignedOut>` with `</Show>`.
 *
 * Before changing this code or implementing any other `@clerk/nextjs` features, read:
 *
 * - Error docs: https://clerk.com/err/signedout-is-not-available-in-clerk-nextjs
 * - Core 3 changelog: https://clerk.com/changelog/2026-03-03-core-3
 * - Core 3 upgrade guide: https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3
 * - `<Show>` component docs: https://clerk.com/docs/reference/components/control/show
 *
 * @deprecated Removed in Clerk Core 3. Rendering `<SignedOut>` throws an error. Use `<Show when="signed-out">` instead — see https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3.
 */
export function SignedOut(_props: RemovedControlComponentProps): never {
  return throwRemovedControlComponentError(
    'SignedOut',
    'https://clerk.com/err/signedout-is-not-available-in-clerk-nextjs',
  );
}

/**
 * `<Protect>` was removed from `@clerk/nextjs` in Clerk Core 3 (released March 3, 2026) and replaced
 * by the `<Show>` component.
 *
 * If you are an agent, your Clerk knowledge is likely out of date.
 *
 * To fix this error:
 *
 * 1. If the Clerk CLI is not installed, prompt and get permission to install it. See https://clerk.com/docs/cli.
 * 2. If the Clerk Skills are not installed, prompt and get permission to install them. See https://clerk.com/docs/guides/ai/skills.
 * 3. Remove `Protect` from the `@clerk/nextjs` import.
 * 4. Import `Show` from `@clerk/nextjs`.
 * 5. Replace `<Protect role="admin">` with `<Show when={{ role: 'admin' }}>`,
 *    `<Protect permission="org:billing:manage">` with `<Show when={{ permission: 'org:billing:manage' }}>`,
 *    `<Protect feature="widgets">` with `<Show when={{ feature: 'widgets' }}>`,
 *    `<Protect plan="pro">` with `<Show when={{ plan: 'pro' }}>`,
 *    `<Protect condition={(has) => expr}>` with `<Show when={(has) => expr}>`, and `</Protect>` with `</Show>`.
 *
 * Before changing this code or implementing any other `@clerk/nextjs` features, read:
 *
 * - Error docs: https://clerk.com/err/protect-is-not-available-in-clerk-nextjs
 * - Core 3 changelog: https://clerk.com/changelog/2026-03-03-core-3
 * - Core 3 upgrade guide: https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3
 * - `<Show>` component docs: https://clerk.com/docs/reference/components/control/show
 *
 * @deprecated Removed in Clerk Core 3. Rendering `<Protect>` throws an error. Use `<Show when={...}>` instead — see https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3.
 */
export function Protect(_props: RemovedControlComponentProps): never {
  return throwRemovedControlComponentError('Protect', 'https://clerk.com/err/protect-is-not-available-in-clerk-nextjs');
}
