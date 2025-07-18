// eslint-disable-next-line no-restricted-imports
import { matchers } from '@emotion/jest';
import type { RenderOptions } from '@testing-library/react';
import { render as _render } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, type SpyInstance, vi } from 'vitest';

expect.extend(matchers);

Element.prototype.scrollIntoView = vi.fn();

const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const userEvent = UserEvent.setup({ delay: null });
  return { ..._render(ui, { ...options }), userEvent };
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
    let spyDocument: SpyInstance;
    let spyNavigator: SpyInstance;

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

export * from './ui/utils/vitest/runFakeTimers';
export * from './ui/utils/vitest/createFixtures';
// eslint-disable-next-line import/export
export * from '@testing-library/react';
// eslint-disable-next-line import/export
export { render };
