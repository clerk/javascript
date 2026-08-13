import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { UserProfileView } from '../UserProfileView';

const mocks = vi.hoisted(() => {
  return {
    navigateCustomPage: vi.fn(() => Promise.resolve()),
    nativeProps: vi.fn(),
    openURL: vi.fn(() => Promise.resolve()),
  };
});

vi.mock('../../specs/NativeClerkUserProfileView', () => {
  return {
    default: React.forwardRef((props: { children?: React.ReactNode }, ref) => {
      React.useImperativeHandle(ref, () => ({ navigateCustomPage: mocks.navigateCustomPage }));
      mocks.nativeProps(props);
      return <>{props.children}</>;
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
    Linking: { openURL: mocks.openURL },
    Text: ({ children }: { children?: React.ReactNode }) => React.createElement('span', null, children),
    View: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
    StyleSheet: { create: <T,>(styles: T) => styles },
  };
});

function lastNativeProps() {
  return mocks.nativeProps.mock.calls.at(-1)?.[0];
}

describe('UserProfileView', () => {
  beforeEach(() => {
    mocks.navigateCustomPage.mockClear();
    mocks.nativeProps.mockClear();
    mocks.openURL.mockClear();
  });

  test('calls onDismiss when the native profile view emits dismissed', () => {
    const onDismiss = vi.fn();

    render(<UserProfileView onDismiss={onDismiss} />);

    lastNativeProps().onProfileEvent({ nativeEvent: { type: 'dismissed' } });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('shows the root back button and calls onHostBack when it is tapped', () => {
    const onHostBack = vi.fn();

    render(<UserProfileView onHostBack={onHostBack} />);

    const props = lastNativeProps();
    expect(props.hostBackButton).toBe(true);
    props.onHostBack();

    expect(onHostBack).toHaveBeenCalledTimes(1);
  });

  test('does not show a root back button without onHostBack', () => {
    render(<UserProfileView />);

    const props = lastNativeProps();
    expect(props.hostBackButton).toBe(false);
    expect(props.onHostBack).toBeUndefined();
  });

  test('serializes custom pages for the native profile view', () => {
    render(
      <UserProfileView
        customPages={[
          {
            path: 'billing',
            label: 'Billing',
            icon: 'billing',
            placement: { type: 'after', row: 'security' },
            content: <div>Billing page</div>,
          },
        ]}
      />,
    );

    expect(JSON.parse(lastNativeProps().customPages)).toEqual([
      {
        path: 'billing',
        label: 'Billing',
        icon: 'billing',
        placement: { type: 'after', row: 'security' },
      },
    ]);
  });

  test('mounts custom page content only while its native page is presented', () => {
    const result = render(
      <UserProfileView customPages={[{ path: 'api-keys', label: 'API keys', content: <div>API keys page</div> }]} />,
    );

    expect(result.queryByText('API keys page')).toBeNull();

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'presented', path: 'api-keys' } });
    });
    expect(result.getByText('API keys page')).toBeDefined();

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'dismissed', path: 'api-keys' } });
    });
    expect(result.queryByText('API keys page')).toBeNull();
  });

  test('opens href pages externally and returns to the profile root', async () => {
    render(<UserProfileView customPages={[{ path: 'docs', label: 'Docs', href: 'https://clerk.com/docs' }]} />);

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'presented', path: 'docs' } });
    });

    await waitFor(() => {
      expect(mocks.openURL).toHaveBeenCalledWith('https://clerk.com/docs');
      expect(mocks.navigateCustomPage).toHaveBeenCalledWith('back');
    });
  });
});
