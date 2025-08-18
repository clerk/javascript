import type { State as StateInterface } from '@clerk/types';
import { computed, effect } from 'alien-signals';

import { eventBus } from './events';
import type { BaseResource } from './resources/Base';
import { SignIn } from './resources/SignIn';
import { signInComputedSignal, signInErrorSignal, signInFetchSignal, signInResourceSignal } from './signals';

export class State implements StateInterface {
  signInResourceSignal = signInResourceSignal;
  signInErrorSignal = signInErrorSignal;
  signInFetchSignal = signInFetchSignal;
  signInSignal = signInComputedSignal;

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
  };

  private onResourceUpdated = (payload: { resource: BaseResource }) => {
    if (payload.resource instanceof SignIn) {
      this.signInResourceSignal({ resource: payload.resource });
    }
  };

  private onResourceFetch = (payload: { resource: BaseResource; status: 'idle' | 'fetching' }) => {
    if (payload.resource instanceof SignIn) {
      this.signInFetchSignal({ status: payload.status });
    }
  };
}
