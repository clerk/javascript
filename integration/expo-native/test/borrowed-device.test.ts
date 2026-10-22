import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, type TestContext } from 'node:test';
import type { DeviceProvider, DeviceRequest } from '@e2e-dev/mobile';
import { createAgentDeviceClient } from 'agent-device';
import { engineDevice } from '../specs/support/config.ts';

const UDID = 'FDF0CD9E-CF9E-42B6-AE3A-116A665F7EF3';

async function daemonWithAFallbackScreenshot(): Promise<{ readonly url: string; readonly close: () => void }> {
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk.toString()));
    req.on('end', () => {
      if (req.url?.startsWith('/agent-device/artifacts/') === true) {
        res.writeHead(200, { 'content-type': 'image/png' });
        res.end('png');
        return;
      }
      const id = req.url === '/agent-device/rpc' ? (JSON.parse(body) as { id: string }).id : null;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ jsonrpc: '2.0', id, result: { ok: true, data: { nodes: [], artifacts: [{ field: 'fallbackScreenshotPath', artifactType: 'screenshot', artifactId: 'fallback', fileName: 'snapshot-fallback.png' }] } } }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/agent-device`, close: () => server.close() };
}

describe('a borrowed device', () => {
  async function snapshotFrom(t: TestContext, env: Readonly<Record<string, string>>, dir: string) {
    const daemon = await daemonWithAFallbackScreenshot();
    t.after(daemon.close);
    const checkout = mkdtempSync(join(dir, 'checkout-'));
    const tokenFile = join(dir, 'token');
    writeFileSync(tokenFile, 'b'.repeat(64));
    const before = process.cwd();
    process.chdir(checkout);
    t.after(() => process.chdir(before));

    const provider = engineDevice({ kind: 'borrowed', id: UDID, daemonUrl: daemon.url, tokenFile }) as DeviceProvider;
    const lease = await provider.acquire({ env } as unknown as DeviceRequest);
    const client = createAgentDeviceClient({ ...lease.client, session: 'verify-ios-test', daemonBaseUrl: lease.daemon!.baseUrl, daemonAuthToken: lease.daemon!.authToken });
    return { snapshot: await client.capture.snapshot(), checkout };
  }

  it('puts a fallback screenshot of a remote snapshot in the agent-device state directory, not in the checkout', async (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-borrowed-'));
    const stateDir = join(dir, 'state');
    const { snapshot, checkout } = await snapshotFrom(t, { AGENT_DEVICE_STATE_DIR: stateDir }, dir);

    assert.equal(snapshot.fallbackScreenshotPath, join(stateDir, 'snapshot-fallback.png'));
    assert.deepEqual(readdirSync(stateDir), ['snapshot-fallback.png']);
    assert.deepEqual(readdirSync(checkout), []);
  });

  it('puts it in agent-device\'s default state directory when a person runs e2e without one', async (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-borrowed-'));
    const home = join(dir, 'home');
    const { snapshot, checkout } = await snapshotFrom(t, { HOME: home }, dir);

    assert.equal(snapshot.fallbackScreenshotPath, join(home, '.agent-device', 'snapshot-fallback.png'));
    assert.deepEqual(readdirSync(checkout), []);
  });
});
