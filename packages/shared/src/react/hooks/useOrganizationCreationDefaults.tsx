import { useClearQueriesOnSignOut } from '@/react/hooks/useClearQueriesOnSignOut';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { EnvironmentResource } from '../../types/environment';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { useUserBase } from './base/useUserBase';
import { useOrganizationCreationDefaultsCacheKeys } from './useOrganizationCreationDefaults.shared';
import type {
  UseOrganizationCreationDefaultsParams,
  UseOrganizationCreationDefaultsReturn,
} from './useOrganizationCreationDefaults.types';

const HOOK_NAME = 'useOrganizationCreationDefaults';

/**
 * The `useOrganizationCreationDefaults()` hook retrieves the organization creation defaults for the current user.
 *
 * @example
 * ### Basic usage
 *
 * ```tsx
 * import { useOrganizationCreationDefaults } from '@clerk/clerk-react'
 *
 * export default function CreateOrganizationForm() {
 *   const { data, isLoading } = useOrganizationCreationDefaults()
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <form>
 *       <input defaultValue={data?.form.name} placeholder="Organization name" />
 *       <input defaultValue={data?.form.slug} placeholder="Slug" />
 *       <button type="submit">Create</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useOrganizationCreationDefaults(
  params: UseOrganizationCreationDefaultsParams = {},
): UseOrganizationCreationDefaultsReturn {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const { keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserBase();

  // @ts-expect-error `__internal_environment` is not typed
  const environment = clerk.__internal_environment as unknown as EnvironmentResource | null | undefined;
  const featureEnabled = environment?.organizationSettings?.organizationCreationDefaults?.enabled ?? false;

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

  const { queryKey, authenticated, stableKey } = useOrganizationCreationDefaultsCacheKeys({ userId: user?.id ?? null });

  useClearQueriesOnSignOut({
    isSignedOut: user === null, // works with the transitive state
    authenticated,
    stableKeys: stableKey,
  });

  const queryEnabled = Boolean(user) && enabled && featureEnabled && clerk.loaded;

  const query = useClerkQuery({
    queryKey,
    queryFn: user?.getOrganizationCreationDefaults,
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  return {
    data: query.data,
    error: (query.error ?? null) as UseOrganizationCreationDefaultsReturn['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
