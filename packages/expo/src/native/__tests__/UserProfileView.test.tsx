import { render } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, test, vi } from 'vitest';

import type { UserProfileViewRef } from '../UserProfileView';
import { UserProfileView } from '../UserProfileView';

const mocks = vi.hoisted(() => {
  return {
    nativeProps: vi.fn(),
    goBack: vi.fn(() => Promise.resolve()),
    popToRoot: vi.fn(() => Promise.resolve()),
  };
});

vi.mock('../../specs/NativeClerkUserProfileView', async () => {
  const { forwardRef, useImperativeHandle } = await import('react');
  return {
    default: forwardRef((props: Record<string, unknown>, ref) => {
      mocks.nativeProps(props);
      useImperativeHandle(ref, () => ({ goBack: mocks.goBack, popToRoot: mocks.popToRoot }));
      return null;
    }),
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

  test('unwraps navigation change events when hideHeader is enabled', () => {
    const onNavigationChange = vi.fn();

    render(
      <UserProfileView
        hideHeader
        onNavigationChange={onNavigationChange}
      />,
    );

    const props = lastNativeProps();
    expect(props.hideHeader).toBe(true);
    props.onNavigationChange({ nativeEvent: { depth: 2, canGoBack: true } });

    expect(onNavigationChange).toHaveBeenCalledWith({ depth: 2, canGoBack: true });
  });

  test('does not subscribe to navigation changes without hideHeader', () => {
    render(<UserProfileView onNavigationChange={vi.fn()} />);

    const props = lastNativeProps();
    expect(props.hideHeader).toBe(false);
    expect(props.onNavigationChange).toBeUndefined();
  });

  test('forwards goBack and popToRoot through the ref', async () => {
    const ref = createRef<UserProfileViewRef>();

    render(
      <UserProfileView
        ref={ref}
        hideHeader
      />,
    );

    await ref.current?.goBack();
    await ref.current?.popToRoot();

    expect(mocks.goBack).toHaveBeenCalledTimes(1);
    expect(mocks.popToRoot).toHaveBeenCalledTimes(1);
  });
});
