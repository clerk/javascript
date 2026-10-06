import { test as base } from '@e2e-dev/mobile';

import type { PageObjects } from './page-objects/index.ts';
import { createPageObjects } from './page-objects/index.ts';
import type { TestUser } from './users.ts';
import { createTestUser, deleteTestUser } from './users.ts';

export const test = base.extend<{ po: PageObjects }>({
  po: async (fixtures, provide) => {
    await provide(createPageObjects(fixtures));
  },
});

export const testWithUser = test.extend<{ user: TestUser }>({
  user: async (_fixtures, provide) => {
    const user = await createTestUser();
    await provide(user);
    await deleteTestUser(user);
  },
});
