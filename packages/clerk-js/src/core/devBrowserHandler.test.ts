import type { CreateDevBrowserHandlerOptions } from './devBrowserHandler';
import createDevBrowserHandler from './devBrowserHandler';

describe('detBrowserHandler', () => {
  const { getDevBrowserJWT, setDevBrowserJWT, removeDevBrowserJWT } = createDevBrowserHandler(
    {} as CreateDevBrowserHandlerOptions,
  );

  describe('localStorage', () => {
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

    it('stores and retrieves the DevBrowser JWT in localStorage', () => {
      const mockJWT = 'cafebabe';

      expect(setDevBrowserJWT(mockJWT)).toBeUndefined();
      expect(window.localStorage.setItem).toHaveBeenNthCalledWith(1, 'clerk-db-jwt', mockJWT);

      getDevBrowserJWT();
      expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);

      expect(removeDevBrowserJWT()).toBeUndefined();
      getDevBrowserJWT();
      expect(window.localStorage.getItem).toHaveBeenCalledTimes(2);
    });
  });
});
