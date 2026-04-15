/**
 * Tests for the withClerkAndroid sub-plugin in app.plugin.js.
 *
 * The plugin enqueues a mod into `config.mods.android.appBuildGradle`. We
 * call the plugin to enqueue, then invoke the queued mod directly with a
 * fake mod context. This is the standard expo plugin testing pattern and
 * avoids the need to mock @expo/config-plugins (which CommonJS requires
 * cannot be intercepted by vitest).
 */
import { describe, expect, test } from 'vitest';

const plugin = require('../../../app.plugin.js') as {
  withClerkAndroid: (config: any) => any;
};

const runWithClerkAndroid = (gradleContents: string) => {
  // The plugin returns a config that has mods.android.appBuildGradle queued.
  // We invoke that fn directly with a fake mod context.
  const config: any = {};
  const out = plugin.withClerkAndroid(config);
  const mod = out.mods.android.appBuildGradle;
  expect(typeof mod).toBe('function');

  const modContext = {
    modResults: { contents: gradleContents },
    modRequest: {},
  };
  return mod(modContext);
};

describe('withClerkAndroid', () => {
  test('adds META-INF exclusion to an existing packaging block', async () => {
    const result = await runWithClerkAndroid(`android {
    packaging {
        // existing
    }
}`);
    expect(result.modResults.contents).toContain("excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']");
    expect(result.modResults.contents).toContain('packaging {');
  });

  test('adds META-INF exclusion to an existing packagingOptions block (legacy AGP)', async () => {
    const result = await runWithClerkAndroid(`android {
    packagingOptions {
        // existing
    }
}`);
    expect(result.modResults.contents).toContain("excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']");
    expect(result.modResults.contents).toContain('packagingOptions {');
  });

  test('creates a new packaging block when neither exists', async () => {
    const result = await runWithClerkAndroid(`android {
    compileSdk 34
}`);
    expect(result.modResults.contents).toContain('packaging {');
    expect(result.modResults.contents).toContain('META-INF/versions/9/OSGI-INF/MANIFEST.MF');
  });

  test('adds -Xskip-metadata-version-check to an existing kotlinOptions block', async () => {
    const result = await runWithClerkAndroid(`android {
    kotlinOptions {
        jvmTarget = '17'
    }
}`);
    expect(result.modResults.contents).toContain("freeCompilerArgs += ['-Xskip-metadata-version-check']");
  });

  test('creates a new kotlinOptions block when missing', async () => {
    const result = await runWithClerkAndroid(`android {
    compileSdk 34
}`);
    expect(result.modResults.contents).toContain('kotlinOptions {');
    expect(result.modResults.contents).toContain("freeCompilerArgs += ['-Xskip-metadata-version-check']");
  });

  test('idempotency: a second run does not duplicate the additions', async () => {
    const original = `android {
    compileSdk 34
}`;
    const first = await runWithClerkAndroid(original);
    const second = await runWithClerkAndroid(first.modResults.contents);

    const occurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1;
    expect(occurrences(second.modResults.contents, "freeCompilerArgs += ['-Xskip-metadata-version-check']")).toBe(1);
    expect(occurrences(second.modResults.contents, 'META-INF/versions/9/OSGI-INF/MANIFEST.MF')).toBe(1);
  });
});
