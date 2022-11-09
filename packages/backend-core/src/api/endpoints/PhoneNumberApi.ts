import { AbstractAPI } from './AbstractApi';
import { DeletedObject, PhoneNumber } from '../resources';
import { joinPaths } from '../../util/path';

const basePath = '/phone_numbers';

type CreatePhoneNumberParams = {
  userId: string;
  phoneNumber: string;
  verified?: boolean;
  primary?: boolean;
};

type UpdatePhoneNumberParams = {
  verified?: boolean;
  primary?: boolean;
};

export class PhoneNumberAPI extends AbstractAPI {
  public async getPhoneNumber(phoneNumberId: string) {
    this.requireId(phoneNumberId);

    return this.APIClient.request<PhoneNumber>({
      method: 'GET',
      path: joinPaths(basePath, phoneNumberId),
    });
  }

  public async createPhoneNumber(params: CreatePhoneNumberParams) {
    return this.APIClient.request<PhoneNumber>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updatePhoneNumber(phoneNumberId: string, params: UpdatePhoneNumberParams = {}) {
    this.requireId(phoneNumberId);

    return this.APIClient.request<PhoneNumber>({
      method: 'PATCH',
      path: joinPaths(basePath, phoneNumberId),
      bodyParams: params,
    });
  }

  public async deletePhoneNumber(phoneNumberId: string) {
    this.requireId(phoneNumberId);

    return this.APIClient.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, phoneNumberId),
    });
  }
}
