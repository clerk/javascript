import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { coerce } from 'semver';
import { parse as parseYaml } from 'yaml';
import { defineConfig } from 'tsup';

import { version as clerkJsVersion } from '../clerk-js/package.json';
import { name, version } from './package.json';

// Version bounds format: [major, minMinor, maxMinor, minPatch]
// - maxMinor === -1 means "any minor" (caret range, e.g., ^18.0.0)
// - maxMinor === minMinor means "same minor only" (tilde range, e.g., ~19.0.3)
type VersionBounds = [major: number, minMinor: number, maxMinor: number, minPatch: number];

// Read supported React range from pnpm-workspace.yaml catalogs and parse into bounds
function getClerkUiSupportedReactBounds(): VersionBounds[] {
  const fallbackRange = '^18.0.0 || ^19.0.0';
  let rangeStr = fallbackRange;
  let usedFallback = false;

  try {
    const workspaceYamlPath = resolve(__dirname, '../../pnpm-workspace.yaml');
    const workspaceYaml = readFileSync(workspaceYamlPath, 'utf-8');
    const workspace = parseYaml(workspaceYaml);
    const catalogRange = workspace?.catalogs?.['peer-react']?.react;
    if (catalogRange) {
      rangeStr = catalogRange;
    } else {
      usedFallback = true;
    }
  } catch {
    usedFallback = true;
  }

  if (usedFallback) {
    console.warn(
      `[@clerk/react] Could not read React peer dependency range from pnpm-workspace.yaml, using fallback: ${fallbackRange}`,
    );
  }

  // Parse the range string into bounds
  const bounds: VersionBounds[] = [];
  const parts = rangeStr.split('||').map(s => s.trim());

  for (const part of parts) {
    if (part.startsWith('^')) {
      // Caret range: ^X.Y.Z means >= X.Y.Z and < (X+1).0.0
      const ver = coerce(part.slice(1));
      if (ver) {
        bounds.push([ver.major, ver.minor, -1, ver.patch]);
      }
    } else if (part.startsWith('~')) {
      // Tilde range: ~X.Y.Z means >= X.Y.Z and < X.(Y+1).0
      const ver = coerce(part.slice(1));
      if (ver) {
        bounds.push([ver.major, ver.minor, ver.minor, ver.patch]);
      }
    } else {
      // Exact version or other format - try to parse as caret
      const ver = coerce(part);
      if (ver) {
        bounds.push([ver.major, ver.minor, -1, ver.patch]);
      }
    }
  }

  return bounds;
}

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;
  const clerkUiSupportedReactBounds = getClerkUiSupportedReactBounds();

  return {
    entry: {
      index: 'src/index.ts',
      internal: 'src/internal.ts',
      errors: 'src/errors.ts',
      experimental: 'src/experimental.ts',
      legacy: 'src/legacy.ts',
    },
    dts: true,
    onSuccess: shouldPublish ? 'pnpm publish:local' : undefined,
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    external: ['react', 'react-dom'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${isWatch}`,
      __CLERK_UI_SUPPORTED_REACT_BOUNDS__: JSON.stringify(clerkUiSupportedReactBounds),
    },
  };
});
