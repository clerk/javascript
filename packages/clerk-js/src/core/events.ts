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
  #handlers = {} as Record<ClerkEvent, Array<any>>;

  on<E extends ClerkEvent, P extends EventPayload[E]>(eventName: E, callback: (evt: P) => void): void {
    const handler = (e: Event) => {
      callback((e as CustomEvent).detail);
    };

    if (!this.#handlers[eventName]) {
      this.#handlers[eventName] = [];
    }
    this.#handlers[eventName].push({ callback, handler });

    this.addEventListener(eventName, handler);
  }

  dispatch<E extends ClerkEvent, P extends EventPayload[E]>(eventName: E, data: P): void {
    this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }

  off<E extends ClerkEvent, P extends EventPayload[E]>(eventName: E, callback?: (evt: P) => void): void {
    if (!this.#handlers[eventName]) {
      return;
    }

    if (callback) {
      const { handler } = this.#handlers[eventName].find(({ callback }) => callback === callback) || {};
      this.removeEventListener(eventName, handler);
    } else {
      this.#handlers[eventName].forEach(({ handler }) => {
        this.removeEventListener(eventName, handler);
      });
    }
  }
}

export const eventBus = new ClerkEventBus();
