/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { NextApiRequest } from 'next';

import { isNextRequest, isRequestWebAPI } from './server/headers-utils';
import type { GsspRequest, RequestLike } from './server/types';
// Ordering of exports matter here since
// we're overriding the base verifyWebhook
export * from '@clerk/backend/webhooks';

const SVIX_ID_HEADER = 'svix-id';
const SVIX_TIMESTAMP_HEADER = 'svix-timestamp';
const SVIX_SIGNATURE_HEADER = 'svix-signature';

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
 * import { verifyWebhook } from '@clerk/nextjs/webhooks';
 *
 * export async function POST(req: Request) {
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
 *     return new Response('Success', { status: 200 });
 *   } catch (err) {
 *     console.error('Webhook verification failed:', err);
 *     return new Response('Webhook verification failed', { status: 400 });
 *   }
 * }
 * ```
 */
export async function verifyWebhook(request: RequestLike, options?: VerifyWebhookOptions) {
  if (isNextRequest(request) || isRequestWebAPI(request)) {
    return verifyWebhookBase(request, options);
  }

  const webRequest = nextApiRequestToWebRequest(request);
  return verifyWebhookBase(webRequest, options);
}

function nextApiRequestToWebRequest(req: NextApiRequest | GsspRequest): Request {
  const headers = new Headers();
  headers.set(SVIX_ID_HEADER, req.headers[SVIX_ID_HEADER] as string);
  headers.set(SVIX_TIMESTAMP_HEADER, req.headers[SVIX_TIMESTAMP_HEADER] as string);
  headers.set(SVIX_SIGNATURE_HEADER, req.headers[SVIX_SIGNATURE_HEADER] as string);

  // Create a dummy URL since NextApiRequest doesn't have a full URL
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'clerk-dummy';
  const dummyOriginReqUrl = new URL(req.url || '', `${protocol}://${host}`);

  const body = 'body' in req && req.body ? JSON.stringify(req.body) : undefined;

  return new Request(dummyOriginReqUrl, {
    method: req.method || 'GET',
    headers,
    body,
  });
}
