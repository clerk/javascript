import { IdentificationLinkResource } from './identificationLink';
import { ClerkResource } from './resource';
import { EmailCodeStrategy, EmailLinkStrategy } from './strategies';
import { CreateMagicLinkFlowReturn, StartMagicLinkFlowParams, VerificationResource } from './verification';

export type EmailAddressVerificationStrategy = EmailCodeStrategy | EmailLinkStrategy;

export type PrepareEmailAddressVerificationParams =
  | {
      strategy: EmailCodeStrategy;
    }
  | {
      strategy: EmailLinkStrategy;
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
  prepareVerification: (params?: PrepareEmailAddressVerificationParams) => Promise<EmailAddressResource>;

  attemptVerification(code: string): Promise<EmailAddressResource>;
  attemptVerification(params: { code: string }): Promise<EmailAddressResource>;
  createMagicLinkFlow(): CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, EmailAddressResource>;

  destroy: () => Promise<void>;
}
