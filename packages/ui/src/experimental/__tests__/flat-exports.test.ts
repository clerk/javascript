import { describe, expect, it } from 'vitest';

import * as experimental from '../index';

/**
 * The experimental entry must expose the composed profile API as flat named
 * exports (not a namespace object like `UserProfile.Account`). Flat names are
 * what let consumers render these inside a React Server Component tree without
 * adding their own `'use client'` boundary — each named export of a `'use client'`
 * module becomes its own client reference, whereas property access on a namespace
 * object does not.
 */

describe('@clerk/ui/experimental flat exports', () => {
  it('exposes a stable set of flat named exports', () => {
    expect(Object.keys(experimental).sort()).toMatchSnapshot();
  });

  it('exports every name as a component', () => {
    for (const [name, value] of Object.entries(experimental)) {
      expect(typeof value, name).toBe('function');
    }
  });

  it('does not export the compound namespace objects', () => {
    expect((experimental as Record<string, unknown>).UserProfile).toBeUndefined();
    expect((experimental as Record<string, unknown>).OrganizationProfile).toBeUndefined();
  });
});
