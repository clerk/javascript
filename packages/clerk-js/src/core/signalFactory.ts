import type { ClerkError } from '@clerk/shared/error';
import type { Errors } from '@clerk/shared/types';
import { computed, signal } from 'alien-signals';

import { errorsToParsedErrors } from './signals';

/**
 * Configuration for creating resource signals from a schema.
 */
export interface ResourceSignalConfig<TFields> {
  /**
   * The resource schema defining name, error fields, etc.
   */
  schema: {
    name: string;
    errorFields: TFields;
  };

  /**
   * Optional function to transform the resource before including in computed signal.
   * For client-based resources, this typically extracts __internal_future.
   */
  getPublicResource?: (resource: unknown) => unknown;
}

/**
 * Return type for createResourceSignals.
 */
export interface ResourceSignals<TResource, TFields> {
  /** Signal holding the current resource instance */
  resourceSignal: ReturnType<typeof signal<{ resource: TResource | null }>>;
  /** Signal holding the current error */
  errorSignal: ReturnType<typeof signal<{ error: ClerkError | null }>>;
  /** Signal holding the current fetch status */
  fetchSignal: ReturnType<typeof signal<{ status: 'idle' | 'fetching' }>>;
  /** Computed signal combining resource, errors, and fetch status */
  computedSignal: () => {
    errors: Errors<TFields>;
    fetchStatus: 'idle' | 'fetching';
    [key: string]: unknown;
  };
}

/**
 * Creates a set of signals for a resource with error parsing and fetch status tracking.
 *
 * This factory provides a standardized way to create signal sets for any resource type,
 * reducing duplication between signIn, signUp, waitlist, and checkout implementations.
 *
 * @example
 * const signals = createResourceSignals<SignIn, SignInFields>({
 *   schema: signInSchema,
 *   getPublicResource: (r) => (r as SignIn).__internal_future,
 * });
 */
export function createResourceSignals<TResource, TFields>(
  config: ResourceSignalConfig<TFields>,
): ResourceSignals<TResource, TFields> {
  const { schema, getPublicResource } = config;

  const resourceSignal = signal<{ resource: TResource | null }>({ resource: null });
  const errorSignal = signal<{ error: ClerkError | null }>({ error: null });
  const fetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

  const computedSignal = computed(() => {
    const resource = resourceSignal().resource;
    const error = errorSignal().error;
    const fetchStatus = fetchSignal().status;

    const errors = errorsToParsedErrors(error, schema.errorFields as Record<string, unknown>) as Errors<TFields>;

    // Transform resource if getPublicResource is provided
    const publicResource = resource ? (getPublicResource?.(resource) ?? resource) : null;

    return {
      errors,
      fetchStatus,
      [schema.name]: publicResource,
    };
  });

  return { resourceSignal, errorSignal, fetchSignal, computedSignal };
}
