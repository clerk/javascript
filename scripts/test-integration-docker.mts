#!/usr/bin/env node

import playwrightPackageJson from '@playwright/test/package.json' with { type: 'json' };
import execa from 'execa';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import workspacePackageJson from '../package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_NODE_OPTIONS = '--max-old-space-size=4096';
const TURBO_CONCURRENCY = '1';

interface PackageJson {
  scripts?: Record<string, string>;
}

interface ParsedCli {
  testArgs: string[];
  testScript: string;
}

const usage = () => {
  console.log(`Usage:
  node scripts/test-integration-docker.mts [script|suffix] [-- playwright args...]

Examples:
  node scripts/test-integration-docker.mts
  node scripts/test-integration-docker.mts nextjs
  node scripts/test-integration-docker.mts test:integration:nextjs -- --project chromium
  node scripts/test-integration-docker.mts -- integration/tests/sign-in-flow.test.ts`);
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isErrorLike = (error: unknown): error is { message?: string; shortMessage?: string; stack?: string } => {
  return isRecord(error);
};

const parseCli = (rawArgs: string[]): ParsedCli => {
  const args = [...rawArgs];
  let testScript = 'test:integration:base';

  if (args.length > 0 && args[0] !== '--' && !args[0].startsWith('-')) {
    const requestedScript = args.shift()!;
    testScript = requestedScript.startsWith('test:integration:')
      ? requestedScript
      : `test:integration:${requestedScript}`;
  }

  if (args[0] === '--') {
    args.shift();
  }

  return { testArgs: args, testScript };
};

const isExistingPath = (repoRoot: string, repoRelativePath: string) => {
  const absolutePath = path.join(repoRoot, repoRelativePath);

  if (fs.existsSync(absolutePath)) {
    return true;
  }

  try {
    return fs.lstatSync(absolutePath).isSymbolicLink();
  } catch {
    return false;
  }
};

const isDependencyFile = (repoRelativePath: string) => {
  return (
    [
      '.npmrc',
      '.nvmrc',
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'turbo.json',
      'packages/shared/scripts/postinstall.mjs',
    ].includes(repoRelativePath) ||
    repoRelativePath.endsWith('/package.json') ||
    repoRelativePath.startsWith('patches/')
  );
};

const isBuildFile = (repoRelativePath: string) => {
  return (
    !repoRelativePath.startsWith('docs/') &&
    !repoRelativePath.startsWith('integration/') &&
    !repoRelativePath.startsWith('playground/')
  );
};

const copyFiles = async (repoRoot: string, files: string[], destination: string) => {
  await fsp.mkdir(destination, { recursive: true });

  for (const repoRelativePath of files) {
    const source = path.join(repoRoot, repoRelativePath);
    const target = path.join(destination, repoRelativePath);
    const stats = await fsp.lstat(source);

    await fsp.mkdir(path.dirname(target), { recursive: true });

    if (stats.isSymbolicLink()) {
      await fsp.symlink(await fsp.readlink(source), target);
      continue;
    }

    if (!stats.isFile()) {
      throw new Error(`unsupported git entry: ${repoRelativePath}`);
    }

    await fsp.copyFile(source, target);
    await fsp.chmod(target, stats.mode & 0o7777);
    await fsp.utimes(target, stats.atime, stats.mtime);
  }
};

const validateScript = (packageJson: PackageJson, scriptName: string) => {
  const scripts = packageJson.scripts || {};
  if (scriptName.startsWith('test:integration:') && scripts[scriptName]) {
    return;
  }

  const available = Object.keys(scripts)
    .filter(name => name.startsWith('test:integration:'))
    .sort();

  throw new Error(`Unknown integration script: ${scriptName}\nAvailable scripts:\n  ${available.join('\n  ')}`);
};

const dockerEnvArgs = (env: NodeJS.ProcessEnv) => {
  return Object.keys(env).flatMap(name => {
    if (name.startsWith('E2E_')) {
      return ['--env', name];
    }

    return [];
  });
};

const removeContainer = (containerId: string) => {
  try {
    execa.sync('docker', ['rm', '--force', containerId], { stdio: 'ignore' });
  } catch {
    // Best-effort cleanup only.
  }
};

const main = async () => {
  const rawArgs = process.argv.slice(2);

  if (rawArgs[0] === '-h' || rawArgs[0] === '--help') {
    usage();
    return 0;
  }

  const scriptDir = __dirname;
  const repoRoot = execa.sync('git', ['-C', scriptDir, 'rev-parse', '--show-toplevel']).stdout.trim();
  const dockerfilePath = path.join(scriptDir, 'test-integration.Dockerfile');

  if (!fs.existsSync(dockerfilePath)) {
    throw new Error(`missing Dockerfile: ${dockerfilePath}`);
  }

  process.chdir(repoRoot);

  const packageJson: PackageJson = workspacePackageJson;
  const { testArgs, testScript } = parseCli(rawArgs);
  validateScript(packageJson, testScript);

  for (const requiredFile of ['integration/.keys.json', 'integration/.env.local']) {
    if (!fs.existsSync(path.join(repoRoot, requiredFile))) {
      throw new Error(`missing ${requiredFile}; run pnpm integration:secrets first`);
    }
  }

  const playwrightVersion = playwrightPackageJson.version;
  const imageName = `clerk-javascript-integration:pw${playwrightVersion}`;
  const contextDir = await fsp.mkdtemp(path.join(process.env.TMPDIR || os.tmpdir(), 'clerk-integration-docker.'));
  let containerId = '';
  let cleanupCompleted = false;

  const cleanup = () => {
    if (cleanupCompleted) {
      return;
    }

    cleanupCompleted = true;

    if (containerId) {
      removeContainer(containerId);
    }

    fs.rmSync(contextDir, { force: true, recursive: true });
  };

  process.once('exit', cleanup);
  process.once('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.once('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });

  const trackedFilesOutput = execa.sync('git', ['ls-files', '-z', '--cached'], { cwd: repoRoot }).stdout;
  const trackedFiles = trackedFilesOutput
    .split('\0')
    .filter(Boolean)
    .filter(repoRelativePath => isExistingPath(repoRoot, repoRelativePath));
  const dependencyFiles = trackedFiles.filter(isDependencyFile);
  const buildFiles = trackedFiles.filter(isBuildFile);

  await copyFiles(repoRoot, trackedFiles, path.join(contextDir, 'repo'));
  await copyFiles(repoRoot, dependencyFiles, path.join(contextDir, 'deps'));
  await copyFiles(repoRoot, buildFiles, path.join(contextDir, 'build'));

  await execa(
    'docker',
    [
      'build',
      '--progress=plain',
      '--file',
      dockerfilePath,
      '--build-arg',
      `PLAYWRIGHT_VERSION=${playwrightVersion}`,
      '--build-arg',
      `BUILD_NODE_OPTIONS=${BUILD_NODE_OPTIONS}`,
      '--build-arg',
      `TURBO_CONCURRENCY=${TURBO_CONCURRENCY}`,
      '--tag',
      imageName,
      contextDir,
    ],
    {
      cwd: repoRoot,
      env: { ...process.env, DOCKER_BUILDKIT: '1' },
      stdio: 'inherit',
    },
  );

  const containerName = `clerk-integration-${testScript.replace(/:/g, '-')}-${Math.floor(Date.now() / 1000)}`;
  const containerArgs = [
    'create',
    '--name',
    containerName,
    '--network',
    'bridge',
    '--add-host',
    'host.docker.internal:127.0.0.1',
    '--add-host',
    'gateway.docker.internal:127.0.0.1',
    '--cap-drop',
    'ALL',
    '--env',
    'NODE_OPTIONS=--dns-result-order=ipv4first',
    '--security-opt',
    'no-new-privileges',
    '--shm-size',
    '2g',
    '--init',
    ...dockerEnvArgs(process.env),
    imageName,
    testScript,
    ...testArgs,
  ];

  containerId = (await execa('docker', containerArgs, { cwd: repoRoot })).stdout.trim();

  await execa('docker', ['cp', 'integration/.keys.json', `${containerId}:/workspace/integration/.keys.json`], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  await execa('docker', ['cp', 'integration/.env.local', `${containerId}:/workspace/integration/.env.local`], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  const result = await execa('docker', ['start', '--attach', '--interactive', containerId], {
    cwd: repoRoot,
    reject: false,
    stdio: 'inherit',
  });

  return result.exitCode ?? 1;
};

void main()
  .then(exitCode => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    process.exitCode = 1;

    if (isErrorLike(error)) {
      console.error(error.shortMessage || (error.message ? `error: ${error.message}` : String(error)));
      return;
    }

    console.error(error);
  });
