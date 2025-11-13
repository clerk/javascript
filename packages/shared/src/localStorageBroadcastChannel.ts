import { deprecated } from './deprecated';

type Listener<T> = (e: MessageEvent<T>) => void;

const KEY_PREFIX = '__lsbc__';

/**
 * @deprecated This class will be completely removed in the next major version.
 * Use the native BroadcastChannel API directly instead.
 */
export class LocalStorageBroadcastChannel<E> {
  private readonly eventTarget = window;
  private readonly channelKey: string;

  constructor(name: string) {
    deprecated('LocalStorageBroadcastChannel', 'Use the native BroadcastChannel API directly instead.');
    this.channelKey = KEY_PREFIX + name;
    this.setupLocalStorageListener();
  }

  public postMessage = (data: E): void => {
    if (typeof window === 'undefined') {
      // Silently do nothing
      return;
    }

    try {
      window.localStorage.setItem(this.channelKey, JSON.stringify(data));
      window.localStorage.removeItem(this.channelKey);
    } catch {
      // Silently do nothing
    }
  };

  public addEventListener = (eventName: 'message', listener: Listener<E>): void => {
    this.eventTarget.addEventListener(this.prefixEventName(eventName), e => {
      listener(e as MessageEvent);
    });
  };

  private setupLocalStorageListener = () => {
    const notifyListeners = (e: StorageEvent) => {
      if (e.key !== this.channelKey || !e.newValue) {
        return;
      }

      try {
        const data = JSON.parse(e.newValue || '');
        const event = new MessageEvent(this.prefixEventName('message'), {
          data,
        });
        this.eventTarget.dispatchEvent(event);
      } catch {
        //
      }
    };

    window.addEventListener('storage', notifyListeners);
  };

  private prefixEventName(eventName: string): string {
    return this.channelKey + eventName;
  }
}
