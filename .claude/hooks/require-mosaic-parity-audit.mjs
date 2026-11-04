import { legacyCounterparts, read, readInput, toolCalls } from './mosaic-hook-utils.mjs';

const input = readInput();

if (input.stop_hook_active) {
  process.exit(0);
}

const calls = toolCalls(read(input.transcript_path || ''));
const features = new Map();

for (const call of calls) {
  if (!['Write', 'Edit', 'MultiEdit'].includes(call.name)) {
    continue;
  }
  const match = String(call.input?.file_path ?? '').match(/^(.*)\/packages\/mosaic\/src\/features\/([a-z0-9-]+)\//);
  if (match) {
    features.set(match[2], match[1]);
  }
}

const migrations = [...features].flatMap(([feature, repoRoot]) =>
  legacyCounterparts(repoRoot, feature).map(legacy => ({ feature, legacy })),
);

const audited = calls.some(call => call.name === 'Agent' && /parity/i.test(JSON.stringify(call.input ?? {})));

if (migrations.length === 0 || audited) {
  process.exit(0);
}

const list = migrations.map(({ feature, legacy }) => `${feature} (legacy: ${legacy})`).join(', ');

process.stdout.write(
  JSON.stringify({
    decision: 'block',
    reason: [
      `This session changed Mosaic features with a legacy counterpart: ${list}.`,
      'Before finishing, launch the Explore subagent with the prompt in packages/mosaic/docs/parity-audit.md.',
      'Fix or raise with the user every row it reports as breaking a Mosaic rule, and list the remaining differences in the PR description.',
    ].join(' '),
  }),
);
