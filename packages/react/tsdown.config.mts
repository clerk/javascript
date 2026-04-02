import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parse as parseYaml } from 'yaml';
import { defineConfig, type Options } from 'tsdown';

import clerkJsPkgJson from '../clerk-js/package.json' with { type: 'json' };
import pkgJson from './package.json' with { type: 'json' };
import { parseRangeToBounds, type VersionBounds } from './build-utils/parseVersionRange.ts';

/**
 * Resolves the React peer dependency range from package.json.
 * If it's a catalog reference (catalog:XXX), looks it up in pnpm-workspace.yaml.
 * Otherwise, parses the range string directly.
 */
function getClerkUISupportedReactBounds(): VersionBounds[] {
  const reactPeerDep = pkgJson.peerDependencies.react;

  let rangeStr: string;

  // Check if it's a catalog reference (e.g., "catalog:peer-react")
  const catalogMatch = reactPeerDep.match(/^catalog:(.+)$/);
  if (catalogMatch) {
    const catalogName = catalogMatch[1];

    // Read the version range from pnpm-workspace.yaml
    const workspaceYamlPath = fileURLToPath(new URL('../../pnpm-workspace.yaml', import.meta.url));
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

export default defineConfig((overrideOptions: Options) => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;
  const clerkUISupportedReactBounds = getClerkUISupportedReactBounds();

  return {
    entry: {
      index: 'src/index.ts',
      internal: 'src/internal.ts',
      errors: 'src/errors.ts',
      experimental: 'src/experimental.ts',
      legacy: 'src/legacy.ts',
      types: 'src/types/index.ts',
    },
    dts: {
      cjsReexport: true,
    },
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    format: ['cjs', 'esm'],
    clean: true,
    minify: false,
    sourcemap: true,
    external: ['react', 'react-dom'],
    // Bundle @clerk/ui/register inline at build time so consumers don't need
    // @clerk/ui as a dependency. The registration code sets up globalThis.__clerkSharedModules
    // to enable @clerk/ui's shared variant to use the host app's React.
    noExternal: ['@clerk/ui/register'],
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPkgJson.version}"`,
      __DEV__: `${isWatch}`,
      __CLERK_UI_SUPPORTED_REACT_BOUNDS__: JSON.stringify(clerkUISupportedReactBounds),
    },
  };
});
