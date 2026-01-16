import type { RenderOptions } from '@testing-library/react';
import { render as _render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, vi } from 'vitest';

Element.prototype.scrollIntoView = vi.fn();

const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const user = userEvent.setup({ delay: null });
  return { ..._render(ui, { ...options }), userEvent: user };
};

/**
 * Helper method to mock a native runtime environment for specific test cases, currently targeted at React Native.
 * Makes some assumptions about our runtime detection utilities in `packages/clerk-js/src/utils/runtime.ts`.
 *
 * Usage:
 *
 * ```js
 * mockNativeRuntime(() => {
 *  // test cases
 *  it('simulates native', () => {
 *    expect(typeof document).toBe('undefined');
 *  });
 * });
 * ```
 */
export const mockNativeRuntime = (fn: () => void) => {
  describe('native runtime', () => {
    let spyDocument: ReturnType<typeof vi.spyOn>;
    let spyNavigator: ReturnType<typeof vi.spyOn>;

    beforeAll(() => {
      spyDocument = vi.spyOn(globalThis, 'document', 'get');
      spyDocument.mockReturnValue(undefined);

      spyNavigator = vi.spyOn(globalThis.navigator, 'product', 'get');
      spyNavigator.mockReturnValue('ReactNative');
    });

    afterAll(() => {
      spyDocument.mockRestore();
      spyNavigator.mockRestore();
    });

    fn();
  });
};

export const mockWebAuthn = (fn: () => void) => {
  describe('with WebAuthn', () => {
    let originalPublicKeyCredential: any;
    beforeAll(() => {
      originalPublicKeyCredential = global.PublicKeyCredential;
      const publicKeyCredential: any = () => {};
      global.PublicKeyCredential = publicKeyCredential;
      publicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = () => Promise.resolve(true);
      publicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(true);
    });

    afterAll(() => {
      global.PublicKeyCredential = originalPublicKeyCredential;
    });

    fn();
  });
};

// Export everything from @testing-library/react except render, then export our custom render
export {
  screen,
  waitFor,
  fireEvent,
  act,
  cleanup,
  renderHook,
  type RenderOptions,
  type RenderHookOptions,
  type RenderHookResult,
  type RenderResult,
} from '@testing-library/react';
// Export our custom render function that includes userEvent
export { render };
