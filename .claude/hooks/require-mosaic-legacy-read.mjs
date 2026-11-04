import { existsSync } from 'node:fs';
import { basename } from 'node:path';

import { legacyCounterparts, read, readInput, toolCalls } from './mosaic-hook-utils.mjs';

const input = readInput();
const filePath = input.tool_input?.file_path ?? '';
const newModel = filePath.match(/^(.*)\/packages\/mosaic\/src\/features\/([a-z0-9-]+)\/\2\.model\.tsx?$/);

if (input.tool_name !== 'Write' || !newModel || existsSync(filePath)) {
  process.exit(0);
}

const transcript = read(input.agent_transcript_path || input.transcript_path || '');

if (!transcript) {
  process.exit(0);
}

const touched = toolCalls(transcript)
  .filter(call => call.name !== 'Agent')
  .map(call => JSON.stringify(call.input ?? {}));
const unread = legacyCounterparts(newModel[1], newModel[2]).filter(
  path => !touched.some(input => input.includes(path)),
);

if (unread.length > 0) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: [
          `\`${basename(filePath)}\` has a legacy counterpart: ${unread.join(', ')}.`,
          'This is a migration. Read the counterpart and write the Phase 1 behavior inventory from packages/mosaic/docs/migration.md',
          '(one row per prop, default, guard, error path, loading state and click behavior) before writing the model, then retry.',
        ].join(' '),
      },
    }),
  );
}
