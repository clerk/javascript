import { IdentificationLinkResource } from './identificationLink';
import { ClerkResource } from './resource';
import { EmailCodeStrategy, EmailLinkStrategy } from './strategies';
import { CreateMagicLinkFlowReturn, StartMagicLinkFlowParams, VerificationResource } from './verification';

export type PrepareEmailAddressVerificationParams =
  | {
      strategy: EmailCodeStrategy;
    }
  | {
      strategy: EmailLinkStrategy;
      redirect_url: string;
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
  prepareVerification: (params?: PrepareEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  attemptVerification: (params: AttemptEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  createMagicLinkFlow: () => CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, EmailAddressResource>;
  destroy: () => Promise<void>;
}
