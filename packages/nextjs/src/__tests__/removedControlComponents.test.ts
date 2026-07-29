import { describe, expect, it } from 'vitest';

import { Protect, SignedIn, SignedOut } from '../removedControlComponents';

describe('removed control components', () => {
  it('throws a docs-linked error when SignedIn is rendered', () => {
    expect(() => SignedIn({ children: null })).toThrow(
      'Clerk: <SignedIn> is not available in @clerk/nextjs Core 3. Learn more at https://clerk.com/err/signed-in-signed-out-protect.',
    );
  });

  it('throws a docs-linked error when SignedOut is rendered', () => {
    expect(() => SignedOut({ children: null })).toThrow(
      'Clerk: <SignedOut> is not available in @clerk/nextjs Core 3. Learn more at https://clerk.com/err/signed-in-signed-out-protect.',
    );
  });

  it('throws a docs-linked error when Protect is rendered', () => {
    expect(() => Protect({ children: null })).toThrow(
      'Clerk: <Protect> is not available in @clerk/nextjs Core 3. Learn more at https://clerk.com/err/signed-in-signed-out-protect.',
    );
  });
});
