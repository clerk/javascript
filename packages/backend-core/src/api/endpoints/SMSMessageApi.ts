import { SMSMessage } from '../resources/SMSMessage';
import { AbstractAPI } from './AbstractApi';

const basePath = '/sms_messages';

type SMSParams = {
  phoneNumberId: string;
  message: string;
};

export class SMSMessageAPI extends AbstractAPI {
  public async createSMSMessage(params: SMSParams) {
    return this.APIClient.request<SMSMessage>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
