import { existsSync, globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const packageDir = resolve(process.argv[2] ?? resolve(import.meta.dirname, '..'));
const packageJson = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'));
const unpublished = new Set([
  'components/branding',
  'components/captcha',
  'components/clerk-logo',
  'components/scroll-area',
]);
const docPath = /^src\/(components|primitives)\/([a-z0-9-]+)\/[a-z0-9-]+\.doc\.ts$/;

const failures = [];
const listedByUnit = new Map();
const docFiles = globSync('src/{components,primitives}/**/*.doc.ts', { cwd: packageDir })
  .map(file => file.replaceAll('\\', '/'))
  .sort();

for (const file of docFiles) {
  const match = docPath.exec(file);
  if (!match) {
    failures.push(`${file} is not at a documented location`);
    continue;
  }
  const unit = `${match[1]}/${match[2]}`;
  const { default: doc } = await import(pathToFileURL(resolve(packageDir, file)).href);
  if (!('parts' in doc)) {
    continue;
  }
  const listed = listedByUnit.get(unit) ?? new Set();
  for (const name of [...Object.keys(doc.parts), ...Object.keys(doc.exports ?? {})]) {
    listed.add(name);
  }
  listedByUnit.set(unit, listed);
}

for (const [unit, listed] of listedByUnit) {
  if (unpublished.has(unit)) {
    if (packageJson.exports[`./${unit}`]) {
      failures.push(`${unit} is not on the docs site but is exported`);
    }
    continue;
  }
  failures.push(...(await checkUnit(unit, listed)));
}

for (const subpath of Object.keys(packageJson.exports)) {
  const unit = subpath.slice(2);
  if (/^(components|primitives)\//.test(unit) && !listedByUnit.has(unit)) {
    failures.push(`${unit} is exported but has no doc`);
  }
}

if (failures.length > 0) {
  throw new Error(`Documented Mosaic units do not resolve from @clerk/mosaic:\n  ${failures.join('\n  ')}`);
}

console.log(`✅ Every documented Mosaic unit imports from @clerk/mosaic/<kind>/<slug>`);

async function checkUnit(unit, listed) {
  const target = packageJson.exports[`./${unit}`];
  if (!target) {
    return [`${unit} has no "./${unit}" export`];
  }
  if (!existsSync(resolve(packageDir, target.types))) {
    return [`${unit} has no types at ${target.types}`];
  }
  const module = await import(pathToFileURL(resolve(packageDir, target.import)).href);
  const exported = Object.entries(module).flatMap(([name, value]) =>
    isNamespace(value) ? Object.keys(value).map(member => `${name}.${member}`) : [name],
  );
  return [
    ...[...listed].filter(name => !exported.includes(name)).map(name => `${unit} does not export ${name}`),
    ...exported.filter(name => !listed.has(name)).map(name => `${unit} exports ${name}, which its doc does not list`),
  ];
}

function isNamespace(value) {
  return Object.prototype.toString.call(value) === '[object Module]';
}
