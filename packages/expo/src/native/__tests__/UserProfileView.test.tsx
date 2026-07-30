import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { UserProfileView } from '../UserProfileView';

const mocks = vi.hoisted(() => {
  return {
    nativeProps: vi.fn(),
  };
});

vi.mock('../../specs/NativeClerkUserProfileView', () => {
  return {
    default: (props: Record<string, unknown>) => {
      mocks.nativeProps(props);
      return null;
    },
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
    StyleSheet: { create: <T,>(styles: T) => styles },
  };
});

function lastNativeProps() {
  return mocks.nativeProps.mock.calls.at(-1)?.[0];
}

describe('UserProfileView', () => {
  test('calls onDismiss when the native profile view emits dismissed', () => {
    const onDismiss = vi.fn();

    render(<UserProfileView onDismiss={onDismiss} />);

    lastNativeProps().onProfileEvent({ nativeEvent: { type: 'dismissed' } });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('calls onHostBack when the root back button is tapped', () => {
    const onHostBack = vi.fn();

    render(
      <UserProfileView
        hostBackButton
        onHostBack={onHostBack}
      />,
    );

    const props = lastNativeProps();
    expect(props.hostBackButton).toBe(true);
    props.onHostBack();

    expect(onHostBack).toHaveBeenCalledTimes(1);
  });

  test('does not request a host back button by default', () => {
    render(<UserProfileView onHostBack={vi.fn()} />);

    const props = lastNativeProps();
    expect(props.hostBackButton).toBe(false);
    expect(props.onHostBack).toBeUndefined();
  });
});
