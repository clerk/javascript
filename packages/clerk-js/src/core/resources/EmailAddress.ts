import { Poller } from '@clerk/shared/poller';
import type {
  AttemptEmailAddressVerificationParams,
  CreateEmailLinkFlowReturn,
  EmailAddressJSON,
  EmailAddressJSONSnapshot,
  EmailAddressResource,
  IdentificationLinkResource,
  PrepareEmailAddressVerificationParams,
  StartEmailLinkFlowParams,
  VerificationResource,
} from '@clerk/types';

import { clerkVerifyEmailAddressCalledBeforeCreate } from '../errors';
import { BaseResource, IdentificationLink, Verification } from './internal';

export class EmailAddress extends BaseResource implements EmailAddressResource {
  id!: string;
  emailAddress = '';
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
    const { run, stop } = Poller();

    const startEmailLinkFlow = async ({ redirectUrl }: StartEmailLinkFlowParams): Promise<EmailAddressResource> => {
      if (!this.id) {
        clerkVerifyEmailAddressCalledBeforeCreate('SignUp');
      }
      await this.prepareVerification({
        strategy: 'email_link',
        redirectUrl: redirectUrl,
      });
      return new Promise((resolve, reject) => {
        void run(() => {
          return this.reload()
            .then(res => {
              if (res.verification.status === 'verified') {
                stop();
                resolve(res);
              }
            })
            .catch(err => {
              stop();
              reject(err);
            });
        });
      });
    };
    return { startEmailLinkFlow, cancelEmailLinkFlow: stop };
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
    this.linkedTo = (data.linked_to || []).map(link => new IdentificationLink(link));
    return this;
  }

  public toSnapshot(): EmailAddressJSONSnapshot {
    return {
      object: 'email_address',
      id: this.id,
      email_address: this.emailAddress,
      verification: this.verification.toSnapshot(),
      linked_to: this.linkedTo.map(link => link.toSnapshot()),
    };
  }
}
