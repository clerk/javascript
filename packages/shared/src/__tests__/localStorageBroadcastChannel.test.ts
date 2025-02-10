import { LocalStorageBroadcastChannel } from '../localStorageBroadcastChannel';

const bcName = 'clerk';

describe('LocalStorageBroadcastChannel', () => {
  let localStorageMock;
  beforeEach(() => {
    localStorageMock = (() => {
      const store: Record<string, any> = {};
      return {
        setItem: jest.fn((key, value) => {
          store[key] = value;
          window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
        }),
        removeItem: jest.fn(key => {
          store[key] = undefined;
          window.dispatchEvent(new Event('storage'));
        }),
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('notifies other LocalStorageBroadcastChannel with same name', () => {
    const tab1ClerkBCListener = jest.fn();
    const tab1DifferentBCListener = jest.fn();
    const tab2ClerkBCListener = jest.fn();

    const tab1ClerkBC = new LocalStorageBroadcastChannel(bcName);
    const tab1DifferentBC = new LocalStorageBroadcastChannel('somethingElse');
    const tab2ClerkBC = new LocalStorageBroadcastChannel(bcName);

    tab1ClerkBC.addEventListener('message', tab1ClerkBCListener);
    tab1DifferentBC.addEventListener('message', tab1DifferentBCListener);
    tab2ClerkBC.addEventListener('message', tab2ClerkBCListener);

    const message = 'a message from tab1';
    tab1ClerkBC.postMessage(message);
    expect(tab1DifferentBCListener).not.toHaveBeenCalled();
    expect(tab2ClerkBCListener).toHaveBeenCalled();
  });
});
