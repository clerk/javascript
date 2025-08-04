import type { State as StateInterface } from '@clerk/types';
import { computed, effect } from 'alien-signals';

import { eventBus, type SignInUpdatePayload } from './events';
import { signInComputedSignal, signInErrorSignal, signInSignal } from './signals';

export class State implements StateInterface {
  signInResourceSignal = signInSignal;
  signInErrorSignal = signInErrorSignal;
  signInSignal = signInComputedSignal;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    eventBus.on('signin:update', this.onSignInUpdated);
    eventBus.on('signin:error', this.onSignInError);
  }

  private onSignInUpdated = (payload: SignInUpdatePayload) => {
    this.signInResourceSignal({ resource: payload.resource });
  };

  private onSignInError = (error: unknown) => {
    this.signInErrorSignal({ errors: error });
  };
}
