import type { Email } from '../resources/Email';
import { AbstractAPI } from './AbstractApi';

const basePath = '/email';

/**
 * A subset of mailbox object as specified in RFC 5322 §3.4. Specifically, a
 * `name-addr` with an optional `display-name` and a required `addr-spec`.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc5322#section-3.4}
 */
type Mailbox = {
  /**
   * (Optional) Display name for the mailbox. Currently accepted by the API but
   * not yet rendered server-side, so it has no effect on the delivered email
   * for now.
   */
  name?: string;

  /**
   * The `addr-spec` of the mailbox, i.e. the email address itself.
   */
  address: string;
};

/**
 * The recipient of the email. Provide exactly one of the two mutually exclusive
 * forms:
 *
 * - a literal mailbox: an `address` (plus an optional `name`), or
 * - a `userId`: the ID of a Clerk user whose primary email address Clerk
 *   resolves server-side, from the instance the secret key belongs to.
 */
type EmailRecipient =
  | {
      /**
       * The `addr-spec` of the recipient mailbox, i.e. the email address itself.
       */
      address: string;
      /**
       * (Optional) Display name for the recipient mailbox. Currently accepted
       * by the API but not yet rendered server-side.
       */
      name?: string;
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
      name?: never;
    };

/**
 * The body of the email. At least one of `html` and `text` must be provided; if
 * both are provided, the `html` version takes precedence. Encoded as a union so
 * that omitting both is a compile-time error rather than a server-side one.
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
   * The recipient of the email. Currently only a single recipient is supported.
   * Provide either an `address` (with an optional `name`) or the `userId` of a
   * Clerk user; the two forms are mutually exclusive.
   */
  to: EmailRecipient;

  /**
   * The sender of the email. See {@link Mailbox} for the accepted format. Note
   * that the API does not yet render the `name` field of the `from` mailbox.
   */
  from: Mailbox;

  /**
   * (Optional) The mailbox to include in the `reply-to` header of the email.
   */
  replyTo?: Mailbox;

  subject: string;
} & EmailContent;

export class EmailApi extends AbstractAPI {
  /**
   * @experimental This method calls an internal, not-yet-public endpoint and is
   * subject to change. It is advised to [pin](https://clerk.com/docs/pinning)
   * the SDK version to avoid breaking changes.
   *
   * Sends a transactional email.
   */
  public async create(params: CreateEmailParams) {
    return this.request<Email>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
      options: {
        // Snakecase nested keys too, so a `to: { userId }` recipient is sent as
        // `to: { user_id }` on the wire (the default only snakecases top-level
        // keys, which would leave the nested `userId` untouched).
        deepSnakecaseBodyParamKeys: true,
      },
    });
  }
}
