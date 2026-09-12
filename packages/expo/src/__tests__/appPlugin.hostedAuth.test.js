import { describe, expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS plugin, no ESM export
const { addHostedAuthIntentFilter } = require('../../app.plugin.js')._testing;

const hostedAuthIntentFilter = () => ({
  action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
  category: [
    { $: { 'android:name': 'android.intent.category.DEFAULT' } },
    { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
  ],
  data: [{ $: { 'android:scheme': 'clerk', 'android:host': 'com.example.app.hosted-callback' } }],
});

describe('addHostedAuthIntentFilter', () => {
  test('registers the canonical Android hosted auth callback', () => {
    const mainActivity = {};

    addHostedAuthIntentFilter(mainActivity, 'com.example.app');

    expect(mainActivity['intent-filter']).toContainEqual(hostedAuthIntentFilter());
  });

  test('does not duplicate an existing hosted auth callback', () => {
    const mainActivity = {};

    addHostedAuthIntentFilter(mainActivity, 'com.example.app');
    addHostedAuthIntentFilter(mainActivity, 'com.example.app');

    expect(mainActivity['intent-filter']).toHaveLength(1);
  });

  test.each([
    ['VIEW action', filter => ({ ...filter, action: [] })],
    [
      'DEFAULT category',
      filter => ({
        ...filter,
        category: filter.category.filter(category => category.$['android:name'] !== 'android.intent.category.DEFAULT'),
      }),
    ],
    [
      'BROWSABLE category',
      filter => ({
        ...filter,
        category: filter.category.filter(
          category => category.$['android:name'] !== 'android.intent.category.BROWSABLE',
        ),
      }),
    ],
  ])('registers a valid callback when a matching filter lacks the %s', (_requirement, omitRequirement) => {
    const mainActivity = {
      'intent-filter': [omitRequirement(hostedAuthIntentFilter())],
    };

    addHostedAuthIntentFilter(mainActivity, 'com.example.app');

    expect(mainActivity['intent-filter']).toContainEqual(hostedAuthIntentFilter());
  });
});
