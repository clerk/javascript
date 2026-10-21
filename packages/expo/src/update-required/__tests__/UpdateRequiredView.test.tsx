import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  platformOS: 'ios' as string,
  openURL: vi.fn(),
  identity: null as null | { platform: string; appIdentifier: string; version: string; displayVersion: string },
}));

vi.mock('react-native', async () => {
  const React = await import('react');
  type Props = { children?: ReactNode; onPress?: () => void; accessibilityRole?: string; source?: { uri: string } };
  const element =
    (tag: string) =>
    ({ children, onPress, accessibilityRole, source }: Props) =>
      React.createElement(tag, { onClick: onPress, role: accessibilityRole, src: source?.uri }, children);
  return {
    View: element('div'),
    ScrollView: element('div'),
    Text: element('span'),
    Pressable: element('button'),
    Image: element('img'),
    Modal: ({ visible, children }: { visible: boolean; children?: ReactNode }) =>
      visible ? React.createElement('div', { 'data-testid': 'modal' }, children) : null,
    StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 0.5 },
    Linking: { openURL: mocks.openURL },
    useColorScheme: () => 'light',
    Platform: {
      get OS() {
        return mocks.platformOS;
      },
    },
  };
});

vi.mock('../../app-version/nativeAppIdentity', () => ({
  getNativeAppIdentity: () => mocks.identity,
  getNativeAppPlatform: () => mocks.platformOS,
  getNativeAppName: () => 'Acme Native',
  isExpoApplicationInstalled: () => true,
}));

const APP_STORE_URL = 'https://apps.apple.com/app/id123';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.example.app';

const loadModules = async () => {
  const store = await import('../../app-version/appVersionSupport');
  const { UpdateRequiredView } = await import('../UpdateRequiredView');
  const { UpdateRequiredModal } = await import('../UpdateRequiredModal');
  return { store, UpdateRequiredView, UpdateRequiredModal };
};

const environment = ({ updateUrl, supportEmail }: { updateUrl: string; supportEmail?: string }) => ({
  display_config: {
    application_name: 'Acme',
    logo_image_url: 'https://img.example.com/logo.png',
    support_email: supportEmail,
  },
  native_app_settings: {
    minimum_supported_version: {
      ios: [{ bundle_id: 'com.example.app', minimum_version: '2.0', update_url: updateUrl }],
      android: [{ package_name: 'com.example.app', minimum_version: '42', update_url: updateUrl }],
    },
  },
});

describe('UpdateRequiredView', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.openURL.mockReset();
    mocks.platformOS = 'ios';
    mocks.identity = { platform: 'ios', appIdentifier: 'com.example.app', version: '1.9.9', displayVersion: '1.9.9' };
  });

  const block = (
    store: Awaited<ReturnType<typeof loadModules>>['store'],
    options: { updateUrl: string; supportEmail?: string },
  ) => {
    act(() => {
      store.applyFetchedEnvironment(environment(options), {
        generation: store.getAppVersionSupportGeneration(),
        serverAnswersAtRequest: store.getServerAnswerCount(),
      });
    });
  };

  test('tells an iOS user to update and compares their version with the minimum', async () => {
    const { store, UpdateRequiredView } = await loadModules();
    render(<UpdateRequiredView />);
    block(store, { updateUrl: APP_STORE_URL, supportEmail: 'support@example.com' });

    expect(screen.getByRole('header').textContent).toBe('Update required');
    expect(
      screen.getByText(
        'This version of Acme is no longer supported. To keep your account secure, please update to continue.',
      ),
    ).toBeDefined();
    expect(screen.getByText('Your version')).toBeDefined();
    expect(screen.getByText('1.9.9')).toBeDefined();
    expect(screen.getByText('2.0+')).toBeDefined();
    expect(document.querySelector('img')?.getAttribute('src')).toBe('https://img.example.com/logo.png');
  });

  test('opens the store and the support email', async () => {
    const { store, UpdateRequiredView } = await loadModules();
    render(<UpdateRequiredView />);
    block(store, { updateUrl: APP_STORE_URL, supportEmail: 'support@example.com' });

    fireEvent.click(screen.getByText('Go to App Store'));
    fireEvent.click(screen.getByText('Get Help'));

    expect(mocks.openURL).toHaveBeenNthCalledWith(1, APP_STORE_URL);
    expect(mocks.openURL).toHaveBeenNthCalledWith(2, 'mailto:support@example.com');
  });

  test('leaves out the help link without a support email', async () => {
    const { store, UpdateRequiredView } = await loadModules();
    render(<UpdateRequiredView />);
    block(store, { updateUrl: APP_STORE_URL });

    expect(screen.queryByText('Get Help')).toBeNull();
  });

  test('shows an Android user only their version name', async () => {
    mocks.platformOS = 'android';
    mocks.identity = { platform: 'android', appIdentifier: 'com.example.app', version: '41', displayVersion: '4.8.4' };
    const { store, UpdateRequiredView } = await loadModules();
    render(<UpdateRequiredView />);
    block(store, { updateUrl: PLAY_URL, supportEmail: 'support@example.com' });

    expect(screen.getByText('4.8.4')).toBeDefined();
    expect(screen.queryByText('Required')).toBeNull();
    expect(screen.queryByText('41')).toBeNull();
    expect(screen.getByText('Go to Google Play')).toBeDefined();
    expect(screen.getByText('Get help')).toBeDefined();
  });

  test('names the Android button after a store other than Google Play', async () => {
    mocks.platformOS = 'android';
    mocks.identity = { platform: 'android', appIdentifier: 'com.example.app', version: '41', displayVersion: '4.8.4' };
    const { store, UpdateRequiredView } = await loadModules();
    render(<UpdateRequiredView />);
    block(store, { updateUrl: 'https://galaxystore.samsung.com/detail/com.example.app' });

    expect(screen.getByText('Update app')).toBeDefined();
  });

  test('the modal covers the app only while it is unsupported', async () => {
    const { store, UpdateRequiredModal } = await loadModules();
    render(<UpdateRequiredModal />);
    expect(screen.queryByTestId('modal')).toBeNull();

    block(store, { updateUrl: APP_STORE_URL });
    expect(screen.getByTestId('modal')).toBeDefined();

    act(() => {
      store.applySupportedAppVersion(store.getAppVersionSupportGeneration());
    });
    expect(screen.queryByTestId('modal')).toBeNull();
  });
});
