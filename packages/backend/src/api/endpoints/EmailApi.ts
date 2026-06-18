import type { Email } from '../resources/Email';
import { AbstractAPI } from './AbstractApi';

const basePath = '/email';

type Mailbox = {
  /**
   * Display name for the mailbox. Currently accepted by the API but not yet
   * rendered server-side, so it has no effect on the delivered email for now.
   */
  name?: string;
  address: string;
};

export type CreateEmailParams = {
  to: Mailbox;
  from: Mailbox;
  // Top-level camelCase keys are snake_cased automatically, so `replyTo` is
  // sent as `reply_to`.
  replyTo?: Mailbox;
  subject: string;
  html?: string;
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
