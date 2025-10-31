import type { State as StateInterface } from '@clerk/shared/types';
import { computed, effect } from 'alien-signals';

import { eventBus } from './events';
import type { BaseResource } from './resources/Base';
import { SignIn } from './resources/SignIn';
import { SignUp } from './resources/SignUp';
import {
  signInComputedSignal,
  signInErrorSignal,
  signInFetchSignal,
  signInResourceSignal,
  signUpComputedSignal,
  signUpErrorSignal,
  signUpFetchSignal,
  signUpResourceSignal,
} from './signals';

export class State implements StateInterface {
  signInResourceSignal = signInResourceSignal;
  signInErrorSignal = signInErrorSignal;
  signInFetchSignal = signInFetchSignal;
  signInSignal = signInComputedSignal;

  signUpResourceSignal = signUpResourceSignal;
  signUpErrorSignal = signUpErrorSignal;
  signUpFetchSignal = signUpFetchSignal;
  signUpSignal = signUpComputedSignal;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    eventBus.on('resource:update', this.onResourceUpdated);
    eventBus.on('resource:error', this.onResourceError);
    eventBus.on('resource:fetch', this.onResourceFetch);
  }

  private onResourceError = (payload: { resource: BaseResource; error: unknown }) => {
    if (payload.resource instanceof SignIn) {
      this.signInErrorSignal({ error: payload.error });
    }

    if (payload.resource instanceof SignUp) {
      this.signUpErrorSignal({ error: payload.error });
    }
  };

  private onResourceUpdated = (payload: { resource: BaseResource }) => {
    if (payload.resource instanceof SignIn) {
      const previousResource = this.signInResourceSignal().resource;
      if (shouldIgnoreNullUpdate(previousResource, payload.resource)) {
        return;
      }
      this.signInResourceSignal({ resource: payload.resource });
    }

    if (payload.resource instanceof SignUp) {
      const previousResource = this.signUpResourceSignal().resource;
      if (shouldIgnoreNullUpdate(previousResource, payload.resource)) {
        return;
      }
      this.signUpResourceSignal({ resource: payload.resource });
    }
  };

  private onResourceFetch = (payload: { resource: BaseResource; status: 'idle' | 'fetching' }) => {
    if (payload.resource instanceof SignIn) {
      this.signInFetchSignal({ status: payload.status });
    }

    if (payload.resource instanceof SignUp) {
      this.signUpFetchSignal({ status: payload.status });
    }
  };
}

/**
 * Returns true if the new resource is null and the previous resource has not been finalized. This is used to prevent
 * nullifying the resource after it's been completed.
 */
function shouldIgnoreNullUpdate(previousResource: SignIn | null, newResource: SignIn | null): boolean;
function shouldIgnoreNullUpdate(previousResource: SignUp | null, newResource: SignUp | null): boolean;
function shouldIgnoreNullUpdate(previousResource: SignIn | SignUp | null, newResource: SignIn | SignUp | null) {
  return !newResource?.id && previousResource && previousResource.__internal_future?.hasBeenFinalized === false;
}
