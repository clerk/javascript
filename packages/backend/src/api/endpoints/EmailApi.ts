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

export type CreateEmailParams = {
  /**
   * The recipient of the email. Currently only a single recipient is supported.
   */
  to: Mailbox;

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

  /**
   * The HTML body of the email. At least one of `html` and `text` must be
   * provided. If both are provided, the `html` version will take precedence.
   */
  html?: string;

  /**
   * The plain text body of the email. At least one of `html` and `text` must be
   * provided. If both are provided, the `html` version will take precedence.
   */
  text?: string;
};

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
    });
  }
}
