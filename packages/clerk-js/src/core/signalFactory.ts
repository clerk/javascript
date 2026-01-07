import type { ClerkError } from '@clerk/shared/error';
import type { Errors } from '@clerk/shared/types';
import { computed, signal } from 'alien-signals';

import { errorsToParsedErrors } from './signals';

/**
 * Configuration for creating resource signals.
 */
export interface ResourceSignalConfig<TFields extends Record<string, unknown>> {
  /**
   * Resource key (e.g., 'signIn', 'signUp').
   * Used as the property name in the computed signal output.
   */
  name: string;

  /**
   * Default error fields for error parsing.
   */
  errorFields: TFields;

  /**
   * Optional function to transform the resource before including in computed signal.
   * For client-based resources, this typically extracts __internal_future.
   */
  getPublicResource?: (resource: unknown) => unknown;
}

/**
 * Return type for createResourceSignals.
 */
export interface ResourceSignals<TResource, TFields extends Record<string, unknown>> {
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
 */
export function createResourceSignals<TResource, TFields extends Record<string, unknown>>(
  config: ResourceSignalConfig<TFields>,
): ResourceSignals<TResource, TFields> {
  const resourceSignal = signal<{ resource: TResource | null }>({ resource: null });
  const errorSignal = signal<{ error: ClerkError | null }>({ error: null });
  const fetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

  const computedSignal = computed(() => {
    const resource = resourceSignal().resource;
    const error = errorSignal().error;
    const fetchStatus = fetchSignal().status;

    const errors = errorsToParsedErrors(error, config.errorFields);

    // Transform resource if getPublicResource is provided
    const publicResource = resource ? (config.getPublicResource?.(resource) ?? resource) : null;

    return {
      errors,
      fetchStatus,
      [config.name]: publicResource,
    };
  });

  return { resourceSignal, errorSignal, fetchSignal, computedSignal };
}
