/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { FastifyRequest } from 'fastify';

import { fastifyRequestToRequest } from './utils';

// Ordering of exports matter here since
// we're overriding the base verifyWebhook
export * from '@clerk/backend/webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param req - The incoming webhook Fastify Request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom signing secret. If not provided, falls back to CLERK_WEBHOOK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @see {@link https://clerk.com/docs/webhooks/sync-data} to learn more about syncing Clerk data to your application using webhooks
 */
export async function verifyWebhook(req: FastifyRequest, options?: VerifyWebhookOptions) {
  const webRequest = fastifyRequestToRequest(req);
  // Cloning instead of implementing the body inside fastifyRequestToRequest
  // to make it more predictable
  const clonedRequest = new Request(webRequest, {
    body: JSON.stringify(req.body),
  });
  return verifyWebhookBase(clonedRequest, options);
}
