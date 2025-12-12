import { logger } from '@clerk/shared/logger';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { assertNoLegacyProp } from '../assertNoLegacyProp';

vi.mock('@clerk/shared/browser', () => ({
  inBrowser: vi.fn(() => true),
}));

import { inBrowser } from '@clerk/shared/browser';

const oldWindowLocation = window.location;

describe('assertNoLegacyProp', () => {
  let mockWindowLocation: Window['location'];
  let warnMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockWindowLocation = new URL('https://www.clerk.com') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation });
    warnMock = vi.spyOn(logger, 'warnOnce');
    // Reset inBrowser mock to return true by default
    vi.mocked(inBrowser).mockReturnValue(true);
  });

  afterAll(() => {
    Object.defineProperty(global.window, 'location', {
      value: oldWindowLocation,
    });
    warnMock.mockRestore();
  });

  describe('redirectUrl handling', () => {
    it('should NOT warn when redirectUrl equals window.location.href (auto-set case)', () => {
      const currentHref = window.location.href;
      assertNoLegacyProp({ redirectUrl: currentHref });

      expect(warnMock).not.toHaveBeenCalled();
    });

    it('should warn when redirectUrl is explicitly set to a different value', () => {
      assertNoLegacyProp({ redirectUrl: 'https://different-url.com' });

      expect(warnMock).toHaveBeenCalledTimes(1);
      expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('The prop "redirectUrl" is deprecated'));
    });

    it('should warn when redirectUrl is set to empty string', () => {
      assertNoLegacyProp({ redirectUrl: '' });

      expect(warnMock).not.toHaveBeenCalled();
    });

    it('should warn when redirectUrl is set to null', () => {
      assertNoLegacyProp({ redirectUrl: null });

      expect(warnMock).not.toHaveBeenCalled();
    });
  });

  describe('other legacy props', () => {
    it('should warn for afterSignInUrl', () => {
      assertNoLegacyProp({ afterSignInUrl: '/some-url' });

      expect(warnMock).toHaveBeenCalledTimes(1);
      expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('The prop "afterSignInUrl" is deprecated'));
    });

    it('should warn for afterSignUpUrl', () => {
      assertNoLegacyProp({ afterSignUpUrl: '/some-url' });

      expect(warnMock).toHaveBeenCalledTimes(1);
      expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('The prop "afterSignUpUrl" is deprecated'));
    });

    it('should warn for after_sign_in_url (snake_case)', () => {
      assertNoLegacyProp({ after_sign_in_url: '/some-url' });

      expect(warnMock).toHaveBeenCalledTimes(1);
      expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('The prop "after_sign_in_url" is deprecated'));
    });

    it('should warn for after_sign_up_url (snake_case)', () => {
      assertNoLegacyProp({ after_sign_up_url: '/some-url' });

      expect(warnMock).toHaveBeenCalledTimes(1);
      expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('The prop "after_sign_up_url" is deprecated'));
    });
  });

  describe('non-legacy props', () => {
    it('should NOT warn when no legacy props are present', () => {
      assertNoLegacyProp({ someOtherProp: 'value' });

      expect(warnMock).not.toHaveBeenCalled();
    });

    it('should NOT warn when props object is empty', () => {
      assertNoLegacyProp({});

      expect(warnMock).not.toHaveBeenCalled();
    });
  });
});
