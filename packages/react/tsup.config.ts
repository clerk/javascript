import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse as parseYaml } from 'yaml';
import { defineConfig } from 'tsup';

import { version as clerkJsVersion } from '../clerk-js/package.json';
import { name, version, peerDependencies } from './package.json';
import { parseRangeToBounds } from './build-utils/parseVersionRange';

/**
 * Resolves the React peer dependency range from package.json.
 * If it's a catalog reference (catalog:XXX), looks it up in pnpm-workspace.yaml.
 * Otherwise, parses the range string directly.
 */
function getClerkUiSupportedReactBounds(): VersionBounds[] {
  const reactPeerDep = peerDependencies.react;

  let rangeStr: string;

  // Check if it's a catalog reference (e.g., "catalog:peer-react")
  const catalogMatch = reactPeerDep.match(/^catalog:(.+)$/);
  if (catalogMatch) {
    const catalogName = catalogMatch[1];

    // Read the version range from pnpm-workspace.yaml
    const workspaceYamlPath = resolve(__dirname, '../../pnpm-workspace.yaml');
    let workspaceYaml: string;
    try {
      workspaceYaml = readFileSync(workspaceYamlPath, 'utf-8');
    } catch (err) {
      throw new Error(`[@clerk/react] Failed to read pnpm-workspace.yaml: ${err}`);
    }

    const workspace = parseYaml(workspaceYaml);
    const catalogRange = workspace?.catalogs?.[catalogName]?.react;
    if (!catalogRange) {
      throw new Error(`[@clerk/react] Could not find react version in catalog "${catalogName}" in pnpm-workspace.yaml`);
    }
    rangeStr = catalogRange;
  } else {
    // Not a catalog reference - use the value directly as a version range
    rangeStr = reactPeerDep;
  }

  const bounds = parseRangeToBounds(rangeStr);

  if (bounds.length === 0) {
    throw new Error(`[@clerk/react] Failed to parse any version bounds from range: ${rangeStr}`);
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
