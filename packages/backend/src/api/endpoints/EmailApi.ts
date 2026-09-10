import { parseError } from '@clerk/shared/error';
import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/shared/types';

import { Email } from '../resources/Email';
import type { EmailJSON } from '../resources/JSON';
import { AbstractAPI } from './AbstractApi';

const basePath = '/email';
const idempotencyKeyPattern = /^[a-zA-Z0-9_-]{1,255}$/;

/**
 * A mailbox address as specified by RFC 5322's `addr-spec`.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc5322#section-3.4}
 */
type Mailbox = {
  /**
   * The `addr-spec` of the mailbox, i.e. the email address itself.
   */
  address: string;
  /** Optional display name, up to 200 characters. */
  name?: string;
};

/**
 * The recipient of the email. Provide exactly one of the two mutually exclusive
 * forms:
 *
 * - a literal mailbox: an `address`, or
 * - a `userId`: the ID of a Clerk user whose primary email address Clerk
 *   resolves server-side, from the instance the secret key belongs to.
 */
type EmailRecipient =
  | {
      /**
       * The `addr-spec` of the recipient mailbox, i.e. the email address itself.
       */
      address: string;
      userId?: never;
    }
  | {
      /**
       * The ID of the Clerk user to send to. Clerk resolves the user's primary
       * email address from the instance context. Mutually exclusive with
       * `address`.
       */
      userId: string;
      address?: never;
    };

/**
 * The body of the email. At least one of `html` and `text` must be provided; if
 * both are provided, the `html` version takes precedence. Their combined UTF-8
 * encoding is limited to 50,000 bytes. Encoded as a union so that omitting both
 * is a compile-time error rather than a server-side one.
 */
type EmailContent =
  | {
      /**
       * The HTML body of the email. Takes precedence over `text` when both are
       * provided.
       */
      html: string;
      /**
       * (Optional) The plain text body of the email.
       */
      text?: string;
    }
  | {
      /**
       * (Optional) The HTML body of the email. Takes precedence over `text`
       * when both are provided.
       */
      html?: string;
      /**
       * The plain text body of the email.
       */
      text: string;
    };

export type CreateEmailParams = {
  /**
   * The primary recipient of the email. Use `cc` and `bcc` for additional recipients.
   * Provide either an `address` or the `userId` of a
   * Clerk user; the two forms are mutually exclusive.
   */
  to: EmailRecipient;

  /**
   * The sender of the email. Its domain must exactly match the instance's
   * verified production sending domain.
   */
  from: Mailbox;

  /**
   * (Optional) The mailbox to include in the `reply-to` header. It may use a
   * different domain from the verified sender. Receiving mail is not provided.
   */
  replyTo?: Mailbox;

  /** Maximum 998 characters. */
  subject: string;
  /** Additional recipients. Up to 50 total across to, cc, and bcc, without duplicates. */
  cc?: string[];
  bcc?: string[];
  /** Threading, unsubscribe, or custom X-* headers. Provider-control headers are prohibited. */
  headers?: Record<string, string>;
  /** Base64-encoded content. Up to 10 attachments and 1 MiB of combined decoded content. */
  attachments?: { filename: string; content: string }[];
} & EmailContent;

export type CreateEmailOptions = {
  /**
   * Deduplicates retries of the same logical send. Reuse a key only when the
   * recipient and content are identical; use one stable key per recipient when
   * fanning out a batch. Clerk durably returns the original email for the same
   * key and request, and returns a conflict if the key is reused with different
   * parameters. Without a key, each call is a distinct send and the SDK does
   * not retry an ambiguous POST. Keys may contain only ASCII letters, digits,
   * underscores, and hyphens, up to 255 characters.
   */
  idempotencyKey?: string;
};

export type CreateBatchEmailParams = CreateEmailParams & CreateEmailOptions;

export type BatchEmailResult =
  | { index: number; email: Email; errors?: never; statusCode: number; retryAfterSeconds?: never }
  | { index: number; email?: never; errors: ClerkAPIError[]; statusCode: number; retryAfterSeconds?: number };

type BatchEmailResultJSON = {
  index: number;
  email?: EmailJSON;
  errors?: ClerkAPIErrorJSON[];
  status_code: number;
  retry_after_seconds?: number;
};

function validateIdempotencyKey(idempotencyKey: string | undefined) {
  if (
    idempotencyKey !== undefined &&
    (typeof idempotencyKey !== 'string' || !idempotencyKeyPattern.test(idempotencyKey))
  ) {
    throw new Error(
      'Idempotency key must contain only ASCII letters, digits, underscores, and hyphens and cannot exceed 255 characters.',
    );
  }
}

function emailBody(params: CreateEmailParams) {
  const { to, replyTo, ...rest } = params;
  const { userId, ...recipient } = to;
  return {
    ...rest,
    to: { ...recipient, ...(userId !== undefined ? { user_id: userId } : {}) },
    ...(replyTo !== undefined ? { reply_to: replyTo } : {}),
  };
}

export class EmailApi extends AbstractAPI {
  /**
   * @experimental This method calls an internal, not-yet-public endpoint and is
   * subject to change. It is advised to [pin](https://clerk.com/docs/pinning)
   * the SDK version to avoid breaking changes.
   *
   * Sends a transactional email.
   *
   * @param params - The recipient, sender, subject, and content of the email.
   * @param options - Optional request settings, including an idempotency key.
   * @returns The stored email and its current send status.
   * @throws If the idempotency key does not match the supported format.
   * @example
   * ```ts
   * const email = await clerkClient.emails.create(
   *   {
   *     to: { address: 'customer@example.com' },
   *     from: { address: 'support@example.com' },
   *     subject: 'Your receipt',
   *     html: '<p>Thanks for your order.</p>',
   *   },
   *   { idempotencyKey: 'order_123_receipt' },
   * );
   * ```
   */
  public async create(params: CreateEmailParams, options: CreateEmailOptions = {}): Promise<Email> {
    const { idempotencyKey } = options;
    validateIdempotencyKey(idempotencyKey);

    return this.request<Email>({
      method: 'POST',
      path: basePath,
      bodyParams: emailBody(params),
      ...(idempotencyKey !== undefined ? { headerParams: { 'Idempotency-Key': idempotencyKey } } : {}),
    });
  }

  /**
   * @experimental Submit 1–100 emails, returning one result per input in order.
   * Each message commits independently. Use a stable `idempotencyKey` on each
   * item to safely retry an interrupted batch or retry through `emails.create`.
   * Item errors are returned alongside successes; request-level errors throw.
   */
  public async createBatch(messages: CreateBatchEmailParams[]): Promise<BatchEmailResult[]> {
    if (messages.length < 1 || messages.length > 100) {
      throw new Error('A batch must contain between 1 and 100 messages.');
    }
    for (const message of messages) {
      validateIdempotencyKey(message.idempotencyKey);
    }
    const results = await this.request<BatchEmailResultJSON[]>({
      method: 'POST',
      path: `${basePath}/batch`,
      bodyParams: {
        messages: messages.map(({ idempotencyKey, ...params }) => ({
          ...emailBody(params),
          ...(idempotencyKey !== undefined ? { idempotency_key: idempotencyKey } : {}),
        })),
      },
    });
    return results.map(result =>
      result.email
        ? { index: result.index, email: Email.fromJSON(result.email), statusCode: result.status_code }
        : {
            index: result.index,
            errors: (result.errors || []).map(parseError),
            statusCode: result.status_code,
            retryAfterSeconds: result.retry_after_seconds,
          },
    );
  }

  /**
   * Returns Clerk's stored send state for a transactional email. `accepted`
   * means the provider accepted the request; it does not prove delivery.
   *
   * @param emailId - The ID returned when the email was created.
   * @returns The stored email and its current send status.
   * @throws If `emailId` is empty.
   * @example
   * ```ts
   * const email = await clerkClient.emails.get('ema_123');
   * ```
   */
  public async get(emailId: string): Promise<Email> {
    this.requireId(emailId);
    return this.request<Email>({
      method: 'GET',
      path: `${basePath}/${emailId}`,
    });
  }
}
