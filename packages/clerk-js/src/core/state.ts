import type { State as StateInterface } from '@clerk/types';
import { computed, effect } from 'alien-signals';

import { eventBus } from './events';
import type { BaseResource } from './resources/Base';
import { SignIn } from './resources/SignIn';
import { SignUp } from './resources/SignUp';
import { Waitlist } from './resources/Waitlist';
import {
  getResourceSignalSet,
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

export class State implements StateInterface {
  get signInResourceSignal() {
    return signInResourceSignal;
  }
  get signInErrorSignal() {
    return signInErrorSignal;
  }
  get signInFetchSignal() {
    return signInFetchSignal;
  }
  get signInSignal() {
    return signInComputedSignal;
  }

  get signUpResourceSignal() {
    return signUpResourceSignal;
  }
  get signUpErrorSignal() {
    return signUpErrorSignal;
  }
  get signUpFetchSignal() {
    return signUpFetchSignal;
  }
  get signUpSignal() {
    return signUpComputedSignal;
  }

  get waitlistResourceSignal() {
    return waitlistResourceSignal;
  }
  get waitlistErrorSignal() {
    return waitlistErrorSignal;
  }
  get waitlistFetchSignal() {
    return waitlistFetchSignal;
  }
  get waitlistSignal() {
    return waitlistComputedSignal;
  }

  private _waitlistInstance: Waitlist | null = null;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    eventBus.on('resource:update', this.onResourceUpdated);
    eventBus.on('resource:error', this.onResourceError);
    eventBus.on('resource:fetch', this.onResourceFetch);

    this._waitlistInstance = new Waitlist(null);
    this.waitlistResourceSignal({ resource: this._waitlistInstance });
  }

  get __internal_waitlist() {
    return this._waitlistInstance;
  }

  private onResourceError = (payload: { resource: BaseResource; error: unknown }) => {
    const signalSet = getResourceSignalSet(payload.resource);
    if (signalSet) {
      signalSet.errorSignal({ error: payload.error });
    }
  };

  private onResourceUpdated = (payload: { resource: BaseResource }) => {
    const signalSet = getResourceSignalSet(payload.resource);
    if (signalSet) {
      signalSet.resourceSignal({ resource: payload.resource });
    }
  };

  private onResourceFetch = (payload: { resource: BaseResource; status: 'idle' | 'fetching' }) => {
    const signalSet = getResourceSignalSet(payload.resource);
    if (signalSet) {
      signalSet.fetchSignal({ status: payload.status });
    }
  };
}
