import type { ClerkError } from '@clerk/shared/error';
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

  private onResourceError = (payload: { resource: BaseResource; error: ClerkError | null }) => {
    if (payload.resource instanceof SignIn) {
      this.signInErrorSignal({ error: payload.error });
    }

    if (payload.resource instanceof SignUp) {
      this.signUpErrorSignal({ error: payload.error });
    }
  };

  private onResourceUpdated = (payload: { resource: BaseResource }) => {
    if (payload.resource instanceof SignIn) {
      this.signInResourceSignal({ resource: payload.resource });
    }

    if (payload.resource instanceof SignUp) {
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
