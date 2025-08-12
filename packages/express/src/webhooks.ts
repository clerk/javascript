/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { Request as ExpressRequest } from 'express';

import { incomingMessageToRequest } from './utils';

// Ordering of exports matter here since
// we're overriding the base verifyWebhook
export * from '@clerk/backend/webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param request - The incoming webhook Express Request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom signing secret. If not provided, falls back to CLERK_WEBHOOK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @example
 * ```typescript
 * import { verifyWebhook } from '@clerk/express/webhooks';
 *
 * app.post('/api/webhooks', async (req, res) => {
 *   try {
 *     const evt = await verifyWebhook(req);
 *     // handle event
 *     res.send('Webhook received');
 *   } catch (err) {
 *     res.status(400).send('Webhook verification failed');
 *   }
 * });
 * ```
 *
 * @see {@link https://clerk.com/docs/webhooks/sync-data} to learn more about syncing Clerk data to your application using webhooks
 */
export async function verifyWebhook(req: ExpressRequest, options?: VerifyWebhookOptions) {
  const webRequest = incomingMessageToRequest(req);
  // Cloning instead of implementing the body inside incomingMessageToRequest
  // to make it more predictable
  // we must pass in body as string not as an Object or Buffer
  let serializedBody: string;
  if (typeof req.body === 'string') {
    serializedBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    serializedBody = req.body.toString('utf8');
  } else if (req.body === undefined || req.body === null) {
    serializedBody = '';
  } else {
    try {
      serializedBody = JSON.stringify(req.body);
    } catch (error) {
      throw new Error(`Failed to serialize request body: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  const clonedRequest = new Request(webRequest, {
    body: serializedBody,
  });
  return verifyWebhookBase(clonedRequest, options);
}
