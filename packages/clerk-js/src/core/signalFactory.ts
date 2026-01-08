import type { ClerkError } from '@clerk/shared/error';
import { computed, signal } from 'alien-signals';

import { errorsToParsedErrors } from './state';

/**
 * Configuration for creating resource signals.
 */
export interface CreateSignalsConfig {
  /** Resource name (e.g., 'signIn', 'signUp', 'waitlist', 'checkout') */
  name: string;
  /** Error fields from schema for error parsing */
  errorFields: object;
  /** Transform resource before exposing in computed signal */
  getPublicResource?: (resource: unknown) => unknown;
}

/**
 * Signal set for a resource.
 */
export interface ResourceSignals<T = unknown> {
  resourceSignal: ReturnType<typeof signal<{ resource: T | null }>>;
  errorSignal: ReturnType<typeof signal<{ error: ClerkError | null }>>;
  fetchSignal: ReturnType<typeof signal<{ status: 'idle' | 'fetching' }>>;
  computedSignal: () => unknown;
}

/**
 * Creates a signal set for a resource.
 * Shared factory used by both State registry and keyed resources like Checkout.
 */
export function createResourceSignals<T = unknown>(config: CreateSignalsConfig): ResourceSignals<T> {
  const resourceSignal = signal<{ resource: T | null }>({ resource: null });
  const errorSignal = signal<{ error: ClerkError | null }>({ error: null });
  const fetchSignal = signal<{ status: 'idle' | 'fetching' }>({ status: 'idle' });

  const computedSignal = computed(() => {
    const resource = resourceSignal().resource;
    const error = errorSignal().error;
    const fetchStatus = fetchSignal().status;

    const errors = errorsToParsedErrors(error, config.errorFields as Record<string, unknown>);
    const publicResource = resource ? (config.getPublicResource?.(resource) ?? resource) : null;

    return {
      errors,
      fetchStatus,
      [config.name]: publicResource,
    };
  });

  return { resourceSignal, errorSignal, fetchSignal, computedSignal };
}
