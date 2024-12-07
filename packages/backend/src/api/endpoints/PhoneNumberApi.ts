import { joinPaths } from '../../util/path';
import type { DeletedObject, PhoneNumber } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/phone_numbers';

type CreatePhoneNumberParams = {
  userId: string;
  phoneNumber: string;
  verified?: boolean;
  primary?: boolean;
  reserved_for_second_factor?: boolean;
};

type UpdatePhoneNumberParams = {
  verified?: boolean;
  primary?: boolean;
  reserved_for_second_factor?: boolean;
};

export class PhoneNumberAPI extends AbstractAPI {
  public async getPhoneNumber(phoneNumberId: string) {
    this.requireId(phoneNumberId);

    return this.request<PhoneNumber>({
      method: 'GET',
      path: joinPaths(basePath, phoneNumberId),
    });
  }

  public async createPhoneNumber(params: CreatePhoneNumberParams) {
    return this.request<PhoneNumber>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updatePhoneNumber(phoneNumberId: string, params: UpdatePhoneNumberParams = {}) {
    this.requireId(phoneNumberId);

    return this.request<PhoneNumber>({
      method: 'PATCH',
      path: joinPaths(basePath, phoneNumberId),
      bodyParams: params,
    });
  }

  public async deletePhoneNumber(phoneNumberId: string) {
    this.requireId(phoneNumberId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, phoneNumberId),
    });
  }
}
