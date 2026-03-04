import type { ClerkError } from '@clerk/shared/error';
import type { State as StateInterface } from '@clerk/shared/types';
import { computed, effect, endBatch, startBatch } from 'alien-signals';

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

  private _waitlistInstance: Waitlist;

  __internal_effect = effect;
  __internal_computed = computed;

  constructor() {
    eventBus.on('resource:state-change', this.onResourceStateChange);

    this._waitlistInstance = new Waitlist(null);
    this.waitlistResourceSignal({ resource: this._waitlistInstance });
  }

  get __internal_waitlist() {
    return this._waitlistInstance;
  }

  /**
   * Handles all resource state changes. Uses startBatch/endBatch to ensure that
   * error, fetchStatus, and resource signal writes from a single event are flushed
   * as one notification (one React re-render).
   *
   * Resource-only events (from fromJSON during in-flight tasks) are skipped while
   * fetchStatus is 'fetching'. Since fromJSON mutates the resource in place, the
   * completion event from runAsyncResourceTask carries the same (already-updated)
   * instance — so no data is lost.
   */
  private onResourceStateChange = (payload: {
    resource: BaseResource;
    error?: ClerkError | null;
    fetchStatus?: 'idle' | 'fetching';
  }) => {
    const isResourceOnly = !('fetchStatus' in payload) && !('error' in payload);

    startBatch();

    try {
      if (payload.resource instanceof SignIn) {
        if (isResourceOnly && this.signInFetchSignal().status === 'fetching') {
          return;
        }
        if ('error' in payload) {
          this.signInErrorSignal({ error: payload.error ?? null });
        }
        if ('fetchStatus' in payload) {
          this.signInFetchSignal({ status: payload.fetchStatus ?? 'idle' });
        }
        const previousResource = this.signInResourceSignal().resource;
        if (!shouldIgnoreNullUpdate(previousResource, payload.resource)) {
          this.signInResourceSignal({ resource: payload.resource });
        }
      }

      if (payload.resource instanceof SignUp) {
        if (isResourceOnly && this.signUpFetchSignal().status === 'fetching') {
          return;
        }
        if ('error' in payload) {
          this.signUpErrorSignal({ error: payload.error ?? null });
        }
        if ('fetchStatus' in payload) {
          this.signUpFetchSignal({ status: payload.fetchStatus ?? 'idle' });
        }
        const previousResource = this.signUpResourceSignal().resource;
        if (!shouldIgnoreNullUpdate(previousResource, payload.resource)) {
          this.signUpResourceSignal({ resource: payload.resource });
        }
      }

      if (payload.resource instanceof Waitlist) {
        if (isResourceOnly && this.waitlistFetchSignal().status === 'fetching') {
          return;
        }
        if ('error' in payload) {
          this.waitlistErrorSignal({ error: payload.error ?? null });
        }
        if ('fetchStatus' in payload) {
          this.waitlistFetchSignal({ status: payload.fetchStatus ?? 'idle' });
        }
        this._waitlistInstance = payload.resource;
        this.waitlistResourceSignal({ resource: payload.resource });
      }
    } finally {
      endBatch();
    }
  };
}

/**
 * Returns true if the new resource is null and the previous resource cannot be discarded. This is used to prevent
 * nullifying the resource after it's been completed or explicitly reset.
 */
function shouldIgnoreNullUpdate(previousResource: SignIn | null, newResource: SignIn | null): boolean;
function shouldIgnoreNullUpdate(previousResource: SignUp | null, newResource: SignUp | null): boolean;
function shouldIgnoreNullUpdate(previousResource: SignIn | SignUp | null, newResource: SignIn | SignUp | null) {
  return !newResource?.id && previousResource && previousResource.__internal_future?.canBeDiscarded === false;
}
