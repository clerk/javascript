import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { EnvironmentResource } from '../../types/environment';
import { useSWR } from '../clerk-swr';
import { useClerkInstanceContext, useUserContext } from '../contexts';
import { useOrganizationCreationDefaultsCacheKeys } from './useOrganizationCreationDefaults.shared';
import type {
  UseOrganizationCreationDefaultsParams,
  UseOrganizationCreationDefaultsReturn,
} from './useOrganizationCreationDefaults.types';

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
function useOrganizationCreationDefaultsHook(
  params: UseOrganizationCreationDefaultsParams = {},
): UseOrganizationCreationDefaultsReturn {
  const { keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserContext();

  // @ts-expect-error `__unstable__environment` is not typed
  const environment = clerk.__unstable__environment as unknown as EnvironmentResource | null | undefined;
  const featureEnabled = environment?.organizationSettings?.organizationCreationDefaults?.enabled ?? false;

  clerk.telemetry?.record(eventMethodCalled('useOrganizationCreationDefaults'));

  const { queryKey } = useOrganizationCreationDefaultsCacheKeys({ userId: user?.id ?? null });

  const queryEnabled = Boolean(user) && enabled && featureEnabled && clerk.loaded;

  const swr = useSWR(
    queryEnabled ? queryKey : null,
    () => {
      if (!user) {
        throw new Error('User is required to fetch organization creation defaults');
      }
      return user.getOrganizationCreationDefaults();
    },
    {
      dedupingInterval: 1_000 * 60,
      keepPreviousData,
    },
  );

  return {
    data: swr.data,
    error: (swr.error ?? null) as UseOrganizationCreationDefaultsReturn['error'],
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
  };
}

export { useOrganizationCreationDefaultsHook as useOrganizationCreationDefaults };
