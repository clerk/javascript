import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
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
            import { SignIn, SignUp } from '@clerk/react';
            import { dark, neobrutalism, shadesOfPurple } from '@clerk/ui/themes';
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
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('all @clerk/themes render', async ({ page }) => {
    const u = createTestUtils({ app, page });
    await u.page.goToAppHome();
    await u.po.signIn.waitForMounted();
    await u.po.signUp.waitForMounted();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
