import { describe, expect, test, vi } from 'vitest';

vi.mock('react-native', () => ({
  Linking: { openURL: vi.fn() },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: 'View',
}));

import { serializeUserProfileCustomPages } from '../UserProfileCustomPages';

describe('serializeUserProfileCustomPages', () => {
  test('uses native defaults and excludes React content', () => {
    const result = serializeUserProfileCustomPages([
      {
        path: 'preferences',
        label: 'Preferences',
        content: null,
      },
    ]);

    expect(JSON.parse(result)).toEqual([
      {
        path: 'preferences',
        label: 'Preferences',
        icon: 'settings',
        placement: { type: 'sectionEnd', section: 'profile' },
      },
    ]);
  });

  test('preserves row declaration order and placement', () => {
    const result = serializeUserProfileCustomPages([
      {
        path: 'support',
        label: 'Support',
        icon: 'info',
        placement: { type: 'sectionStart', section: 'account' },
        content: null,
      },
      {
        path: 'billing',
        label: 'Billing',
        icon: 'billing',
        placement: { type: 'before', row: 'signOut' },
        content: null,
      },
    ]);

    expect(JSON.parse(result).map((page: { path: string }) => page.path)).toEqual(['support', 'billing']);
    expect(JSON.parse(result)[1].placement).toEqual({ type: 'before', row: 'signOut' });
  });

  test('serializes push-only destinations without exposing profile rows', () => {
    const result = serializeUserProfileCustomPages(
      [{ path: 'billing', label: 'Billing', content: null }],
      [{ path: 'invoice-details', label: 'Invoice details', content: null }],
    );

    expect(JSON.parse(result)).toEqual([
      {
        path: 'billing',
        label: 'Billing',
        icon: 'settings',
        placement: { type: 'sectionEnd', section: 'profile' },
      },
      {
        path: 'invoice-details',
        label: 'Invoice details',
        icon: 'settings',
        placement: { type: 'sectionEnd', section: 'profile' },
        showAsRow: false,
      },
    ]);
  });

  test('rejects duplicate page paths', () => {
    expect(() =>
      serializeUserProfileCustomPages([
        { path: 'billing', label: 'Billing', content: null },
        { path: 'billing', label: 'Invoices', content: null },
      ]),
    ).toThrow('User profile custom page path "billing" must be unique.');
  });

  test('rejects duplicate paths across pages and destinations', () => {
    expect(() =>
      serializeUserProfileCustomPages(
        [{ path: 'billing', label: 'Billing', content: null }],
        [{ path: 'billing', label: 'Billing details', content: null }],
      ),
    ).toThrow('User profile custom page path "billing" must be unique.');
  });
});
