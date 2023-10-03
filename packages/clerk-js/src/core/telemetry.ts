import type { InstanceType } from '@clerk/types';

import type Clerk from './clerk';

interface TelemetryEvent {
  event: string;
  /**
   * publishableKey
   */
  pk?: string;
  /**
   * instanceType
   */
  it: InstanceType;
  /**
   * clerkVersion
   */
  cv: string;
  /**
   * SDK
   */
  sdk?: string;
  /**
   * SDK Version
   */
  sdkv?: string;
  payload: Record<string, string | number | boolean>;
}

// TODO: determine some type of debounce/dedupe heuristic to avoid sending excessive events for e.g. a component render
export class TelemetryCollector {
  readonly #clerk: Clerk;

  constructor(clerk: Clerk) {
    this.#clerk = clerk;
  }

  get isEnabled(): boolean {
    // TODO: check clerk environment, environment variable
    return true;
  }

  record(event: TelemetryEvent['event'], payload: TelemetryEvent['payload']) {
    if (!this.isEnabled) {
      return;
    }

    const preparedPayload = this.#preparePayload(event, payload);
    this.#logEvent(preparedPayload.event, preparedPayload);

    // fetch(`http://localhost:8787/v0/events`, {
    //   method: 'POST',
    //   body: JSON.stringify(preparedPayload),
    //   mode: 'no-cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // }).catch(() => void 0);

    // this.#fapiClient
    //   .request({
    //     path: '/v1/events',
    //     method: 'POST',
    //     body: JSON.stringify({
    //       event,
    //       payload,
    //     }),
    //   })
    //   .catch(() => {
    //     void 0;
    //   });
  }

  #logEvent(event: TelemetryEvent['event'], payload: Record<string, any>) {
    console.groupCollapsed('[clerk/telemetry]', event);
    console.log(payload);
    console.groupEnd();
  }

  /**
   * Append relevant metadata from the Clerk singleton to the event payload.
   */
  #preparePayload(event: TelemetryEvent['event'], payload: TelemetryEvent['payload']): TelemetryEvent {
    return {
      event,
      cv: this.#clerk.version,
      it: this.#clerk.instanceType,
      ...(this.#clerk.publishableKey ? { pk: this.#clerk.publishableKey } : {}),
      sdk: this.#clerk.__internal_sdk?.name,
      sdkv: this.#clerk.__internal_sdk?.version,
      payload,
    };
  }
}
