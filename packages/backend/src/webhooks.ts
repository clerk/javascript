import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { errorThrower } from 'src/util/shared';
import { Webhook } from 'svix';

import type { WebhookEvent } from './api';

export type VerifyWebhookOptions = {
  signingSecret?: string;
};

export type { WebhookEvent };

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param request - The incoming webhook request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom signing secret. If not provided, falls back to CLERK_WEBHOOK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @example
 * ```typescript
 * try {
 *   const evt = await verifyWebhook(request);
 *
 *   // Access the event data
 *   const { id } = evt.data;
 *   const eventType = evt.type;
 *
 *   // Handle specific event types
 *   if (evt.type === 'user.created') {
 *     console.log('New user created:', evt.data.id);
 *     // Handle user creation
 *   }
 *
 *   return new Response('Success', { status: 200 });
 * } catch (err) {
 *   console.error('Webhook verification failed:', err);
 *   return new Response('Webhook verification failed', { status: 400 });
 * }
 * ```
 */
export async function verifyWebhook(request: Request, options: VerifyWebhookOptions = {}): Promise<WebhookEvent> {
  const secret = options.signingSecret ?? getEnvVariable('CLERK_WEBHOOK_SIGNING_SECRET');
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!secret) {
    return errorThrower.throw('Missing signing secret. Please add it to your environment variables.');
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    return errorThrower.throw('Missing required Svix headers.');
  }

  const sivx = new Webhook(secret);

  const body = await request.text();

  return sivx.verify(body, {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': svixSignature,
  }) as WebhookEvent;
}
