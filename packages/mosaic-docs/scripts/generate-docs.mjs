import { globSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOC_PATH = /^src\/(?:(components|primitives)\/[a-z0-9-]+\/([a-z0-9-]+)|(hooks)\/(use-[a-z0-9-]+))\.doc\.ts$/;
const EXCLUDED = new Set([
  'components/branding',
  'components/captcha',
  'components/clerk-logo',
  'components/scroll-area',
  'hooks/use-mosaic-environment',
  'hooks/use-mosaic-experimental',
  'hooks/use-mosaic-router',
  'hooks/use-mosaic-support-email',
]);

export function toEntries(paths) {
  const entries = paths.map(toPosix).map(path => {
    const match = DOC_PATH.exec(path);
    if (!match) {
      throw new Error(`Unexpected doc location: ${path}`);
    }
    const kind = match[1] ?? match[3];
    const slug = match[2] ?? match[4];
    return { kind, slug, path: path.replace(/\.ts$/, '') };
  });

  return entries
    .filter(({ kind, slug }) => !EXCLUDED.has(`${kind}/${slug}`))
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug));
}

export function renderModule(dir, entries) {
  const mosaicDir = toPosix(dir);
  const imports = entries.map((entry, index) => `import doc${index} from '${mosaicDir}/${entry.path}';`);
  const rows = entries.map((entry, index) => `  { kind: '${entry.kind}', slug: '${entry.slug}', doc: doc${index} },`);
  return [
    `import type { ComponentDoc, HookDoc } from '${mosaicDir}/src/docs-schema';`,
    ...imports,
    '',
    'type Props = Record<string, unknown>;',
    '',
    'export interface DocEntry {',
    "  kind: 'components' | 'primitives' | 'hooks';",
    '  slug: string;',
    '  doc: ComponentDoc<Record<string, Props>> | HookDoc<Props, Props>;',
    '}',
    '',
    'export const docEntries: DocEntry[] = [',
    ...rows,
    '];',
    '',
  ].join('\n');
}

function toPosix(path) {
  return path.replaceAll('\\', '/');
}

if (import.meta.main) {
  const mosaicDir = realpathSync(dirname(fileURLToPath(import.meta.resolve('@clerk/mosaic/package.json'))));
  const outFile = fileURLToPath(new URL('../src/generated/docs.ts', import.meta.url));
  const entries = toEntries(globSync('src/{components,primitives,hooks}/**/*.doc.ts', { cwd: mosaicDir }));
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, renderModule(relative(dirname(outFile), mosaicDir), entries));
  console.log(`Generated ${entries.length} docs`);
}
