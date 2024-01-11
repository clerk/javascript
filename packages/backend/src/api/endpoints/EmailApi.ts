import { deprecated } from '@clerk/shared/deprecated';

import type { Email } from '../resources/Email';
import { AbstractAPI } from './AbstractApi';

type EmailParams = {
  fromEmailName: string;
  emailAddressId: string;
  subject: string;
  body: string;
};

const basePath = '/emails';

/**
 * @deprecated This endpoint is no longer available and the function will be removed in the next major version.
 */
export class EmailAPI extends AbstractAPI {
  /**
   * @deprecated This endpoint is no longer available and the function will be removed in the next major version.
   */
  public async createEmail(params: EmailParams) {
    deprecated(
      'EmailAPI.createEmail',
      'This endpoint is no longer available and the function will be removed in the next major version.',
    );
    return this.request<Email>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
