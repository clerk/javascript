import type {
  AttemptEmailAddressVerificationParams,
  CreateEmailLinkFlowReturn,
  CreateEnterpriseSSOLinkFlowReturn,
  EmailAddressJSON,
  EmailAddressJSONSnapshot,
  EmailAddressResource,
  IdentificationLinkResource,
  PrepareEmailAddressVerificationParams,
  StartEmailLinkFlowParams,
  StartEnterpriseSSOLinkFlowParams,
  VerificationResource,
} from '@clerk/shared/types';

import { createVerificationFlow } from '../../utils/createVerificationFlow';
import { BaseResource, IdentificationLink, Verification } from './internal';

export class EmailAddress extends BaseResource implements EmailAddressResource {
  id!: string;
  emailAddress = '';
  matchesSsoConnection = false;
  linkedTo: IdentificationLinkResource[] = [];
  verification!: VerificationResource;

  public constructor(data: Partial<EmailAddressJSON | EmailAddressJSONSnapshot>, pathRoot: string);
  public constructor(data: EmailAddressJSON | EmailAddressJSONSnapshot, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  create(): Promise<this> {
    return this._basePost({
      body: { email_address: this.emailAddress },
    });
  }

  prepareVerification = (params: PrepareEmailAddressVerificationParams): Promise<this> => {
    return this._basePost<EmailAddressJSON>({
      action: 'prepare_verification',
      coalesce: true,
      body: { ...params },
    });
  };

  attemptVerification = (params: AttemptEmailAddressVerificationParams): Promise<this> => {
    const { code } = params || {};
    return this._basePost<EmailAddressJSON>({
      action: 'attempt_verification',
      body: { code },
    });
  };

  createEmailLinkFlow = (): CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, EmailAddressResource> => {
    const flow = createVerificationFlow<StartEmailLinkFlowParams, EmailAddressResource>({
      prepare: ({ redirectUrl }) => this.prepareVerification({ strategy: 'email_link', redirectUrl }),
      reload: () => this.reload(),
      isComplete: resource => resource.verification.status === 'verified',
    });
    return { startEmailLinkFlow: flow.start, cancelEmailLinkFlow: flow.cancel };
  };

  createEnterpriseSSOLinkFlow = (): CreateEnterpriseSSOLinkFlowReturn<
    StartEnterpriseSSOLinkFlowParams,
    EmailAddressResource
  > => {
    const flow = createVerificationFlow<StartEnterpriseSSOLinkFlowParams, EmailAddressResource>({
      prepare: async ({ redirectUrl }) => {
        const response = await this.prepareVerification({ strategy: 'enterprise_sso', redirectUrl });
        if (!response.verification.externalVerificationRedirectURL) {
          throw Error('Unexpected: External verification redirect URL is missing');
        }
      },
      reload: () => this.reload(),
      isComplete: resource => resource.verification.status === 'verified',
    });
    return { startEnterpriseSSOLinkFlow: flow.start, cancelEnterpriseSSOLinkFlow: flow.cancel };
  };

  destroy = (): Promise<void> => this._baseDelete();

  toString = (): string => this.emailAddress;

  protected fromJSON(data: EmailAddressJSON | EmailAddressJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.emailAddress = data.email_address;
    this.verification = new Verification(data.verification);
    this.matchesSsoConnection = data.matches_sso_connection;
    this.linkedTo = (data.linked_to || []).map(link => new IdentificationLink(link));
    return this;
  }

  public __internal_toSnapshot(): EmailAddressJSONSnapshot {
    return {
      object: 'email_address',
      id: this.id,
      email_address: this.emailAddress,
      verification: this.verification.__internal_toSnapshot(),
      linked_to: this.linkedTo.map(link => link.__internal_toSnapshot()),
      matches_sso_connection: this.matchesSsoConnection,
    };
  }
}
