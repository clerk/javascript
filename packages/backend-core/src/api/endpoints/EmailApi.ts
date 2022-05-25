import { Email } from '../resources/Email';
import { AbstractAPI } from './AbstractApi';

type EmailParams = {
  fromEmailName: string;
  emailAddressId: string;
  subject: string;
  body: string;
};

const basePath = '/emails';

export class EmailAPI extends AbstractAPI {
  public async createEmail(params: EmailParams) {
    return this.APIClient.request<Email>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
