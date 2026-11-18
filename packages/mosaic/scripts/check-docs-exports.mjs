import { existsSync, globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const packageDir = resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'));
const unpublished = new Set([
  'components/branding',
  'components/captcha',
  'components/clerk-logo',
  'components/scroll-area',
  'hooks/use-mosaic-environment',
  'hooks/use-mosaic-experimental',
  'hooks/use-mosaic-router',
  'hooks/use-mosaic-support-email',
]);
const docPath = /^src\/(?:(components|primitives)\/([a-z0-9-]+)\/\2|(hooks)\/(use-[a-z0-9-]+))\.doc\.ts$/;

const failures = [];
const docFiles = globSync('src/{components,primitives,hooks}/**/*.doc.ts', { cwd: packageDir })
  .map(file => file.replaceAll('\\', '/'))
  .sort();

for (const file of docFiles) {
  const match = docPath.exec(file);
  if (!match) {
    failures.push(`${file} is not at a documented location`);
    continue;
  }
  const folder = `${match[1] ?? match[3]}/${match[2] ?? match[4]}`;
  const { default: doc } = await import(pathToFileURL(resolve(packageDir, file)).href);
  const unit = 'parts' in doc ? folder : `hooks/${kebab(doc.name)}`;
  if (unpublished.has(folder)) {
    if (packageJson.exports[`./${unit}`]) {
      failures.push(`${unit} is not on the docs site but is exported`);
    }
    continue;
  }
  failures.push(...(await checkUnit(unit, doc)));
}

if (failures.length > 0) {
  throw new Error(`Documented Mosaic units do not resolve from @clerk/mosaic:\n  ${failures.join('\n  ')}`);
}

console.log(`✅ Every documented Mosaic unit imports from @clerk/mosaic/<kind>/<slug>`);

async function checkUnit(unit, doc) {
  const target = packageJson.exports[`./${unit}`];
  if (!target) {
    return [`${unit} has no "./${unit}" export`];
  }
  if (!existsSync(resolve(packageDir, target.types))) {
    return [`${unit} has no types at ${target.types}`];
  }
  const module = await import(`@clerk/mosaic/${unit}`);
  const names = 'parts' in doc ? Object.keys(doc.parts) : [doc.name];
  return names.filter(name => resolveName(module, name) === undefined).map(name => `${unit} does not export ${name}`);
}

function resolveName(module, name) {
  return name.split('.').reduce((value, key) => value?.[key], module);
}

function kebab(name) {
  return name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}
