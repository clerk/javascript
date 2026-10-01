import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { parseArgs, parseEnv } from 'node:util';

const keys = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'];

let args;
try {
  args = parseArgs({
    options: {
      id: { type: 'string' },
      description: { type: 'string' },
    },
    allowPositionals: true,
  });
} catch {
  console.error('Invalid arguments');
  process.exit(1);
}

const { id, description } = args.values;
const [source, target = 'packages/swingset/.env.local'] = args.positionals;
if (
  !source ||
  args.positionals.length > 2 ||
  !id ||
  !/^[A-Za-z0-9_-]+$/.test(id) ||
  !description?.trim() ||
  /[\r\n]/.test(description)
) {
  console.error('Usage: node add-instance-env.mjs <instance envfile> [target envfile] --id <id> --description <text>');
  process.exit(1);
}

let values;
try {
  values = parseEnv(readFileSync(source, 'utf8'));
} catch {
  console.error('Cannot read the instance key file');
  process.exit(1);
}

if (keys.some(key => !values[key]?.trim() || /[\r\n]/.test(values[key]))) {
  console.error('Instance key file must contain two nonempty single-line Clerk keys');
  process.exit(1);
}

let existing = Buffer.alloc(0);
try {
  if (existsSync(target)) {
    existing = readFileSync(target);
  }
} catch {
  console.error('Cannot read the target env file');
  process.exit(1);
}

const marker = `# mosaic-env: ${id}`;
if (existing.toString('utf8').split(/\r?\n/).includes(marker)) {
  console.log(`${id}: already present`);
  process.exit(0);
}

const separator = existing.length > 0 && existing.at(-1) !== 10 ? '\n' : '';
const block = `${separator}${marker}\n# ${description}\n${keys.map(key => `# ${key}=${values[key]}`).join('\n')}\n`;
try {
  appendFileSync(target, block, { mode: 0o600 });
} catch {
  console.error('Cannot update the target env file');
  process.exit(1);
}
console.log(`${id}: added`);
