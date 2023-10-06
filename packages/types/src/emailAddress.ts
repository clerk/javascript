import type { IdentificationLinkResource } from './identificationLink';
import type { ClerkResource } from './resource';
import type { EmailCodeStrategy, EmailLinkStrategy } from './strategies';
import type { CreateMagicLinkFlowReturn, StartMagicLinkFlowParams } from './verification';
import type { CreateEmailLinkFlowReturn, StartEmailLinkFlowParams, VerificationResource } from './verification';

export type PrepareEmailAddressVerificationParams =
  | {
      strategy: EmailCodeStrategy;
    }
  | {
      strategy: EmailLinkStrategy;
      redirectUrl: string;
    };

export type AttemptEmailAddressVerificationParams = {
  code: string;
};

export interface EmailAddressResource extends ClerkResource {
  id: string;
  emailAddress: string;
  verification: VerificationResource;
  linkedTo: IdentificationLinkResource[];
  toString: () => string;
  prepareVerification: (params: PrepareEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  attemptVerification: (params: AttemptEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  /**
   *
   * @deprecated Use `createEmailLinkFlow` instead.
   */
  createMagicLinkFlow: () => CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, EmailAddressResource>;
  createEmailLinkFlow: () => CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, EmailAddressResource>;
  destroy: () => Promise<void>;
  create: () => Promise<EmailAddressResource>;
}
