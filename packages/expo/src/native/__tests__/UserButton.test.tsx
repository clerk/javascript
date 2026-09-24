import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { UserButton } from '../UserButton';

const mocks = vi.hoisted(() => ({
  nativeProps: vi.fn(),
}));

vi.mock('../../specs/NativeClerkUserButtonView', () => ({
  default: React.forwardRef((props: Record<string, unknown>, _ref) => {
    mocks.nativeProps(props);
    return null;
  }),
}));

vi.mock('../../utils/native-module', () => ({
  isNativeSupported: true,
}));

vi.mock('react-native', () => ({
  Linking: { openURL: vi.fn() },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  useWindowDimensions: () => ({ width: 390, height: 844 }),
}));

describe('UserButton', () => {
  test('passes nested user profile custom pages to the native view', () => {
    render(
      <UserButton
        userProfileProps={{
          customPages: [
            {
              path: 'api-keys',
              label: 'API keys',
              icon: 'key',
              content: <div>API keys page</div>,
            },
          ],
          customDestinations: [
            {
              path: 'api-key-details',
              label: 'API key details',
              content: <div>API key details page</div>,
            },
          ],
        }}
      />,
    );

    const props = mocks.nativeProps.mock.calls.at(-1)?.[0];
    expect(JSON.parse(props.customPages)).toEqual([
      {
        path: 'api-keys',
        label: 'API keys',
        icon: 'key',
        placement: { type: 'sectionEnd', section: 'profile' },
      },
      {
        path: 'api-key-details',
        label: 'API key details',
        icon: 'settings',
        placement: { type: 'sectionEnd', section: 'profile' },
        showAsRow: false,
      },
    ]);
  });
});
