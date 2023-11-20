import type { SMSMessage } from '../resources/SMSMessage';
import { AbstractAPI } from './AbstractApi';

const basePath = '/sms_messages';

type SMSParams = {
  phoneNumberId: string;
  message: string;
};

/**
 * @deprecated This endpoint is no longer available and the function will be removed in the next major version.
 */
export class SMSMessageAPI extends AbstractAPI {
  /**
   * @deprecated This endpoint is no longer available and the function will be removed in the next major version.
   */
  public async createSMSMessage(params: SMSParams) {
    return this.request<SMSMessage>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
