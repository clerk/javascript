import { IdentificationLinkResource } from './identificationLink';
import { ClerkResource } from './resource';
import {
  CreateMagicLinkFlowReturn,
  StartMagicLinkFlowParams,
  VerificationResource,
} from './verification';

export type EmailAddressVerificationStrategy = 'email_code' | 'email_link';

export type PrepareEmailAddressVerificationParams =
  | {
      strategy: Extract<EmailAddressVerificationStrategy, 'email_code'>;
    }
  | {
      strategy: Extract<EmailAddressVerificationStrategy, 'email_link'>;
      redirect_url: string;
    };

export type VerifyEmailAddressWithMagicLinkParams = {
  redirect_url: string;
  signal?: AbortSignal;
};

export interface EmailAddressResource extends ClerkResource {
  id: string;
  emailAddress: string;
  verification: VerificationResource;
  linkedTo: IdentificationLinkResource[];
  toString: () => string;
  prepareVerification: (
    params?: PrepareEmailAddressVerificationParams,
  ) => Promise<EmailAddressResource>;

  attemptVerification(code: string): Promise<EmailAddressResource>;
  attemptVerification(params: { code: string }): Promise<EmailAddressResource>;
  createMagicLinkFlow(): CreateMagicLinkFlowReturn<
    StartMagicLinkFlowParams,
    EmailAddressResource
  >;

  destroy: () => Promise<void>;
}
