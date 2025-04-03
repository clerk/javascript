import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { errorThrower } from 'src/util/shared';
import { Webhook } from 'svix';

import type { WebhookEvent } from './api/resources/Webhooks';

export type VerifyWebhookOptions = {
  signingSecret?: string;
};

const SVIX_ID_HEADER = 'svix-id';
const SVIX_TIMESTAMP_HEADER = 'svix-timestamp';
const SVIX_SIGNATURE_HEADER = 'svix-signature';

const REQUIRED_SVIX_HEADERS = [SVIX_ID_HEADER, SVIX_TIMESTAMP_HEADER, SVIX_SIGNATURE_HEADER] as const;

export * from './api/resources/Webhooks';

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
  const svixId = request.headers.get(SVIX_ID_HEADER);
  const svixTimestamp = request.headers.get(SVIX_TIMESTAMP_HEADER);
  const svixSignature = request.headers.get(SVIX_SIGNATURE_HEADER);

  if (!secret) {
    return errorThrower.throw(
      'Missing webhook signing secret. Set the CLERK_WEBHOOK_SIGNING_SECRET environment variable with the webhook secret from the Clerk Dashboard.',
    );
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    const missingHeaders = REQUIRED_SVIX_HEADERS.filter(header => !request.headers.has(header));
    return errorThrower.throw(`Missing required Svix headers: ${missingHeaders.join(', ')}`);
  }

  const sivx = new Webhook(secret);
  const body = await request.text();

  return sivx.verify(body, {
    [SVIX_ID_HEADER]: svixId,
    [SVIX_TIMESTAMP_HEADER]: svixTimestamp,
    [SVIX_SIGNATURE_HEADER]: svixSignature,
  }) as WebhookEvent;
}
