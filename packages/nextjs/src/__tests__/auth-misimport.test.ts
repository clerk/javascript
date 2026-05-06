import { describe, expect, it } from 'vitest';

import { auth } from '../server-only-stubs';

describe('auth misimport from @clerk/nextjs', () => {
  it('throws a descriptive error when called as a function', () => {
    expect(() => (auth as unknown as () => void)()).toThrow("Clerk: auth() was imported from '@clerk/nextjs'");
    expect(() => (auth as unknown as () => void)()).toThrow("import { auth } from '@clerk/nextjs/server'");
  });

  it('throws a descriptive error when accessing a property', () => {
    expect(() => (auth as unknown as Record<string, unknown>).protect).toThrow(
      "Clerk: auth was imported from '@clerk/nextjs'",
    );
    expect(() => (auth as unknown as Record<string, unknown>).protect).toThrow(
      "import { auth } from '@clerk/nextjs/server'",
    );
  });
});
