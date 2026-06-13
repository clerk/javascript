import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { AuthView } from '../AuthView';

const mocks = vi.hoisted(() => {
  return {
    NativeClerkAuthView: vi.fn(() => null),
  };
});

vi.mock('../../specs/nativeView', () => {
  return {
    getNativeClerkView: () => mocks.NativeClerkAuthView,
  };
});

vi.mock('../../utils/native-module', () => {
  return {
    isNativeSupported: true,
  };
});

vi.mock('react-native', () => {
  return {
    Text: ({ children }: { children?: React.ReactNode }) => React.createElement('span', null, children),
    View: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  };
});

describe('AuthView', () => {
  test('calls onDismiss when the native auth view emits dismissed', () => {
    const onDismiss = vi.fn();

    render(<AuthView onDismiss={onDismiss} />);

    const props = mocks.NativeClerkAuthView.mock.calls[0]?.[0];
    props.onAuthEvent({ nativeEvent: { type: 'dismissed' } });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
