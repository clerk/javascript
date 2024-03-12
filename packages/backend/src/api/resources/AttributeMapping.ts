import type { AttributeMappingJSON } from './JSON';

export class AttributeMapping {
  constructor(
    readonly user_id: string,
    readonly email_address: string,
    readonly first_name: string,
    readonly last_name: string,
  ) {}

  static fromJSON(data: AttributeMappingJSON): AttributeMapping {
    return new AttributeMapping(data.user_id, data.email_address, data.first_name, data.last_name);
  }
}
