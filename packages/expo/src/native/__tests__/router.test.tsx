import Module from 'node:module';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthScreen } from '../router';

const mocks = vi.hoisted(() => ({
  routerBack: vi.fn(),
}));

vi.mock('../AuthView', async () => {
  const { createElement, forwardRef } = await import('react');
  return {
    AuthView: forwardRef(({ onDismiss }: { onDismiss?: () => void }, _ref) =>
      createElement('button', { onClick: onDismiss }, 'Dismiss auth'),
    ),
  };
});

vi.mock('../UserProfileView', () => ({
  UserProfileView: () => null,
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ isSignedIn: true }),
}));

vi.mock('react-native', () => ({
  BackHandler: {
    addEventListener: () => ({ remove: vi.fn() }),
  },
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    mocks.routerBack.mockClear();

    const Stack = Object.assign(({ children }: { children?: React.ReactNode }) => children, {
      Screen: () => null,
    });
    const originalRequire = Module.prototype.require;
    vi.spyOn(Module.prototype, 'require').mockImplementation(function (id: string) {
      if (id === 'expo-router') {
        return {
          Stack,
          useRouter: () => ({ back: mocks.routerBack }),
          useFocusEffect: (effect: () => undefined | (() => void)) => React.useEffect(effect, [effect]),
        };
      }
      if (id === '@react-navigation/elements') {
        return { HeaderBackButton: () => null };
      }
      return originalRequire.call(this, id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('pops the route and notifies the caller when auth is dismissed', () => {
    const onDismiss = vi.fn();
    render(<AuthScreen onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss auth' }));

    expect(mocks.routerBack).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
