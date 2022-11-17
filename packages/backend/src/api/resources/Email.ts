import type { EmailJSON } from './JSON';

export class Email {
  constructor(
    readonly id: string,
    readonly fromEmailName: string,
    readonly emailAddressId: string | null,
    readonly toEmailAddress?: string,
    readonly subject?: string,
    readonly body?: string,
    readonly status?: string,
  ) {}

  static fromJSON(data: EmailJSON): Email {
    return new Email(
      data.id,
      data.from_email_name,
      data.email_address_id,
      data.to_email_address,
      data.subject,
      data.body,
      data.status,
    );
  }
}
