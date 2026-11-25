import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

type HookFormat = 'exit-code' | 'antigravity';

interface OxlintSpec {
  config: string;
  roots: string[];
}

const JS_TS_FILE = /\.(?:[cm]?[jt]sx?)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonObject(raw: string): Record<string, unknown> {
  if (!raw.trim()) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readStdin(): string {
  try {
    if (process.stdin.isTTY) {
      return '';
    }
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function exitClean(format: HookFormat): never {
  if (format === 'antigravity') {
    process.stdout.write('{}\n');
  }
  process.exit(0);
}

function exitBlocked(format: HookFormat, reason: string): never {
  if (format === 'antigravity') {
    process.stdout.write(`${JSON.stringify({ decision: 'continue', reason })}\n`);
    process.exit(0);
  }
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}

function readOxlintSpec(pkgDir: string): OxlintSpec | null {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    return null;
  }
  const pkgJson = parseJsonObject(fs.readFileSync(pkgJsonPath, 'utf8'));
  const scripts = isRecord(pkgJson.scripts) ? pkgJson.scripts : null;
  const lintScript = scripts && typeof scripts.lint === 'string' ? scripts.lint.trim() : '';
  const tokens = lintScript.split(/\s+/).filter(Boolean);
  if (tokens[0] !== 'oxlint') {
    return null;
  }
  const { values, positionals } = parseArgs({
    args: tokens.slice(1),
    options: {
      config: { type: 'string', short: 'c' },
    },
    allowPositionals: true,
    strict: false,
  });
  return {
    config: typeof values.config === 'string' && values.config ? values.config : 'oxlint.config.mjs',
    roots: positionals,
  };
}

function collectChangedPackageFiles(repoRoot: string, allowedPackages: Set<string> | null): Map<string, string[]> {
  const tracked = spawnSync('git', ['diff', '--name-only', '--diff-filter=d', 'HEAD', '--', 'packages'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'packages'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (tracked.status !== 0 || untracked.status !== 0) {
    const err = [tracked.stderr, untracked.stderr].filter(Boolean).join('\n').trim();
    throw new Error(err || 'Unable to list changed package files.');
  }

  const byPackage = new Map<string, string[]>();
  const changed = new Set([...splitLines(tracked.stdout), ...splitLines(untracked.stdout)]);
  for (const filePath of changed) {
    if (!JS_TS_FILE.test(filePath)) {
      continue;
    }
    const parts = filePath.split('/');
    if (parts.length < 3 || parts[0] !== 'packages') {
      continue;
    }
    const pkg = `${parts[0]}/${parts[1]}`;
    if (allowedPackages && !allowedPackages.has(pkg)) {
      continue;
    }
    const relPath = parts.slice(2).join('/');
    const existing = byPackage.get(pkg);
    if (existing) {
      existing.push(relPath);
    } else {
      byPackage.set(pkg, [relPath]);
    }
  }
  return byPackage;
}

const { values, positionals } = parseArgs({
  options: {
    format: { type: 'string', default: 'exit-code' },
  },
  allowPositionals: true,
});

const format: HookFormat = values.format === 'antigravity' ? 'antigravity' : 'exit-code';
const allowedPackages = positionals.length > 0 ? new Set(positionals) : null;
const payload = parseJsonObject(readStdin());

if (format === 'antigravity') {
  const terminationReason = typeof payload.terminationReason === 'string' ? payload.terminationReason : '';
  if ((terminationReason && terminationReason !== 'NO_TOOL_CALL') || payload.continuationActive === true) {
    exitClean(format);
  }
}

const startCwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
const rootResult = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: startCwd, encoding: 'utf8' });
if (rootResult.status !== 0) {
  if (format === 'antigravity') {
    exitClean(format);
  }
  process.stderr.write(rootResult.stderr || 'Unable to locate git repository root.\n');
  process.exit(2);
}

const repoRoot = rootResult.stdout.trim();
let changedByPackage: Map<string, string[]>;
try {
  changedByPackage = collectChangedPackageFiles(repoRoot, allowedPackages);
} catch (error) {
  exitBlocked(format, error instanceof Error ? error.message : String(error));
}

if (changedByPackage.size === 0) {
  exitClean(format);
}

const oxlintBin = path.join(repoRoot, 'node_modules', '.bin', 'oxlint');
const useLocalBin = fs.existsSync(oxlintBin);
const failures: string[] = [];

for (const [pkg, relPaths] of changedByPackage) {
  const pkgDir = path.join(repoRoot, pkg);
  const spec = readOxlintSpec(pkgDir);
  if (!spec) {
    continue;
  }

  const targetFiles =
    spec.roots.length > 0
      ? relPaths.filter(relPath => spec.roots.some(root => relPath === root || relPath.startsWith(`${root}/`)))
      : relPaths;

  if (targetFiles.length === 0) {
    continue;
  }

  const cmd = useLocalBin ? oxlintBin : 'pnpm';
  const args = useLocalBin
    ? ['--quiet', '-c', spec.config, ...targetFiles]
    : ['exec', 'oxlint', '--quiet', '-c', spec.config, ...targetFiles];
  const lintResult = spawnSync(cmd, args, { cwd: pkgDir, encoding: 'utf8' });

  if (lintResult.status !== 0) {
    const output = [lintResult.stdout, lintResult.stderr].filter(Boolean).join('\n').trim();
    failures.push(output ? `${pkg}:\n${output}` : `${pkg}: oxlint failed with exit code ${lintResult.status ?? 1}`);
  }
}

if (failures.length > 0) {
  exitBlocked(format, failures.join('\n\n'));
}

exitClean(format);
