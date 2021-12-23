import { Email } from '../resources/Email';
import { AbstractApi } from './AbstractApi';

type EmailParams = {
  fromEmailName: string;
  emailAddressId: string;
  subject: string;
  body: string;
};
export class EmailApi extends AbstractApi {
  public async createEmail(params: EmailParams) {
    return this._restClient.makeRequest<Email>({
      method: 'POST',
      path: '/emails',
      bodyParams: params,
    });
  }
}
