import { createHmac } from 'node:crypto';

import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { testAgainstRunningApps } from '../../testUtils';

// Must match the hardcoded secret in integration/templates/hono-vite/src/server/main.ts
const TEST_WEBHOOK_SECRET = 'whsec_dGVzdF9zaWduaW5nX3NlY3JldF8zMl9jaGFyc19sb25n';

function signPayload(msgId: string, timestamp: string, body: string): string {
  const secretBytes = Buffer.from(TEST_WEBHOOK_SECRET.replace('whsec_', ''), 'base64');
  const content = `${msgId}.${timestamp}.${body}`;
  const sig = createHmac('sha256', secretBytes).update(content).digest('base64');
  return `v1,${sig}`;
}

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'webhook verification tests for @hono',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test('valid webhook signature returns 200 with parsed event data', async () => {
      const body = JSON.stringify({ type: 'user.created', data: { id: 'user_123' } });
      const msgId = 'msg_test1';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = signPayload(msgId, timestamp, body);

      const url = new URL('/api/webhooks/clerk', app.serverUrl);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': msgId,
          'svix-timestamp': timestamp,
          'svix-signature': signature,
        },
        body,
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.type).toBe('user.created');
      expect(json.data.id).toBe('user_123');
    });

    test('invalid webhook signature returns 400', async () => {
      const body = JSON.stringify({ type: 'user.created', data: { id: 'user_123' } });
      const msgId = 'msg_test2';
      const timestamp = Math.floor(Date.now() / 1000).toString();

      const url = new URL('/api/webhooks/clerk', app.serverUrl);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': msgId,
          'svix-timestamp': timestamp,
          'svix-signature': 'v1,invalid_signature_here',
        },
        body,
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('missing webhook headers returns 400', async () => {
      const body = JSON.stringify({ type: 'user.created', data: { id: 'user_123' } });

      const url = new URL('/api/webhooks/clerk', app.serverUrl);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('tampered body returns 400', async () => {
      const originalBody = JSON.stringify({ type: 'user.created', data: { id: 'user_123' } });
      const msgId = 'msg_test4';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = signPayload(msgId, timestamp, originalBody);

      const tamperedBody = JSON.stringify({ type: 'user.created', data: { id: 'user_TAMPERED' } });

      const url = new URL('/api/webhooks/clerk', app.serverUrl);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': msgId,
          'svix-timestamp': timestamp,
          'svix-signature': signature,
        },
        body: tamperedBody,
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  },
);
