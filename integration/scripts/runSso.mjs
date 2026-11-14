import { randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

import { config } from 'dotenv';
import execa from 'execa';

import { getE2ERunToken } from '../testUtils/e2eRun.ts';

config({ path: resolve('integration/.env.local') });

const runKey = process.env.INTEGRATION_TEST_RUN_KEY || randomUUID();
const runId = getE2ERunToken(runKey);
const stateDir = resolve(tmpdir(), '.temp_integration', 'sso', runId);
const runtimePath = resolve(stateDir, 'runtime.json');
const docker = args => execa('docker', args, { timeout: 30_000 });

async function cleanup() {
  try {
    await readdir(stateDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  const failures = [];
  try {
    await execa('pnpm', ['test:integration:cleanup', '--output', resolve(stateDir, 'cleanup-results')], {
      stdio: 'inherit',
      timeout: 300_000,
      env: { INTEGRATION_TEST_RUN_KEY: runKey, E2E_CLEANUP_STALE_APPLICATIONS: '0' },
    });
  } catch (error) {
    failures.push(error);
  }

  try {
    const runtime = await readFile(runtimePath, 'utf8').catch(error => {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    });
    const containerId = runtime ? JSON.parse(runtime).containerId : `clerk-sso-${runId}`;
    const inspected = await docker(['inspect', containerId]).catch(error => {
      if (error.stderr?.includes('No such')) {
        return null;
      }
      throw error;
    });
    if (inspected) {
      const [container] = JSON.parse(inspected.stdout);
      if (container.Config.Labels?.['clerk.e2e.sso.run'] !== runId) {
        throw new Error('The container does not belong to this SSO test run.');
      }
      try {
        const logs = await docker(['logs', containerId]);
        await mkdir(resolve('integration/test-results'), { recursive: true });
        await writeFile(resolve('integration/test-results', `keycloak-${runId}.log`), logs.stdout + logs.stderr);
      } catch (error) {
        failures.push(error);
      }
      for (const args of [
        ['stop', '--time', '10', containerId],
        ['rm', '--force', containerId],
      ]) {
        try {
          await docker(args);
        } catch (error) {
          failures.push(error);
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      failures.push(error);
    }
  }

  if (failures.length) {
    throw new AggregateError(failures, `SSO cleanup failed. Retry with INTEGRATION_TEST_RUN_KEY=${runKey}.`);
  }
  await rm(stateDir, { recursive: true, force: true });
  console.log('SSO test resources removed.');
}

async function run() {
  if (!process.env.CLERK_PLATFORM_API_KEY) {
    throw new Error('Set CLERK_PLATFORM_API_KEY in integration/.env.local or the environment.');
  }
  await docker(['info', '--format', '{{.ServerVersion}}']);
  await mkdir(resolve(stateDir, '..'), { recursive: true, mode: 0o700 });
  await mkdir(stateDir, { mode: 0o700 });
  const adminPassword = randomUUID();
  const controller = new AbortController();
  let child;
  const interrupt = signal => {
    controller.abort();
    child?.kill(signal);
    process.exitCode = signal === 'SIGINT' ? 130 : 143;
  };
  const onInterrupt = () => interrupt('SIGINT');
  const onTerminate = () => interrupt('SIGTERM');
  process.on('SIGINT', onInterrupt);
  process.on('SIGTERM', onTerminate);

  try {
    const created = await execa(
      'docker',
      [
        'create',
        '--name',
        `clerk-sso-${runId}`,
        '--label',
        `clerk.e2e.sso.run=${runId}`,
        '--publish',
        '127.0.0.1::8080',
        '--publish',
        '127.0.0.1::9000',
        '--env',
        'KC_BOOTSTRAP_ADMIN_USERNAME=e2e-admin',
        '--env',
        'KC_BOOTSTRAP_ADMIN_PASSWORD',
        'quay.io/keycloak/keycloak:26.8.0',
        'start-dev',
        '--db=dev-mem',
        '--hostname-strict=false',
        '--health-enabled=true',
      ],
      { env: { KC_BOOTSTRAP_ADMIN_PASSWORD: adminPassword }, signal: controller.signal },
    );
    const containerId = created.stdout.trim();
    await writeFile(runtimePath, JSON.stringify({ containerId }), { mode: 0o600 });
    await docker(['start', containerId]);
    const [container] = JSON.parse((await docker(['inspect', containerId])).stdout);
    const port = name => {
      const binding = container.NetworkSettings.Ports[`${name}/tcp`]?.[0];
      if (binding?.HostIp !== '127.0.0.1') {
        throw new Error('Keycloak must be bound to the loopback interface.');
      }
      return binding.HostPort;
    };
    const baseUrl = `http://127.0.0.1:${port(8080)}`;
    const healthUrl = `http://127.0.0.1:${port(9000)}/health/ready`;
    const deadline = Date.now() + 120_000;
    while (true) {
      controller.signal.throwIfAborted();
      const ready = await fetch(healthUrl, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(2000)]),
      })
        .then(response => response.ok)
        .catch(() => false);
      if (ready) {
        break;
      }
      if (Date.now() >= deadline) {
        throw new Error('Keycloak did not become ready within 120 seconds.');
      }
      await setTimeout(250, undefined, { signal: controller.signal });
    }
    console.log(`Private Keycloak ready at ${baseUrl}.`);
    child = execa('pnpm', ['test:integration:base', '--grep', '@sso', '--project=chrome', ...process.argv.slice(2)], {
      stdio: 'inherit',
      reject: false,
      env: {
        INTEGRATION_TEST_RUN_KEY: runKey,
        E2E_APP_ID: 'react.vite.withSelfServeSso',
        E2E_KEYCLOAK_URL: baseUrl,
        E2E_KEYCLOAK_ADMIN_PASSWORD: adminPassword,
      },
    });
    const result = await child;
    process.exitCode ||= result.exitCode || (result.signal ? 1 : 0);
  } finally {
    await cleanup();
    process.off('SIGINT', onInterrupt);
    process.off('SIGTERM', onTerminate);
  }
}

try {
  if (process.argv[2] === '--cleanup') {
    if (!process.env.INTEGRATION_TEST_RUN_KEY) {
      throw new Error('Set INTEGRATION_TEST_RUN_KEY to the SSO test run to clean up.');
    }
    await cleanup();
  } else {
    await run();
  }
} catch (error) {
  console.error(error);
  process.exitCode ||= 1;
}
