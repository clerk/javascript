import { describe, expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Published CJS config plugin.
const clerkPlugin = require('../../app.plugin.js');

async function settings(contents, props = {}) {
  const config = clerkPlugin({ name: 'fixture', slug: 'fixture' }, { appleSignIn: false, ...props });
  const result = await config.mods.android.settingsGradle({
    ...config,
    modRequest: {},
    modResults: { language: 'groovy', contents },
  });
  return result.modResults.contents;
}

const original = `pluginManagement {
  includeBuild('react-native-gradle-plugin')
}
plugins { id('com.facebook.react.settings') }
rootProject.name = 'Fixture'
`;

describe('Android Kotlin metadata compiler configuration', () => {
  test('repeated prebuild preserves the original settings and installs one compiler override', async () => {
    const generated = await settings(original);
    expect(await settings(generated)).toBe(generated);
    expect(generated.match(/com.android.tools:r8:/g)).toHaveLength(1);
    expect(generated).toContain('com.android.tools:r8:9.1.43');
    expect(generated).toContain("includeBuild('react-native-gradle-plugin')");
    expect(generated).toContain("plugins { id('com.facebook.react.settings') }");
  });

  test('changing or disabling the compiler override only replaces Clerk-owned settings', async () => {
    const generated = await settings(original);
    const updated = await settings(generated, { androidR8Version: '9.4.17' });
    expect(updated).toContain('com.android.tools:r8:9.4.17');
    expect(updated).not.toContain('com.android.tools:r8:9.1.43');
    expect(await settings(updated, { androidR8Version: false })).toBe(original);
  });
});
