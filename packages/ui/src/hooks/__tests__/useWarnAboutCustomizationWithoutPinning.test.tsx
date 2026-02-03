import { ClerkInstanceContext } from '@clerk/shared/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { OptionsContext } from '../../contexts/OptionsContext';
import { useWarnAboutCustomizationWithoutPinning } from '../useWarnAboutCustomizationWithoutPinning';

// Mock the warning function
vi.mock('../../utils/warnAboutCustomizationWithoutPinning', () => ({
  warnAboutComponentAppearance: vi.fn(),
}));

import { warnAboutComponentAppearance } from '../../utils/warnAboutCustomizationWithoutPinning';

const mockWarnAboutComponentAppearance = vi.mocked(warnAboutComponentAppearance);

// Helper to create a wrapper with contexts
function createWrapper({
  clerkInstanceType = 'development',
  hasClerkContext = true,
  uiPinned = false,
}: {
  clerkInstanceType?: 'development' | 'production';
  hasClerkContext?: boolean;
  uiPinned?: boolean;
} = {}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const clerkValue = hasClerkContext
      ? {
          value: {
            instanceType: clerkInstanceType,
          } as any,
        }
      : undefined;

    const optionsValue = uiPinned ? { ui: { version: '1.0.0' } } : {};

    return (
      <ClerkInstanceContext.Provider value={clerkValue}>
        <OptionsContext.Provider value={optionsValue as any}>{children}</OptionsContext.Provider>
      </ClerkInstanceContext.Provider>
    );
  };
}

describe('useWarnAboutCustomizationWithoutPinning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock requestIdleCallback since it may not be available in test environment
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
      cb();
      return 1;
    });
    vi.stubGlobal('cancelIdleCallback', vi.fn());
  });

  describe('in development mode', () => {
    test('calls warnAboutComponentAppearance when component mounts with appearance', () => {
      const appearance = {
        elements: { card: { '& > div': { color: 'red' } } },
      };

      renderHook(() => useWarnAboutCustomizationWithoutPinning(appearance), {
        wrapper: createWrapper({ clerkInstanceType: 'development' }),
      });

      expect(mockWarnAboutComponentAppearance).toHaveBeenCalledTimes(1);
      expect(mockWarnAboutComponentAppearance).toHaveBeenCalledWith(appearance, false);
    });

    test('passes uiPinned=true when options.ui is set', () => {
      const appearance = {
        elements: { card: { '& > div': { color: 'red' } } },
      };

      renderHook(() => useWarnAboutCustomizationWithoutPinning(appearance), {
        wrapper: createWrapper({ clerkInstanceType: 'development', uiPinned: true }),
      });

      expect(mockWarnAboutComponentAppearance).toHaveBeenCalledTimes(1);
      expect(mockWarnAboutComponentAppearance).toHaveBeenCalledWith(appearance, true);
    });
  });

  describe('in production mode', () => {
    test('does not call warnAboutComponentAppearance', () => {
      const appearance = {
        elements: { card: { '& > div': { color: 'red' } } },
      };

      renderHook(() => useWarnAboutCustomizationWithoutPinning(appearance), {
        wrapper: createWrapper({ clerkInstanceType: 'production' }),
      });

      expect(mockWarnAboutComponentAppearance).not.toHaveBeenCalled();
    });
  });

  describe('without ClerkProvider context', () => {
    test('does not call warnAboutComponentAppearance (graceful degradation for tests)', () => {
      const appearance = {
        elements: { card: { '& > div': { color: 'red' } } },
      };

      renderHook(() => useWarnAboutCustomizationWithoutPinning(appearance), {
        wrapper: createWrapper({ hasClerkContext: false }),
      });

      expect(mockWarnAboutComponentAppearance).not.toHaveBeenCalled();
    });
  });
});
