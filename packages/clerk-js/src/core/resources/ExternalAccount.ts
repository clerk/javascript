import { titleize } from '@clerk/shared/utils/string';
import type { ExternalAccountJSON, ExternalAccountResource, OAuthProvider } from '@clerk/types';

import { BaseResource } from './Base';

export class ExternalAccount extends BaseResource implements ExternalAccountResource {
  id!: string;
  identificationId!: string;
  provider!: OAuthProvider;
  providerUserId = '';
  emailAddress = '';
  approvedScopes = '';
  firstName = '';
  lastName = '';
  avatarUrl = '';
  username = '';
  publicMetadata = {};
  label = '';

  public constructor(data: Partial<ExternalAccountJSON>, pathRoot: string);
  public constructor(data: ExternalAccountJSON, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  protected fromJSON(data: ExternalAccountJSON): this {
    this.id = data.id;
    this.identificationId = data.identification_id;
    this.providerUserId = data.provider_user_id;
    this.approvedScopes = data.approved_scopes;
    this.avatarUrl = data.avatar_url;
    this.emailAddress = data.email_address;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    // TODO: Send the provider name the `oauth` prefix from FAPI
    this.provider = (data.provider || '').replace('oauth_', '') as OAuthProvider;
    this.username = data.username;
    this.publicMetadata = data.public_metadata;
    this.label = data.label;
    return this;
  }

  providerSlug(): OAuthProvider {
    return this.provider;
  }

  providerTitle(): string {
    return [titleize(this.providerSlug()), 'Account'].join(' ');
  }
}
