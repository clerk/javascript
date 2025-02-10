import { NEXT_WINDOW_HISTORY_SUPPORT_VERSION } from '~/internals/constants';

import { shouldUseVirtualRouting } from '../next';

let windowSpy: jest.SpyInstance;

beforeEach(() => {
  windowSpy = jest.spyOn(globalThis, 'window', 'get');
});

afterEach(() => {
  windowSpy.mockRestore();
});

describe('shouldUseVirtualRouting', () => {
  it('should return false if window is undefined', () => {
    windowSpy.mockReturnValue(undefined);

    expect(shouldUseVirtualRouting()).toBe(false);
  });
  it('should return false if window.next is undefined', () => {
    windowSpy.mockReturnValue({});

    expect(shouldUseVirtualRouting()).toBe(false);
  });
  it('should return true if version is lower than NEXT_WINDOW_HISTORY_SUPPORT_VERSION', () => {
    windowSpy.mockReturnValue({ next: { version: '14.0.0' } });

    expect(shouldUseVirtualRouting()).toBe(true);
  });
  it('should return false if version is NEXT_ROUTING_CHANGE_VERSION', () => {
    windowSpy.mockReturnValue({ next: { version: NEXT_WINDOW_HISTORY_SUPPORT_VERSION } });

    expect(shouldUseVirtualRouting()).toBe(false);
  });
  it('should return false if version is higher than NEXT_WINDOW_HISTORY_SUPPORT_VERSION', () => {
    windowSpy.mockReturnValue({ next: { version: '14.6.0' } });

    expect(shouldUseVirtualRouting()).toBe(false);
  });
});
