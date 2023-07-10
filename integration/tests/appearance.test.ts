import { expect, test } from '@playwright/test';

import type { Application } from '../adapters/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('appearance prop', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.react.vite
      .clone()
      .addFile(
        'src/App.tsx',
        ({ tsx }) => tsx`
            import { SignIn, SignUp } from '@clerk/clerk-react';
            import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes';
            const themes = { shadesOfPurple, neobrutalism, dark };

            export default function App() {
              const elements = ['shadesOfPurple', 'neobrutalism', 'dark']
              // deterministic order
              .map(name => [name, themes[name]])
              .map(([name, theme]) => {
                return (
                  <div key={name}>
                    <h2>{name}</h2>
                    <SignIn appearance={{ baseTheme: theme }} />
                    <SignUp appearance={{ baseTheme: theme }} />
                  </div>
                );
              });
              return <main>{elements}</main>;
            }`,
      )
      .commit();
    await app.setup();
    await app.withEnv(appConfigs.instances.allEnabled);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('all @clerk/themes render', async ({ page }) => {
    const u = createTestUtils({ app, page });
    await u.page.goToStart();
    await u.po.signIn.waitForMounted();
    await u.po.signUp.waitForMounted();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
