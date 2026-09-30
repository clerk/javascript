import { chmodSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseEnv } from 'node:util';

const KEYS = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'];

const [instanceFile, targetFile = 'packages/swingset/.env.local'] = process.argv.slice(2);
if (!instanceFile) {
  console.error('Usage: node merge-instance-env.mjs <instance envfile> [target envfile]');
  process.exit(1);
}

let values;
try {
  values = parseEnv(readFileSync(instanceFile, 'utf8'));
} catch {
  console.error('Cannot read the instance key file');
  process.exit(1);
}
const missing = KEYS.filter(name => !values[name]?.trim());
if (missing.length > 0) {
  console.error(`Missing from the instance key file: ${missing.join(', ')}`);
  process.exit(1);
}

const privateDir = dirname(instanceFile);
const backupFile = join(privateDir, 'env-local.backup');
const absentMarker = join(privateDir, 'env-local.absent');
if (!existsSync(backupFile) && !existsSync(absentMarker)) {
  if (existsSync(targetFile)) {
    copyFileSync(targetFile, backupFile);
    chmodSync(backupFile, 0o600);
    console.log(`Backed up ${targetFile} to ${backupFile}`);
  } else {
    writeFileSync(absentMarker, '', { mode: 0o600 });
    console.log(`${targetFile} did not exist; recorded ${absentMarker}`);
  }
}

const lines = existsSync(targetFile) ? readFileSync(targetFile, 'utf8').split('\n') : [];
if (lines.at(-1) === '') {
  lines.pop();
}
for (const name of KEYS) {
  const assignment = `${name}=${values[name]}`;
  const pattern = new RegExp(`^\\s*(export\\s+)?${name}\\s*=`);
  const index = lines.findIndex(line => pattern.test(line));
  if (index === -1) {
    lines.push(assignment);
  } else {
    lines[index] = assignment;
  }
}
writeFileSync(targetFile, `${lines.join('\n')}\n`, { mode: 0o600 });
console.log(`Updated ${KEYS.join(' and ')} in ${targetFile}`);

const host = Buffer.from(values.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.replace(/^pk_(test|live)_/, ''), 'base64')
  .toString()
  .replace(/\$$/, '');
console.log(`Frontend API host: ${host}`);
