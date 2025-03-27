/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { FastifyRequest } from 'fastify';

import { fastifyRequestToRequest } from './utils';

// This should come first to avoid conflicts with
// the base package's verifyWebhook
export * from '@clerk/backend/webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param req - The incoming webhook Fastify standard Request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom webhook secret. If not provided, falls back to CLERK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @example
 * ```typescript
 * fastify.post('/api/webhooks', async (req, reply) => {
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
 *     return reply.status(200).send({ message: 'Success' });
 *   } catch (err) {
 *     console.error('Webhook verification failed:', err);
 *     return reply.status(400).send({ message: 'Webhook verification failed' });
 *   }
 * });
 * ```
 */
export async function verifyWebhook(req: FastifyRequest, options?: VerifyWebhookOptions) {
  const webRequest = fastifyRequestToRequest(req);
  return verifyWebhookBase(webRequest, options);
}
