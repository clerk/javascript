import type { EmailJSON } from './JSON';

export class Email {
  constructor(
    readonly id: string,
    readonly fromEmailName: string,
    readonly emailAddressId: string | null,
    readonly toEmailAddress?: string,
    readonly subject?: string,
    readonly body?: string,
    readonly bodyPlain?: string | null,
    readonly status?: string,
    readonly slug?: string | null,
    readonly data?: Record<string, any> | null,
    readonly deliveredByClerk?: boolean,
  ) {}

  static fromJSON(data: EmailJSON): Email {
    return new Email(
      data.id,
      data.from_email_name,
      data.email_address_id,
      data.to_email_address,
      data.subject,
      data.body,
      data.body_plain,
      data.status,
      data.slug,
      data.data,
      data.delivered_by_clerk,
    );
  }
}
