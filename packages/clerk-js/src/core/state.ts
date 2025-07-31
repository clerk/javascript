import type { State as StateInterface } from '@clerk/types';
import { computed, effect } from 'alien-signals';

import { eventBus, type SignInUpdatePayload } from './events';
import { signInSignal } from './signals';

export class State implements StateInterface {
  signInSignal = signInSignal;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    eventBus.on('signin:update', this.onSignInUpdated);
  }

  private onSignInUpdated = (payload: SignInUpdatePayload) => {
    this.signInSignal({ resource: payload.resource });
  };
}
