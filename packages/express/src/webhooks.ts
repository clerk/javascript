/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { Request as ExpressRequest } from 'express';

import { incomingMessageToRequest } from './utils';

// This should come first to avoid conflicts with
// the base package's verifyWebhook
export * from '@clerk/backend/webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param request - The incoming webhook Express request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom webhook secret. If not provided, falls back to CLERK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @example
 * ```typescript
 * app.post('/api/webhooks', async (req, res) => {
 *   try {
 *     const evt = await verifyWebhook(req);
 *
 *     // Access the event data
 *     const { id } = evt.data;
 *     const eventType = evt.type;
 *
 *     // Handle specific event types
 *     if (evt.type === 'user.created') {
 *       console.log('New user created:', evt.data.id);
 *       // Handle user creation
 *     }
 *
 *     res.status(200).json({ message: 'Success' });
 *   } catch (err) {
 *     console.error('Webhook verification failed:', err);
 *     res.status(400).json({ message: 'Webhook verification failed' });
 *   }
 * });
 * ```
 */
export async function verifyWebhook(req: ExpressRequest, options?: VerifyWebhookOptions) {
  const webRequest = incomingMessageToRequest(req);
  return verifyWebhookBase(webRequest, options);
}
