import { randomBytes } from 'node:crypto';

import { test as base } from '@e2e-dev/mobile';

import type { PageObjects } from './page-objects/index.ts';
import { createPageObjects } from './page-objects/index.ts';
import type { TestUser } from './types.ts';

function bapi(path: string, init: RequestInit) {
  return fetch(`${process.env.CLERK_API_URL ?? 'https://api.clerk.com'}/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`, 'Content-Type': 'application/json' },
  });
}

export const test = base.extend<{ po: PageObjects }>({
  po: async (fixtures, provide) => {
    await provide(createPageObjects(fixtures));
  },
});

export const testWithUser = test.extend<{ user: TestUser }>({
  user: async (_fixtures, provide) => {
    const suffix = randomBytes(4).toString('hex');
    const user = {
      email: `${suffix}+clerk_test@example.com`,
      password: `ClerkCI!${randomBytes(8).toString('hex')}Aa1`,
    };
    const response = await bapi('/users', {
      method: 'POST',
      body: JSON.stringify({ email_address: [user.email], username: `e2e_${suffix}`, password: user.password }),
    });
    if (!response.ok) {
      throw new Error(`BAPI user creation failed (HTTP ${response.status}): ${await response.text()}`);
    }
    const { id } = (await response.json()) as { id: string };
    await provide(user);
    await bapi(`/users/${id}`, { method: 'DELETE' });
  },
});
