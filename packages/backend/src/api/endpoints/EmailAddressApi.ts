import { joinPaths } from '../../util/path';
import type { DeletedObject, EmailAddress } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/email_addresses';

type CreateEmailAddressParams = {
  userId: string;
  emailAddress: string;
  verified?: boolean;
  primary?: boolean;
};

type UpdateEmailAddressParams = {
  verified?: boolean;
  primary?: boolean;
};

export class EmailAddressAPI extends AbstractAPI {
  public async getEmailAddress(emailAddressId: string) {
    this.requireId(emailAddressId);

    return this.request<EmailAddress>({
      method: 'GET',
      path: joinPaths(basePath, emailAddressId),
    });
  }

  public async createEmailAddress(params: CreateEmailAddressParams) {
    return this.request<EmailAddress>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateEmailAddress(emailAddressId: string, params: UpdateEmailAddressParams = {}) {
    this.requireId(emailAddressId);

    return this.request<EmailAddress>({
      method: 'PATCH',
      path: joinPaths(basePath, emailAddressId),
      bodyParams: params,
    });
  }

  public async deleteEmailAddress(emailAddressId: string) {
    this.requireId(emailAddressId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, emailAddressId),
    });
  }
}
