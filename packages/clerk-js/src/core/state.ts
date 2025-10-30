import type { State as StateInterface } from '@clerk/types';
import { computed, effect } from 'alien-signals';

import { eventBus } from './events';
import type { BaseResource } from './resources/Base';
import { Waitlist } from './resources/Waitlist';
import {
  getResourceSignalSet,
  getSignalSetByResourceName,
} from './signals';

type ResourceClassWithName = new (...args: any[]) => BaseResource & {
  __internal_future: any;
  static __internal_resourceName: string;
};

export class State implements StateInterface {
  private _waitlistInstance: Waitlist | null = null;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    eventBus.on('resource:update', this.onResourceUpdated);
    eventBus.on('resource:error', this.onResourceError);
    eventBus.on('resource:fetch', this.onResourceFetch);

    this._waitlistInstance = new Waitlist(null);
    const waitlistSignalSet = getSignalSetByResourceName('waitlist');
    if (waitlistSignalSet) {
      waitlistSignalSet.resourceSignal({ resource: this._waitlistInstance });
    }
  }

  get __internal_waitlist() {
    return this._waitlistInstance;
  }

  getSignalsForResource(resource: BaseResource) {
    return getResourceSignalSet(resource);
  }

  getSignalsByName(resourceName: string) {
    return getSignalSetByResourceName(resourceName);
  }

  getSignalsForClass<T extends ResourceClassWithName>(ResourceClass: T) {
    return getSignalSetByResourceName(ResourceClass.__internal_resourceName);
  }

  getSignalForResourceName<T extends string>(
    resourceName: T,
  ): (() => { errors: any; fetchStatus: 'idle' | 'fetching'; [K in T]: any }) | undefined {
    const signalSet = getSignalSetByResourceName(resourceName);
    return signalSet?.computedSignal;
  }

  getSignalForResource(resource: BaseResource) {
    const signalSet = getResourceSignalSet(resource);
    return signalSet?.computedSignal;
  }

  getSignalForClass<T extends ResourceClassWithName>(ResourceClass: T) {
    const signalSet = getSignalSetByResourceName(ResourceClass.__internal_resourceName);
    return signalSet?.computedSignal;
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
