import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const constants = await readFile(
  resolve(import.meta.dirname, '../../shared/src/internal/clerk-js/constants.ts'),
  'utf8',
);
const version = constants.match(/SUPPORTED_FAPI_VERSION = '([^']+)'/)?.[1];
if (!version) {
  throw new Error('Could not read SUPPORTED_FAPI_VERSION from @clerk/shared.');
}

const specPath = `fapi/${version}.yml`;
const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
const commits = await fetchOk(
  `https://api.github.com/repos/clerk/openapi-specs/commits?path=${specPath}&per_page=1`,
  headers,
).then(response => response.json());
const sha = commits[0]?.sha;
if (!sha) {
  throw new Error(`clerk/openapi-specs has no ${specPath}.`);
}

const spec = await fetchOk(`https://raw.githubusercontent.com/clerk/openapi-specs/${sha}/${specPath}`).then(response =>
  response.text(),
);
const target = resolve(import.meta.dirname, '../src/__tests__/feature/fapi-spec.yml');
await writeFile(target, `# clerk/openapi-specs@${sha} ${specPath}\n${spec}`);

console.log(`Synced ${specPath} at ${sha}`);

async function fetchOk(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  return response;
}
