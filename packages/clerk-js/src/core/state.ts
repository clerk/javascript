import type { ClerkError } from '@clerk/shared/error';
import type { State as StateInterface } from '@clerk/shared/types';
import { computed, effect } from 'alien-signals';

import { eventBus } from './events';
import type { BaseResource } from './resources/Base';
import { Waitlist } from './resources/Waitlist';
import { RESOURCE_TYPE, type SignalBackedResource } from './resourceType';
import {
  signInComputedSignal,
  signInErrorSignal,
  signInFetchSignal,
  signInResourceSignal,
  signUpComputedSignal,
  signUpErrorSignal,
  signUpFetchSignal,
  signUpResourceSignal,
  waitlistComputedSignal,
  waitlistErrorSignal,
  waitlistFetchSignal,
  waitlistResourceSignal,
} from './signals';

/**
 * Registry entry for a signal-backed resource.
 */
interface ResourceRegistration {
  resourceSignal: (payload: { resource: unknown }) => void;
  errorSignal: (payload: { error: ClerkError | null }) => void;
  fetchSignal: (payload: { status: 'idle' | 'fetching' }) => void;
  computedSignal: () => unknown;
  /**
   * If true, ignore null updates when hasBeenFinalized is false.
   * Used for client-based resources like SignIn/SignUp.
   */
  ignoreNullWhenNotFinalized?: boolean;
}

export class State implements StateInterface {
  // Registry of signal-backed resources
  private registry = new Map<string, ResourceRegistration>();

  // Keep public signals for backwards compatibility (used by react StateProxy)
  signInResourceSignal = signInResourceSignal;
  signInErrorSignal = signInErrorSignal;
  signInFetchSignal = signInFetchSignal;
  signInSignal = signInComputedSignal;

  signUpResourceSignal = signUpResourceSignal;
  signUpErrorSignal = signUpErrorSignal;
  signUpFetchSignal = signUpFetchSignal;
  signUpSignal = signUpComputedSignal;

  waitlistResourceSignal = waitlistResourceSignal;
  waitlistErrorSignal = waitlistErrorSignal;
  waitlistFetchSignal = waitlistFetchSignal;
  waitlistSignal = waitlistComputedSignal;

  private _waitlistInstance: Waitlist;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    // Register resources in the registry
    this.registry.set('signIn', {
      resourceSignal: signInResourceSignal,
      errorSignal: signInErrorSignal,
      fetchSignal: signInFetchSignal,
      computedSignal: signInComputedSignal,
      ignoreNullWhenNotFinalized: true,
    });
    this.registry.set('signUp', {
      resourceSignal: signUpResourceSignal,
      errorSignal: signUpErrorSignal,
      fetchSignal: signUpFetchSignal,
      computedSignal: signUpComputedSignal,
      ignoreNullWhenNotFinalized: true,
    });
    this.registry.set('waitlist', {
      resourceSignal: waitlistResourceSignal,
      errorSignal: waitlistErrorSignal,
      fetchSignal: waitlistFetchSignal,
      computedSignal: waitlistComputedSignal,
    });

    eventBus.on('resource:update', this.onResourceUpdated);
    eventBus.on('resource:error', this.onResourceError);
    eventBus.on('resource:fetch', this.onResourceFetch);

    this._waitlistInstance = new Waitlist(null);
    this.waitlistResourceSignal({ resource: this._waitlistInstance });
  }

  get __internal_waitlist() {
    return this._waitlistInstance;
  }

  /**
   * Get the computed signal for a resource type.
   * Used by hooks to subscribe to resource changes.
   */
  getSignal(type: 'signIn'): typeof signInComputedSignal | undefined;
  getSignal(type: 'signUp'): typeof signUpComputedSignal | undefined;
  getSignal(type: 'waitlist'): typeof waitlistComputedSignal | undefined;
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
    if (registration.ignoreNullWhenNotFinalized) {
      const currentResource = (registration.resourceSignal as any)?.()?.resource;
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
  const previousFuture = (previousResource as { __internal_future?: { hasBeenFinalized?: boolean } })?.__internal_future;
  return hasNoId && !!previousResource && previousFuture?.hasBeenFinalized === false;
}
