import type { ClerkAPIError, ClerkError } from '@clerk/shared/error';
import { createClerkGlobalHookError, isClerkAPIResponseError } from '@clerk/shared/error';
import { signInSchema, signUpSchema, waitlistSchema } from '@clerk/shared/resourceSchemas';
import type { Errors, SignInSignal, SignUpSignal, State as StateInterface, WaitlistSignal } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';
import { computed, effect } from 'alien-signals';

import { eventBus } from './events';
import type { BaseResource } from './resources/Base';
import type { SignIn } from './resources/SignIn';
import type { SignUp } from './resources/SignUp';
import { Waitlist } from './resources/Waitlist';
import { RESOURCE_TYPE, type SignalBackedResource } from './resourceType';
import { createResourceSignals, type CreateSignalsConfig, type ResourceSignals } from './signalFactory';

/**
 * Configuration for registering a signal-backed resource in State.
 * Extends CreateSignalsConfig with State-specific options.
 */
interface StateResourceConfig extends CreateSignalsConfig {
  /** If true, ignore null updates when hasBeenFinalized is false (for client-based resources) */
  ignoreNullWhenNotFinalized?: boolean;
}

/**
 * Registry entry for a signal-backed resource.
 */
interface ResourceRegistration extends ResourceSignals {
  config: StateResourceConfig;
}

export class State implements StateInterface {
  // Registry of signal-backed resources
  private registry = new Map<string, ResourceRegistration>();

  private _waitlistInstance: Waitlist;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    // Register all signal-backed resources dynamically from schemas
    this.registerResource({
      name: signInSchema.name,
      errorFields: signInSchema.errorFields,
      getPublicResource: resource => (resource as SignIn).__internal_future,
      ignoreNullWhenNotFinalized: true,
    });

    this.registerResource({
      name: signUpSchema.name,
      errorFields: signUpSchema.errorFields,
      getPublicResource: resource => (resource as SignUp).__internal_future,
      ignoreNullWhenNotFinalized: true,
    });

    this.registerResource({
      name: waitlistSchema.name,
      errorFields: waitlistSchema.errorFields,
      // Waitlist is a singleton, no transformation needed
    });

    // Subscribe to resource events
    eventBus.on('resource:update', this.onResourceUpdated);
    eventBus.on('resource:error', this.onResourceError);
    eventBus.on('resource:fetch', this.onResourceFetch);

    // Initialize waitlist singleton
    this._waitlistInstance = new Waitlist(null);
    this.registry.get('waitlist')?.resourceSignal({ resource: this._waitlistInstance });
  }

  /**
   * Register a new signal-backed resource.
   * Uses shared factory to create signals.
   */
  private registerResource(config: StateResourceConfig): void {
    const signals = createResourceSignals(config);
    this.registry.set(config.name, { ...signals, config });
  }

  get __internal_waitlist() {
    return this._waitlistInstance;
  }

  /**
   * Get the computed signal for a resource type.
   * Used by hooks to subscribe to resource changes.
   */
  getSignal(type: 'signIn'): SignInSignal | undefined;
  getSignal(type: 'signUp'): SignUpSignal | undefined;
  getSignal(type: 'waitlist'): WaitlistSignal | undefined;
  getSignal(type: string): (() => unknown) | undefined;
  getSignal(type: string) {
    return this.registry.get(type)?.computedSignal;
  }

  private onResourceError = (payload: { resource: BaseResource; error: ClerkError | null }) => {
    const resource = payload.resource as unknown as SignalBackedResource;
    const type = resource[RESOURCE_TYPE];
    if (type) {
      this.registry.get(type)?.errorSignal({ error: payload.error });
    }
  };

  private onResourceUpdated = (payload: { resource: BaseResource }) => {
    const resource = payload.resource as unknown as SignalBackedResource;
    const type = resource[RESOURCE_TYPE];
    if (!type) return;

    const registration = this.registry.get(type);
    if (!registration) return;

    // For client-based resources, check if we should ignore null updates
    if (registration.config.ignoreNullWhenNotFinalized) {
      const currentResource = registration.resourceSignal().resource;
      if (shouldIgnoreNullUpdate(currentResource, payload.resource)) {
        return;
      }
    }

    registration.resourceSignal({ resource: payload.resource });
  };

  private onResourceFetch = (payload: { resource: BaseResource; status: 'idle' | 'fetching' }) => {
    const resource = payload.resource as unknown as SignalBackedResource;
    const type = resource[RESOURCE_TYPE];
    if (type) {
      this.registry.get(type)?.fetchSignal({ status: payload.status });
    }
  };
}

/**
 * Returns true if the new resource is null/without ID and the previous resource has not been finalized.
 * This is used to prevent nullifying the resource after it's been completed.
 */
function shouldIgnoreNullUpdate(previousResource: unknown, newResource: unknown): boolean {
  const hasNoId = !(newResource as { id?: unknown })?.id;
  const previousFuture = (previousResource as { __internal_future?: { hasBeenFinalized?: boolean } })
    ?.__internal_future;
  return hasNoId && !!previousResource && previousFuture?.hasBeenFinalized === false;
}

/**
 * Converts an error to a parsed errors object that reports the specific fields that the error pertains to.
 * Generic non-API errors go into the global array.
 */
export function errorsToParsedErrors<T extends Record<string, unknown>>(
  error: ClerkError | null,
  initialFields: T,
): Errors<T> {
  const parsedErrors: Errors<T> = {
    fields: { ...initialFields },
    raw: null,
    global: null,
  };

  if (!error) {
    return parsedErrors;
  }

  if (!isClerkAPIResponseError(error)) {
    parsedErrors.raw = [error];
    parsedErrors.global = [createClerkGlobalHookError(error)];
    return parsedErrors;
  }

  function isFieldError(error: ClerkAPIError): boolean {
    return 'meta' in error && error.meta && 'paramName' in error.meta && error.meta.paramName !== undefined;
  }

  const hasFieldErrors = error.errors.some(isFieldError);
  if (hasFieldErrors) {
    error.errors.forEach(err => {
      if (parsedErrors.raw) {
        parsedErrors.raw.push(err);
      } else {
        parsedErrors.raw = [err];
      }
      if (isFieldError(err)) {
        const name = snakeToCamel(err.meta.paramName);
        if (name in parsedErrors.fields) {
          (parsedErrors.fields as Record<string, unknown>)[name] = err;
        }
      }
    });
    return parsedErrors;
  }

  // At this point, we know that `error` is a ClerkAPIResponseError with no field errors.
  parsedErrors.raw = [error];
  parsedErrors.global = [createClerkGlobalHookError(error)];

  return parsedErrors;
}
