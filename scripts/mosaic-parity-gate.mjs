import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PROOF_DIR = 'tmp/mosaic-parity';
export const MAX_BLOCKS = 3;

const FEATURE_MODEL = /^packages\/mosaic\/src\/features\/([a-z0-9-]+)\/\1\.model\.tsx?$/;
const FEATURE_FILE = /^packages\/mosaic\/src\/features\/([a-z0-9-]+)\//;

function pascalCase(kebab) {
  return kebab.replace(/(^|-)([a-z0-9])/g, (_, __, char) => char.toUpperCase());
}

export function legacyCounterparts(root, feature) {
  const name = pascalCase(feature);
  return [`packages/react/src/components/${name}.tsx`, `packages/ui/src/components/${name}`].filter(path =>
    existsSync(join(root, path)),
  );
}

export function proofPath(feature) {
  return `${PROOF_DIR}/${feature}.md`;
}

function section(text, heading) {
  const match = text.match(new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'im'));
  return match ? match[1].trim() : '';
}

export function inventoryProblem(proof, legacy) {
  if (!proof) {
    return 'missing';
  }
  const missing = legacy.filter(path => !proof.includes(path));
  if (missing.length > 0) {
    return `does not name ${missing.join(', ')}`;
  }
  return section(proof, 'Inventory') ? undefined : 'has no `## Inventory` section';
}

export function auditProblem(proof) {
  if (!proof) {
    return 'missing';
  }
  return section(proof, 'Parity audit') ? undefined : 'has no `## Parity audit` section';
}

export function createdFiles(input, root) {
  const tool = input.tool_input ?? {};
  const cwd = input.cwd ?? root;
  const toRepo = path => relative(root, isAbsolute(path) ? path : join(cwd, path));

  if (typeof tool.file_path === 'string') {
    return existsSync(isAbsolute(tool.file_path) ? tool.file_path : join(cwd, tool.file_path))
      ? []
      : [toRepo(tool.file_path)];
  }
  if (typeof tool.command === 'string') {
    return [...tool.command.matchAll(/^\*\*\* Add File: (.+)$/gm)].map(match => toRepo(match[1].trim()));
  }
  return [];
}

function run(args, cwd) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' }).stdout ?? '';
}

function readText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function newFeatures(root) {
  const base = run(['merge-base', 'HEAD', 'origin/main'], root).trim() || 'HEAD';
  const changed = `${run(['diff', '--name-only', '--diff-filter=d', base, '--', 'packages/mosaic/src/features'], root)}\n${run(['ls-files', '--others', '--exclude-standard', '--', 'packages/mosaic/src/features'], root)}`;
  const features = new Set(
    changed
      .split('\n')
      .map(file => file.match(FEATURE_FILE)?.[1])
      .filter(Boolean),
  );
  return [...features].filter(
    feature => !run(['ls-tree', '--name-only', base, `packages/mosaic/src/features/${feature}`], root).trim(),
  );
}

function beforeWrite(input, root) {
  const blocked = createdFiles(input, root).flatMap(file => {
    const feature = file.match(FEATURE_MODEL)?.[1];
    const legacy = feature ? legacyCounterparts(root, feature) : [];
    const problem = legacy.length > 0 ? inventoryProblem(readText(join(root, proofPath(feature))), legacy) : undefined;
    return problem ? [{ feature, legacy, problem }] : [];
  });

  if (blocked.length === 0) {
    return;
  }

  const reason = blocked
    .map(
      ({ feature, legacy, problem }) =>
        `\`${feature}\` ports ${legacy.join(' and ')}, and ${proofPath(feature)} ${problem}. Read the legacy component, then write ${proofPath(feature)} with the legacy path and an \`## Inventory\` section (one row per prop, default, guard, error path, loading state and click behavior), as packages/mosaic/docs/migration.md describes. Then retry this edit.`,
    )
    .join(' ');

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
    }),
  );
}

function beforeStop(input, root) {
  const unaudited = newFeatures(root).flatMap(feature => {
    const legacy = legacyCounterparts(root, feature);
    const problem = legacy.length > 0 ? auditProblem(readText(join(root, proofPath(feature)))) : undefined;
    return problem ? [{ feature, legacy, problem }] : [];
  });

  const stateDir = join(tmpdir(), 'clerk-mosaic-parity-gate');
  const statePath = join(stateDir, `${String(input.session_id ?? 'unknown').replace(/[^\w-]/g, '_')}.json`);

  if (unaudited.length === 0) {
    return;
  }

  let state;
  try {
    state = JSON.parse(readFileSync(statePath, 'utf8'));
  } catch {
    state = { blocks: 0 };
  }
  if (state.blocks >= MAX_BLOCKS) {
    return;
  }
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(statePath, JSON.stringify({ blocks: state.blocks + 1 }));

  const list = unaudited.map(
    ({ feature, legacy, problem }) => `${feature} (legacy: ${legacy.join(', ')}; ${proofPath(feature)} ${problem})`,
  );

  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: [
        `This branch adds Mosaic features that port a legacy component: ${list.join('; ')}.`,
        'Before finishing, run the parity audit in packages/mosaic/docs/parity-audit.md and put its table under `## Parity audit` in that file.',
        'Fix or raise with the user every row that breaks a Mosaic rule, and list the remaining differences in the PR description.',
      ].join(' '),
    }),
  );
}

function main() {
  const input = readInput();
  const root = run(['rev-parse', '--show-toplevel'], input.cwd ?? process.cwd()).trim();
  if (!root) {
    return;
  }
  if (process.argv[2] === 'write') {
    beforeWrite(input, root);
  } else if (process.argv[2] === 'stop') {
    beforeStop(input, root);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
