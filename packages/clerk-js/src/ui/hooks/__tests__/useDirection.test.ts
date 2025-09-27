import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDirection } from '../useDirection';

describe('useDirection', () => {
  const originalWindow = window;
  const mockGetComputedStyle = vi.fn();

  beforeEach(() => {
    // Mock window.getComputedStyle
    mockGetComputedStyle.mockReset();
    Object.defineProperty(window, 'getComputedStyle', {
      value: mockGetComputedStyle,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore window
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
    });
  });

  describe('SSR environment', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      // @ts-ignore - Intentionally removing window for SSR test
      delete global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('returns ltr when window is undefined', () => {
      expect(useDirection()).toBe('ltr');
    });
  });

  describe('Browser environment', () => {
    it('returns rtl when element has dir="rtl"', () => {
      const element = document.createElement('div');
      element.dir = 'rtl';

      const { result } = renderHook(() => useDirection(element));
      expect(result.current).toBe('rtl');
    });

    it('returns ltr when element has dir="ltr"', () => {
      const element = document.createElement('div');
      element.dir = 'ltr';

      const { result } = renderHook(() => useDirection(element));
      expect(result.current).toBe('ltr');
    });

    it('returns rtl when element has computed direction rtl', () => {
      const element = document.createElement('div');
      element.dir = 'auto';
      mockGetComputedStyle.mockReturnValue({ direction: 'rtl' });

      const { result } = renderHook(() => useDirection(element));
      expect(result.current).toBe('rtl');
    });

    it('returns ltr when element has no dir attribute', () => {
      const element = document.createElement('div');
      mockGetComputedStyle.mockReturnValue({ direction: 'ltr' });

      const { result } = renderHook(() => useDirection(element));
      expect(result.current).toBe('ltr');
    });

    it('returns ltr when element has invalid dir attribute value', () => {
      const element = document.createElement('div');
      element.dir = 'test';
      mockGetComputedStyle.mockReturnValue({ direction: 'ltr' });

      const { result } = renderHook(() => useDirection(element));
      expect(result.current).toBe('ltr');
    });

    it('uses document.documentElement when no element is provided', () => {
      document.documentElement.dir = 'rtl';

      const { result } = renderHook(() => useDirection());
      expect(result.current).toBe('rtl');
    });

    it('prioritizes element direction over document direction', () => {
      document.documentElement.dir = 'rtl';
      const element = document.createElement('div');
      element.dir = 'ltr';

      const { result } = renderHook(() => useDirection(element));
      expect(result.current).toBe('ltr');
    });
  });
});
