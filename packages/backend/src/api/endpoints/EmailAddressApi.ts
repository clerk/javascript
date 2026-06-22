import { joinPaths } from '../../util/path';
import type { DeletedObject, EmailAddress } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/email_addresses';

/** @generateWithEmptyComment */
export type CreateEmailAddressParams = {
  /** The ID of the user to create the email address for. */
  userId: string;
  /** The email address to create. */
  emailAddress: string;
  /** Whether the email address should be verified. Defaults to `false`. */
  verified?: boolean;
  /** Whether the email address should be the primary email address. Defaults to `false`, unless it is the first email address added to the user. */
  primary?: boolean;
};

/** @inline */
export type UpdateEmailAddressParams = {
  /** Whether the email address should be verified. Defaults to `false`. */
  verified?: boolean;
  /** Whether the email address should be the primary email address. Defaults to `false`, unless it is the first email address added to the user. */
  primary?: boolean;
};

/** @generateWithEmptyComment */
export class EmailAddressAPI extends AbstractAPI {
  /**
   * Gets the given [`EmailAddress`](https://clerk.com/docs/reference/backend/types/backend-email-address).
   * @param emailAddressId - The ID of the email address to get.
   */
  public async getEmailAddress(emailAddressId: string) {
    this.requireId(emailAddressId);

    return this.request<EmailAddress>({
      method: 'GET',
      path: joinPaths(basePath, emailAddressId),
    });
  }

  /**
   * Creates a new email address for the given user.
   * @returns The created [`EmailAddress`](https://clerk.com/docs/reference/backend/types/backend-email-address) object.
   */
  public async createEmailAddress(params: CreateEmailAddressParams) {
    return this.request<EmailAddress>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Updates the given email address.
   * @param emailAddressId - The ID of the email address to update.
   * @param params - The parameters to update the email address.
   * @returns The updated [`EmailAddress`](https://clerk.com/docs/reference/backend/types/backend-email-address) object.
   */
  public async updateEmailAddress(emailAddressId: string, params: UpdateEmailAddressParams = {}) {
    this.requireId(emailAddressId);

    return this.request<EmailAddress>({
      method: 'PATCH',
      path: joinPaths(basePath, emailAddressId),
      bodyParams: params,
    });
  }

  /**
   * Deletes the given email address.
   * @param emailAddressId - The ID of the email address to delete.
   * @returns The deleted [`EmailAddress`](https://clerk.com/docs/reference/backend/types/backend-email-address) object.
   */
  public async deleteEmailAddress(emailAddressId: string) {
    this.requireId(emailAddressId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, emailAddressId),
    });
  }
}
