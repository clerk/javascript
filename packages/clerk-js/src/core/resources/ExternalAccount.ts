import { titleize } from '@clerk/shared/utils/string';
import type {
  ExternalAccountJSON,
  ExternalAccountResource,
  OAuthProvider,
} from '@clerk/types';

export class ExternalAccount implements ExternalAccountResource {
  id: string;
  provider: OAuthProvider;
  externalId: string;
  emailAddress: string;
  approvedScopes: string;
  firstName: string;
  lastName: string;
  picture: string;

  constructor(extAccProps: ExternalAccountResource) {
    this.id = extAccProps.id;
    this.provider = extAccProps.provider;
    this.externalId = extAccProps.externalId;
    this.emailAddress = extAccProps.emailAddress;
    this.approvedScopes = extAccProps.approvedScopes;
    this.firstName = extAccProps.firstName;
    this.lastName = extAccProps.lastName;
    this.picture = extAccProps.picture;
  }

  static fromJSON(data: ExternalAccountJSON): ExternalAccount {
    const obj = {} as ExternalAccountResource;

    // TODO: Remove the switch when we remove the deprecated payload
    switch (data.object) {
      case 'google_account':
        obj.id = data.id;
        obj.approvedScopes = data.approved_scopes;
        obj.emailAddress = data.email_address;
        obj.picture = data.picture;
        obj.firstName = data.given_name;
        obj.lastName = data.family_name;
        obj.provider = 'google' as OAuthProvider;
        break;
      case 'facebook_account':
        obj.id = data.id;
        obj.approvedScopes = data.approved_scopes;
        obj.emailAddress = data.email_address;
        obj.picture = data.picture;
        obj.firstName = data.first_name;
        obj.lastName = data.last_name;
        obj.provider = 'facebook' as OAuthProvider;
        break;
      case 'external_account':
        obj.id = data.identification_id;
        obj.approvedScopes = data.approved_scopes;
        obj.emailAddress = data.email_address;
        obj.picture = data.avatar_url;
        obj.firstName = data.first_name;
        obj.lastName = data.last_name;
        obj.provider = data.provider.replace('oauth_', '') as OAuthProvider;
    }

    // TODO: Make external account payload generic to avoid the following hack
    //
    // The data.object is set to `google|facebook|*_account`. First, we extract
    // the provider part (google, facebook, etc...) and then we constract the
    // ${provider}_id key in order to set the externalId.
    // @ts-ignore
    obj.externalId = data.provider_user_id || data[`${obj.provider}_id`];

    return new ExternalAccount(obj);
  }

  providerTitle(): string {
    return [titleize(this.provider), 'Account'].join(' ');
  }
}
