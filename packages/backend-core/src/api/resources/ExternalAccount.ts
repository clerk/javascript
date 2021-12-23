import type { ExternalAccountJSON } from './JSON';
import { ObjectType } from './JSON';
import type { ExternalAccountProps } from './Props';

interface ExternalAccountPayload extends ExternalAccountProps {}

export interface ExternalAccount extends ExternalAccountPayload {}

export class ExternalAccount {
  static attributes = [
    'id',
    'provider',
    'externalId',
    'approvedScopes',
    'emailAddress',
    'firstName',
    'lastName',
    'picture',
  ];

  static defaults = {};

  constructor(data: Partial<ExternalAccountPayload> = {}) {
    Object.assign(this, ExternalAccount.defaults, data);
  }

  static fromJSON(data: ExternalAccountJSON): ExternalAccount {
    const obj = {} as ExternalAccountPayload;

    obj.id = data.id;
    obj.approvedScopes = data.approved_scopes;
    obj.emailAddress = data.email_address;

    switch (data.object) {
      case ObjectType.FacebookAccount: {
        obj.provider = 'facebook';
        const fbData = data;
        obj.externalId = fbData.facebook_id;
        obj.firstName = fbData.first_name;
        obj.lastName = fbData.last_name;
        obj.picture = data.picture;
        break;
      }
      case ObjectType.GoogleAccount: {
        obj.provider = 'google';
        const gData = data;
        obj.externalId = gData.google_id;
        obj.firstName = gData.given_name;
        obj.lastName = gData.family_name;
        obj.picture = data.picture;
        break;
      }
      case ObjectType.ExternalAccount: {
        obj.provider = data.provider;
        const extData = data;
        obj.externalId = extData.provider_user_id;
        obj.firstName = extData.first_name;
        obj.lastName = extData.last_name;
        obj.picture = extData.avatar_url;
        break;
      }
      default:
        throw new Error('Unsupported external account type');
    }

    return new ExternalAccount(obj);
  }
}
