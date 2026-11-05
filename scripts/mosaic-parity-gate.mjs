import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

const FEATURE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FEATURE_FILE = /^packages\/mosaic\/src\/features\/([a-z0-9]+(?:-[a-z0-9]+)*)\/.+/;

function reminder(features, review) {
  return [
    `Mosaic parity scope: ${features.join(', ')}.`,
    review ? 'For this requested review, follow' : 'If this work changes migrated behavior, follow',
    'packages/mosaic/docs/migration.md and packages/mosaic/docs/parity-audit.md.',
    'Use actual focused type and runtime results, and preserve the accepted decisions and classifications in those guides.',
    'This reminder is not parity evidence.',
  ].join(' ');
}

function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (mode === 'review') {
    if (args.length === 0 || args.some(name => !FEATURE_NAME.test(name))) {
      process.stderr.write('Usage: node scripts/mosaic-parity-gate.mjs review <feature-name> [feature-name ...]\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(`${reminder([...new Set(args)].sort(), true)}\n`);
    return;
  }
  if (mode !== 'write' || args.length > 0) {
    return;
  }

  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return;
  }
  if (
    !input ||
    typeof input.cwd !== 'string' ||
    !isAbsolute(input.cwd) ||
    input.cwd.includes('\0') ||
    !input.tool_input
  ) {
    return;
  }

  const tool = input.tool_input;
  let paths;
  if (input.tool_name === 'Write' || input.tool_name === 'Edit') {
    paths = typeof tool.file_path === 'string' ? [tool.file_path] : [];
  } else if (input.tool_name === 'apply_patch' && typeof tool.command === 'string') {
    const patch = tool.command.trim();
    if (!patch.startsWith('*** Begin Patch\n') || !patch.endsWith('\n*** End Patch')) {
      return;
    }
    paths = [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map(match => match[1]);
  } else {
    return;
  }
  if (paths.length === 0 || paths.some(path => path.includes('\0'))) {
    return;
  }

  const git = spawnSync('git', ['rev-parse', '--show-cdup'], { cwd: input.cwd, encoding: 'utf8' });
  if (git.status !== 0) {
    return;
  }
  const root = resolve(input.cwd, git.stdout.trim());
  const features = [
    ...new Set(
      paths.flatMap(path => {
        const feature = relative(root, resolve(input.cwd, path)).match(FEATURE_FILE)?.[1];
        return feature ? [feature] : [];
      }),
    ),
  ].sort();
  if (features.length > 0) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: reminder(features, false) },
      }),
    );
  }
}

main();
