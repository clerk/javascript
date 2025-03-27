import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { errorThrower } from 'src/util/shared';
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
 * @param options.signingSecret - Custom webhook secret. If not provided, falls back to CLERK_SIGNING_SECRET env variable
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
  const secret = options.signingSecret ?? getEnvVariable('CLERK_SIGNING_SECRET');

  if (!secret) {
    return errorThrower.throw('Missing signing secret. Please add it to your environment variables.');
  }

  const sivx = new Webhook(secret);

  const svixHeaders = getRequiredSvixHeadersOrThrow(request.headers);
  const body = await request.text();

  return sivx.verify(body, svixHeaders) as WebhookEvent;
}

function getRequiredSvixHeadersOrThrow(headers: Headers) {
  const svix_id = headers.get('svix-id') ?? '';
  const svix_timestamp = headers.get('svix-timestamp') ?? '';
  const svix_signature = headers.get('svix-signature') ?? '';

  const missingHeaders = ['svix-id', 'svix-timestamp', 'svix-signature'].filter(header => !headers.get(header));

  if (missingHeaders.length > 0) {
    return errorThrower.throw(`Missing required Svix headers: ${missingHeaders.join(', ')}`);
  }

  return {
    svix_id,
    svix_timestamp,
    svix_signature,
  };
}
