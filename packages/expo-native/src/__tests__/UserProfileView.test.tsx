import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { UserProfileCustomPageNavigation } from '../UserProfileCustomPages';
import { useUserProfileCustomPageNavigation } from '../UserProfileCustomPages';
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

function BillingPage() {
  const { push } = useUserProfileCustomPageNavigation();

  return (
    <button
      type='button'
      onClick={() => void push('invoice-details')}
    >
      View invoice
    </button>
  );
}

function InvoiceDetailsPage() {
  const { popToRoot } = useUserProfileCustomPageNavigation();

  return (
    <button
      type='button'
      onClick={() => void popToRoot()}
    >
      Done
    </button>
  );
}

let latestNavigation: UserProfileCustomPageNavigation | null = null;

function NavigationCapture() {
  latestNavigation = useUserProfileCustomPageNavigation();
  return null;
}

function getLatestNavigation(): UserProfileCustomPageNavigation {
  if (!latestNavigation) {
    throw new Error('Expected custom page navigation to be available.');
  }

  return latestNavigation;
}

describe('UserProfileView', () => {
  afterEach(cleanup);

  beforeEach(() => {
    mocks.navigateCustomPage.mockClear();
    mocks.nativeProps.mockClear();
    mocks.openURL.mockClear();
    latestNavigation = null;
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

  test('pushes a destination that is not exposed as a profile row', () => {
    const result = render(
      <UserProfileView
        customPages={[{ path: 'billing', label: 'Billing', content: <BillingPage /> }]}
        customDestinations={[
          { path: 'invoice-details', label: 'Invoice details', content: <div>Invoice details page</div> },
        ]}
      />,
    );

    expect(JSON.parse(lastNativeProps().customPages)[1]).toMatchObject({
      path: 'invoice-details',
      showAsRow: false,
    });

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'presented', path: 'billing' } });
    });
    fireEvent.click(result.getByText('View invoice'));
    expect(mocks.navigateCustomPage).toHaveBeenCalledWith('push', 'invoice-details');
    expect(result.getByText('Invoice details page')).toBeDefined();

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'dismissed', path: 'billing' } });
    });
    expect(result.getByText('View invoice')).toBeDefined();

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'presented', path: 'invoice-details' } });
    });
    expect(result.getByText('Invoice details page')).toBeDefined();
    expect(result.getByText('View invoice')).toBeDefined();

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'dismissed', path: 'invoice-details' } });
    });
    expect(result.queryByText('Invoice details page')).toBeNull();
    expect(result.getByText('View invoice')).toBeDefined();
  });

  test('rejects pushing a path that is already in the active stack', async () => {
    render(
      <UserProfileView
        customPages={[{ path: 'billing', label: 'Billing', content: <NavigationCapture /> }]}
        customDestinations={[{ path: 'invoice-details', label: 'Invoice details', content: <NavigationCapture /> }]}
      />,
    );
    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'presented', path: 'billing' } });
    });

    await act(async () => {
      await getLatestNavigation().push('invoice-details');
    });

    await expect(getLatestNavigation().push('billing')).rejects.toThrow(
      'Custom user profile page or destination "billing" is already in the navigation stack.',
    );
    expect(mocks.navigateCustomPage).toHaveBeenCalledTimes(1);
    expect(mocks.navigateCustomPage).toHaveBeenCalledWith('push', 'invoice-details');
  });

  test('unmounts the retained custom page stack after returning to the profile root', () => {
    const result = render(
      <UserProfileView
        customPages={[{ path: 'billing', label: 'Billing', content: <BillingPage /> }]}
        customDestinations={[{ path: 'invoice-details', label: 'Invoice details', content: <InvoiceDetailsPage /> }]}
      />,
    );

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'presented', path: 'billing' } });
    });
    fireEvent.click(result.getByText('View invoice'));
    fireEvent.click(result.getByText('Done'));
    expect(mocks.navigateCustomPage).toHaveBeenLastCalledWith('popToRoot');

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'dismissed', path: 'invoice-details' } });
    });
    expect(result.queryByText('View invoice')).toBeNull();
    expect(result.queryByText('Done')).toBeNull();
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

  test('warns when an href page cannot be opened and returns to the profile root', async () => {
    const error = new Error('Unable to open URL');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mocks.openURL.mockRejectedValueOnce(error);

    render(<UserProfileView customPages={[{ path: 'docs', label: 'Docs', href: 'https://clerk.com/docs' }]} />);

    act(() => {
      lastNativeProps().onCustomPageEvent({ nativeEvent: { type: 'presented', path: 'docs' } });
    });

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith('Could not open custom user profile page "docs".', error);
      expect(mocks.navigateCustomPage).toHaveBeenCalledWith('back');
    });

    warn.mockRestore();
  });
});
