import { SMSMessage } from '../resources/SMSMessage';
import { AbstractApi } from './AbstractApi';

type SMSParams = {
  phoneNumberId: string;
  message: string;
};

export class SMSMessageApi extends AbstractApi {
  public async createSMSMessage(params: SMSParams) {
    return this._restClient.makeRequest<SMSMessage>({
      method: 'POST',
      path: '/sms_messages',
      bodyParams: params,
    });
  }
}
