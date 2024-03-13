import type { AttributeMappingJSON } from './JSON';

export class AttributeMapping {
  constructor(
    readonly userId: string,
    readonly emailAddress: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {}

  static fromJSON(data: AttributeMappingJSON): AttributeMapping {
    return new AttributeMapping(data.user_id, data.email_address, data.first_name, data.last_name);
  }
}
