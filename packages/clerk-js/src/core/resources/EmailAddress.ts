import { Poller } from '@clerk/shared/utils/poller';
import type {
  AttemptEmailAddressVerificationParams,
  CreateMagicLinkFlowReturn,
  EmailAddressJSON,
  EmailAddressResource,
  IdentificationLinkResource,
  PrepareEmailAddressVerificationParams,
  StartMagicLinkFlowParams,
  VerificationResource,
} from '@clerk/types';
import { clerkVerifyEmailAddressCalledBeforeCreate } from 'core/errors';

import { BaseResource, IdentificationLink, Verification } from './internal';

export class EmailAddress extends BaseResource implements EmailAddressResource {
  id!: string;
  emailAddress = '';
  linkedTo: IdentificationLinkResource[] = [];
  verification!: VerificationResource;

  public constructor(data: Partial<EmailAddressJSON>, pathRoot: string);
  public constructor(data: EmailAddressJSON, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  create(): Promise<this> {
    return this._basePost({
      body: { email_address: this.emailAddress },
    });
  }

  prepareVerification = (params?: PrepareEmailAddressVerificationParams): Promise<this> => {
    return this._basePost<EmailAddressJSON>({
      action: 'prepare_verification',
      body: { ...(params || { strategy: 'email_code' }) },
    });
  };

  attemptVerification = (params: AttemptEmailAddressVerificationParams): Promise<this> => {
    const { code } = params || {};
    return this._basePost<EmailAddressJSON>({
      action: 'attempt_verification',
      body: { code },
    });
  };

  createMagicLinkFlow = (): CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, EmailAddressResource> => {
    const { run, stop } = Poller();

    const startMagicLinkFlow = async ({ redirectUrl }: StartMagicLinkFlowParams): Promise<EmailAddressResource> => {
      if (!this.id) {
        clerkVerifyEmailAddressCalledBeforeCreate('SignUp');
      }
      await this.prepareVerification({
        strategy: 'email_link',
        redirect_url: redirectUrl,
      });
      return new Promise((resolve, reject) => {
        void run(() => {
          return this._baseGet({ forceUpdateClient: true })
            .then(async res => {
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
    return { startMagicLinkFlow, cancelMagicLinkFlow: stop };
  };

  destroy(): Promise<void> {
    return this._baseDelete();
  }

  toString(): string {
    return this.emailAddress;
  }

  protected fromJSON(data: EmailAddressJSON): this {
    this.id = data.id;
    this.emailAddress = data.email_address;
    this.verification = new Verification(data.verification);
    this.linkedTo = (data.linked_to || []).map(link => new IdentificationLink(link));
    return this;
  }
}
