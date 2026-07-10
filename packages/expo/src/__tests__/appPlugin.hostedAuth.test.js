import { describe, expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS plugin, no ESM export
const { addHostedAuthIntentFilter } = require('../../app.plugin.js')._testing;

describe('addHostedAuthIntentFilter', () => {
  test('registers the canonical Android hosted auth callback', () => {
    const mainActivity = {};

    addHostedAuthIntentFilter(mainActivity, 'com.example.app');

    expect(mainActivity['intent-filter']).toContainEqual({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [
        { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
      ],
      data: [{ $: { 'android:scheme': 'clerk', 'android:host': 'com.example.app.callback' } }],
    });
  });

  test('does not duplicate an existing hosted auth callback', () => {
    const mainActivity = {};

    addHostedAuthIntentFilter(mainActivity, 'com.example.app');
    addHostedAuthIntentFilter(mainActivity, 'com.example.app');

    expect(mainActivity['intent-filter']).toHaveLength(1);
  });
});
