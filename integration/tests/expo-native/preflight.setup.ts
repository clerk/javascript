import { preflight, setupTest } from 'touchpress';

/**
 * Fails once, in about a second, when the project's device is not booted,
 * instead of once per spec at the end of the launch timeout. touchpress's own
 * `test` cannot run this, because its automatic `device` fixture would open the
 * session preflight exists to check for.
 */
setupTest('the project names a booted device', async ({ platform, app, readyWhen, deviceName, sessionPrefix }) => {
  const report = await preflight({ platform, app, readyWhen, deviceName, sessionPrefix });
  if (report.ok) {
    return;
  }
  throw new Error(report.problems.join('\n'));
});
