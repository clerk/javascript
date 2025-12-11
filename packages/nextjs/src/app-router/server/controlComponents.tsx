import type { PendingSessionOptions, ShowWhenCondition } from '@clerk/shared/types';
import React from 'react';

import { auth } from './auth';

export type AppRouterShowProps = React.PropsWithChildren<
  PendingSessionOptions & {
    fallback?: React.ReactNode;
    when: ShowWhenCondition;
  }
>;

/**
 * Use `<Show/>` to render children when an authorization or sign-in condition passes.
 * When `treatPendingAsSignedOut` is true, pending sessions are treated as signed out.
 * Renders the provided `fallback` (or `null`) when the condition fails.
 *
 * The `when` prop supports:
 * - `"signedIn"` or `"signedOut"` shorthands
 * - Authorization objects such as `{ permission: "..." }`, `{ role: "..." }`, `{ feature: "..." }`, or `{ plan: "..." }`
 * - Predicate functions `(has) => boolean` that receive the `has` helper
 *
 * @example
 * ```tsx
 * <Show when={{ permission: "org:billing:manage" }} fallback={<p>Unauthorized</p>}>
 *   <BillingSettings />
 * </Show>
 *
 * <Show when={{ role: "admin" }}>
 *   <AdminPanel />
 * </Show>
 *
 * <Show when={(has) => has({ permission: "org:read" }) && isFeatureEnabled}>
 *   <ProtectedFeature />
 * </Show>
 *
 * <Show when="signedIn">
 *   <Dashboard />
 * </Show>
 * ```
 */
export async function Show(props: AppRouterShowProps): Promise<React.JSX.Element | null> {
  const { children, fallback, treatPendingAsSignedOut, when } = props;
  const { has, userId } = await auth({ treatPendingAsSignedOut });

  const resolvedWhen = when;
  const authorized = <>{children}</>;
  const unauthorized = fallback ? <>{fallback}</> : null;

  if (typeof resolvedWhen === 'string') {
    if (resolvedWhen === 'signedOut') {
      return userId ? unauthorized : authorized;
    }
    return userId ? authorized : unauthorized;
  }

  if (!userId) {
    return unauthorized;
  }

  if (typeof resolvedWhen === 'function') {
    return resolvedWhen(has) ? authorized : unauthorized;
  }

  return has(resolvedWhen) ? authorized : unauthorized;
}
