import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';

test.describe('Astro version compatibility @astro', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(120_000);

    app = await appConfigs.astro.node
      .clone()
      .setName('astro-node-v6-smoke')
      .addDependency('astro', '^6.4.8')
      .addDependency('@astrojs/node', '^9.5.5')
      .addDependency('@astrojs/react', '^4.4.2')
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withCustomRoles);
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('builds with Astro 6 and custom UserButton menu items', async () => {
    await app.build();

    expect(app.buildOutput).not.toContain('Illegal return statement');
  });
});
