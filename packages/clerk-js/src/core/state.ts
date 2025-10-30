import type { State as StateInterface } from '@clerk/types';
import { computed, effect } from 'alien-signals';

import { eventBus } from './events';
import type { BaseResource } from './resources/Base';
import { SignIn } from './resources/SignIn';
import { SignUp } from './resources/SignUp';
import { Waitlist } from './resources/Waitlist';
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

type ResourceSignalSet = {
  resourceSignal: ReturnType<typeof signInResourceSignal>;
  errorSignal: ReturnType<typeof signInErrorSignal>;
  fetchSignal: ReturnType<typeof signInFetchSignal>;
  computedSignal: ReturnType<typeof signInComputedSignal>;
};

export class State implements StateInterface {
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

  private _waitlistInstance: Waitlist | null = null;

  private readonly resourceSignalMap = new Map<
    new (...args: any[]) => BaseResource,
    ResourceSignalSet
  >([
    [SignIn, { resourceSignal: signInResourceSignal, errorSignal: signInErrorSignal, fetchSignal: signInFetchSignal, computedSignal: signInComputedSignal }],
    [SignUp, { resourceSignal: signUpResourceSignal, errorSignal: signUpErrorSignal, fetchSignal: signUpFetchSignal, computedSignal: signUpComputedSignal }],
    [Waitlist, { resourceSignal: waitlistResourceSignal, errorSignal: waitlistErrorSignal, fetchSignal: waitlistFetchSignal, computedSignal: waitlistComputedSignal }],
  ]);

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

  private getSignalSetForResource(resource: BaseResource): ResourceSignalSet | undefined {
    for (const [ResourceClass, signalSet] of this.resourceSignalMap) {
      if (resource instanceof ResourceClass) {
        return signalSet;
      }
    }
    return undefined;
  }

  private onResourceError = (payload: { resource: BaseResource; error: unknown }) => {
    const signalSet = this.getSignalSetForResource(payload.resource);
    if (signalSet) {
      signalSet.errorSignal({ error: payload.error });
    }
  };

  private onResourceUpdated = (payload: { resource: BaseResource }) => {
    const signalSet = this.getSignalSetForResource(payload.resource);
    if (signalSet) {
      signalSet.resourceSignal({ resource: payload.resource });
    }
  };

  private onResourceFetch = (payload: { resource: BaseResource; status: 'idle' | 'fetching' }) => {
    const signalSet = this.getSignalSetForResource(payload.resource);
    if (signalSet) {
      signalSet.fetchSignal({ status: payload.status });
    }
  };
}
