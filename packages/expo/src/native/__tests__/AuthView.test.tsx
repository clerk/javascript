import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthView } from '../AuthView';

const mocks = vi.hoisted(() => {
  return {
    NativeClerkAuthView: vi.fn(() => null),
  };
});

vi.mock('../../specs/NativeClerkAuthView', () => {
  return {
    default: mocks.NativeClerkAuthView,
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
  beforeEach(() => {
    mocks.NativeClerkAuthView.mockClear();
  });

  test('passes logoMaxHeight to the native auth view', () => {
    render(<AuthView logoMaxHeight={64} />);

    expect(mocks.NativeClerkAuthView.mock.calls[0]?.[0]).toMatchObject({ logoMaxHeight: 64 });
  });

  test('calls onDismiss when the native auth view emits dismissed', () => {
    const onDismiss = vi.fn();

    render(<AuthView onDismiss={onDismiss} />);

    const props = mocks.NativeClerkAuthView.mock.calls[0]?.[0];
    props.onAuthEvent({ nativeEvent: { type: 'dismissed' } });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('passes a custom logo to the native auth view as a single child', () => {
    const logo = <span>Custom logo</span>;

    render(<AuthView logo={logo} />);

    const props = mocks.NativeClerkAuthView.mock.calls.at(-1)?.[0];
    expect(props.children.props.children).toBe(logo);
  });
});
