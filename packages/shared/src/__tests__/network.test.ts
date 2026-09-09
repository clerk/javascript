// @vitest-environment node
import { expect, test } from 'vitest';
import {
  isNativeApplicationActive,
  isNetworkOnline,
  isValidNetworkEnvironment,
  setNativeNetworkEnvironment,
} from '../network';
import { stripOrigin, toURL } from '../internal/clerk-js/url';

test('native HTTP can run without making SSR or the host a browser', () => {
  expect(typeof window).toBe('undefined');
  expect(isNetworkOnline()).toBe(false);
  expect(isValidNetworkEnvironment()).toBe(false);
  let online = true;
  const dispose = setNativeNetworkEnvironment({ isOnline: () => online });
  try {
    expect(isNetworkOnline()).toBe(true);
    expect(isValidNetworkEnvironment()).toBe(true);
    expect(typeof window).toBe('undefined');
    online = false;
    expect(isNetworkOnline()).toBe(false);
  } finally {
    dispose();
  }
  expect(isNetworkOnline()).toBe(false);
});

test('disposing an old host does not disconnect its replacement', () => {
  const old = setNativeNetworkEnvironment({ isOnline: () => false });
  const current = setNativeNetworkEnvironment({ isOnline: () => true });
  old();
  try {
    expect(isNetworkOnline()).toBe(true);
  } finally {
    current();
  }
});

test('URL diagnostics support an environment without window', () => {
  expect(stripOrigin('/signed-out')).toBe('/signed-out');
  expect(stripOrigin(new URL('https://example.com/signed-out'))).toBe('/signed-out');
  expect(toURL('https://example.com/signed-out').pathname).toBe('/signed-out');
});

test('native activity tracks lifecycle without browser globals', () => {
  let active = true;
  const dispose = setNativeNetworkEnvironment({ isOnline: () => true, isActive: () => active });
  try {
    expect(isNativeApplicationActive()).toBe(true);
    active = false;
    expect(isNativeApplicationActive()).toBe(false);
    expect(isNetworkOnline()).toBe(true);
  } finally {
    dispose();
  }
  expect(isNativeApplicationActive()).toBeUndefined();
});
