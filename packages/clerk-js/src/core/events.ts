import type { TokenResource } from '@clerk/types';

export const events = {
  TokenUpdate: 'token:update',
} as const;

type ClerkEvent = typeof events[keyof typeof events];
type EventType<T> = Record<string, unknown> & T;

type TokenUpdatePayload = { token: TokenResource | null };

type EventPayload = {
  [events.TokenUpdate]: EventType<TokenUpdatePayload>;
};

class ClerkEventBus extends EventTarget {
  on<E extends ClerkEvent, P extends EventPayload[E]>(eventName: E, callback: (evt: P) => void): void {
    this.addEventListener(eventName, (e: Event) => {
      callback((e as CustomEvent).detail);
    });
  }

  dispatch<E extends ClerkEvent, P extends EventPayload[E]>(eventName: E, data: P): void {
    this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
}

export const eventBus = new ClerkEventBus();
