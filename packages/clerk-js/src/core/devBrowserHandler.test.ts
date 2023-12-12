import type { CreateDevBrowserHandlerOptions } from './devBrowserHandler';
import { createDevBrowserHandler } from './devBrowserHandler';

describe('detBrowserHandler', () => {
  // @ts-ignore
  const { getDevBrowserJWT, setDevBrowserJWT, removeDevBrowserJWT } = createDevBrowserHandler(
    {} as CreateDevBrowserHandlerOptions,
  );

  // TODO: Add devbrowser tests
  describe('get', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });
    });

    it('todo', () => {
      expect(true).toBeTruthy();
    });
  });
});
