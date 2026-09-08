/* eslint-disable turbo/no-undeclared-env-vars */

import { defineConfig } from '@playwright/test';
import type { TouchpressOptions } from 'touchpress';

const deviceName = process.env.E2E_DEVICE_NAME;

export default defineConfig<TouchpressOptions>({
  testDir: './tests/expo-native',
  forbidOnly: !!process.env.CI,
  // A spec that needs its retry every run is a bug, not a flake. One absorbs
  // emulator and simulator noise, and no more.
  retries: process.env.CI ? 1 : 0,
  // One device, so one worker.
  workers: 1,
  // The heaviest spec signs in twice through the native AuthView.
  timeout: 300_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: './tests/expo-native/playwright-report' }]]
    : 'list',
  outputDir: './tests/expo-native/test-results',

  use: {
    app: 'com.clerk.exponativebuildfixture',
    // Matches 'signed in' and 'signed out' but not 'loading', so the gate holds
    // until clerk-js has finished initialising rather than until the element
    // merely exists. That is what the old warmup flow bought: on a cold CI
    // emulator clerk-js can take past a minute, and waiting for it here charges
    // the time to launchTimeout instead of to the first assertion that runs.
    readyWhen: { text: 'signed' },
    actionTimeout: 20_000,
    // Every spec clears state and relaunches itself, and that has to happen
    // inside the test rather than in the fixture that would precede it.
    // The per-test relaunch would only add a launch nothing reads.
    relaunch: 'per-worker',
    // CI boots a fresh device per job; a claim left by a killed run must not
    // fail the next one.
    onDeviceInUse: 'reclaim',
    // A cold Release build on a CI emulator can take a minute to first paint.
    launchTimeout: 120_000,
    // Unset means the one booted device, which is what both CI jobs give us and
    // what avoids agent-device's AVD-name-with-spaces translation entirely.
    deviceName,
  },

  projects: [
    {
      name: 'setup-ios',
      testMatch: /preflight\.setup\.ts/,
      use: { platform: 'ios' },
    },
    {
      name: 'setup-android',
      testMatch: /preflight\.setup\.ts/,
      use: { platform: 'android' },
    },
    {
      name: 'ios',
      dependencies: ['setup-ios'],
      testIgnore: /preflight\.setup\.ts/,
      use: { platform: 'ios' },
    },
    {
      name: 'android',
      dependencies: ['setup-android'],
      testIgnore: /preflight\.setup\.ts/,
      use: { platform: 'android' },
    },
  ],
});
