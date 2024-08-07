import type { EnvironmentResource } from '@clerk/types';
import { renderHook } from '@testing-library/react';

import { useDevMode } from '../useDevMode';

const mockUseEnvironment = jest.fn();
const mockUseOptions = jest.fn();
const mockUseAppearance = jest.fn();

jest.mock('../../contexts', () => {
  return {
    useEnvironment: () => mockUseEnvironment(),
    useOptions: () => mockUseOptions(),
  };
});

jest.mock('../../customizables', () => {
  return {
    useAppearance: () => mockUseAppearance(),
  };
});

describe('useDevMode', () => {
  test("should show dev mode notice when showDevModeWarning is enabled and it's a dev instance", () => {
    mockUseEnvironment.mockImplementationOnce(
      () =>
        ({
          displayConfig: {
            showDevModeWarning: true,
            instanceEnvironmentType: 'development',
          },
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }) as EnvironmentResource,
    );
    mockUseAppearance.mockImplementationOnce(() => ({
      parsedLayout: {
        unsafe_disableDevelopmentModeWarnings: false,
      },
    }));
    const { result } = renderHook(() => useDevMode());

    expect(result.current.showDevModeNotice).toBe(true);
  });

  test('should not show dev mode notice when using a production instance', () => {
    mockUseEnvironment.mockImplementationOnce(
      () =>
        ({
          displayConfig: {
            showDevModeWarning: false,
            instanceEnvironmentType: 'production',
          },
          isProduction: () => true,
          isDevelopmentOrStaging: () => false,
        }) as EnvironmentResource,
    );
    mockUseAppearance.mockImplementationOnce(() => ({
      parsedLayout: {
        unsafe_disableDevelopmentModeWarnings: false,
      },
    }));
    const { result } = renderHook(() => useDevMode());

    expect(result.current.showDevModeNotice).toBe(false);
  });

  test("should not show dev mode notice when showDevModeWarning is false even if it's a dev instance", () => {
    mockUseEnvironment.mockImplementationOnce(
      () =>
        ({
          displayConfig: {
            showDevModeWarning: false,
            instanceEnvironmentType: 'development',
          },
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }) as EnvironmentResource,
    );
    mockUseAppearance.mockImplementationOnce(() => ({
      parsedLayout: {
        unsafe_disableDevelopmentModeWarnings: false,
      },
    }));
    const { result } = renderHook(() => useDevMode());

    expect(result.current.showDevModeNotice).toBe(false);
  });

  test('should not show dev mode notice when unsafe_disableDevelopmentModeWarnings is true', () => {
    mockUseEnvironment.mockImplementationOnce(
      () =>
        ({
          displayConfig: {
            showDevModeWarning: true,
            instanceEnvironmentType: 'development',
          },
          isProduction: () => false,
          isDevelopmentOrStaging: () => true,
        }) as EnvironmentResource,
    );
    mockUseAppearance.mockImplementationOnce(() => ({
      parsedLayout: {
        unsafe_disableDevelopmentModeWarnings: true,
      },
    }));
    const { result } = renderHook(() => useDevMode());

    expect(result.current.showDevModeNotice).toBe(false);
  });
});
