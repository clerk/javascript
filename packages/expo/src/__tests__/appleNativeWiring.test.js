import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

const packageRoot = join(__dirname, '..', '..');
const moduleConfig = JSON.parse(readFileSync(join(packageRoot, 'expo-module.config.json'), 'utf8'));
const podspec = readFileSync(join(packageRoot, 'ios', 'ClerkExpo.podspec'), 'utf8');
const swiftFiles = readdirSync(join(packageRoot, 'ios')).filter(file => file.endsWith('.swift'));

describe('apple native wiring', () => {
  test('registers the app delegate subscriber that forwards callback URLs to the native SDK', () => {
    expect(moduleConfig.apple.appDelegateSubscribers).toContain('ClerkAppDelegateSubscriber');
  });

  test.each([...moduleConfig.apple.modules, ...moduleConfig.apple.appDelegateSubscribers])(
    '%s has a matching Swift source file',
    className => {
      expect(swiftFiles.some(file => readFileSync(join(packageRoot, 'ios', file), 'utf8').includes(className))).toBe(
        true,
      );
    },
  );

  // A Swift file missing from source_files is not compiled, so anything it registers silently
  // disappears from the built pod.
  test.each(swiftFiles)('%s is compiled by the podspec', file => {
    expect(podspec).toContain(`"${file}"`);
  });
});
