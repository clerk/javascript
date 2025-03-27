import { Webhook } from 'svix';

import type { WebhookEvent } from './api';

export type VerifyWebhookOptions = {
  signingSecret?: string;
};

export * from './api/resources/Webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param request - The incoming webhook request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom webhook secret. If not provided, falls back to CLERK_WEBHOOK_SECRET env variable
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
  const svixId = request.headers.get('svix-id') ?? '';
  const svixTimestamp = request.headers.get('svix-timestamp') ?? '';
  const svixSignature = request.headers.get('svix-signature') ?? '';

  const body = await request.text();

  const secret = options.signingSecret ?? process.env.CLERK_SIGNING_SECRET ?? '';
  const sivx = new Webhook(secret);

  return sivx.verify(body, {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': svixSignature,
  }) as WebhookEvent;
}
