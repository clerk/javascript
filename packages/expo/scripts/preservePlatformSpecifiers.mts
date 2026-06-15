import fs from 'node:fs';

import type { Plugin } from 'rolldown';

const platformSuffixes = ['.ios', '.android', '.web', '.native'] as const;
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'] as const;

function hasPlatformSuffix(specifier: string) {
  return platformSuffixes.some(suffix => specifier.endsWith(suffix));
}

function hasSourceExtension(specifier: string) {
  return sourceExtensions.some(extension => specifier.endsWith(extension));
}

function hasPlatformSibling(id: string) {
  const extension = sourceExtensions.find(ext => id.endsWith(ext));

  if (!extension) {
    return false;
  }

  const basename = id.slice(0, -extension.length);
  const platformlessBasename = platformSuffixes.reduce(
    (current, suffix) => (current.endsWith(suffix) ? current.slice(0, -suffix.length) : current),
    basename,
  );

  return platformSuffixes.some(suffix => fs.existsSync(`${platformlessBasename}${suffix}${extension}`));
}

/**
 * Preserves Metro platform resolution for Expo's bundleless tsdown build.
 *
 * Rolldown's `preserveModules` output rewrites internal chunk imports to emitted
 * filenames, for example `../hooks/useSignInWithApple.js`. That bypasses Metro's
 * platform resolver, which needs the extensionless specifier so it can pick
 * `useSignInWithApple.ios.js`, `NativeClerkModule.web.js`, and similar files.
 *
 * This plugin only externalizes relative imports whose resolved source file has
 * a platform-specific sibling. Returning the original relative `source` as an
 * external id makes Rolldown render that specifier unchanged while all normal
 * internal imports continue to point at emitted `.js` chunks.
 */
export function preservePlatformSpecifiers(): Plugin {
  return {
    name: 'preserve-platform-specifiers',
    async resolveId(source, importer, options) {
      if (!importer || !source.startsWith('.') || hasSourceExtension(source) || hasPlatformSuffix(source)) {
        return null;
      }

      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });

      if (!resolved || resolved.external || !hasPlatformSibling(resolved.id)) {
        return null;
      }

      return { id: source, external: true };
    },
  };
}
